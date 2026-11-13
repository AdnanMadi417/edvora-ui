"use client";

import Card from "components/ub/data/cards/Card";
import React, { useState, useMemo, useEffect } from "react";
import { FilePlus } from "lucide-react";
import PipelineCard from "features/applications/partner/components/PipelineCard";

import { useRouter } from "next/navigation";
import api from "lib/useApi";
import { useMe } from "hooks/useMe";

import Button from "components/ub/core/buttons/Button";
import ApplicationFilterBar from "components/ub/navigation/controls/ApplicationFilterBar";
import ApplicationsTable from "features/applications/components/ApplicationsTable";
import DashboardHeader from "components/ub/dashboard/shared/DashboardHeader";
import TablePagination from "components/ub/data/tables/TablePagination";
import { getAsyncStatus } from "components/ub/feedback/states/AsyncStatus";

import { useUniversities } from "features/universities/hooks";
import { useAllStages, useAllStageStatuses } from "features/applications/hooks";
import { usePartnerApplications } from "features/applications/partner/hooks/usePartnerApplications";
import { isAdvisorAction } from "features/applications/stages";
import { unibexsVoice } from "lib/unibexsVoice";


const PartnerApplications = () => {
  const router = useRouter();
  const [partnerId, setPartnerId] = useState<string>("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { user } = useMe();
  const { universities } = useUniversities();
  const {
    stages,
    stagesLoading,
    stagesError,
    refetch: refetchStages,
  } = useAllStages();
  const { stageStatuses, stageStatusesLoading } = useAllStageStatuses();

  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedStages, setSelectedStages] = useState<string | null>(null);
  const [selectedStageStatus, setSelectedStageStatus] = useState<string>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [stageActionRequired, setStageActionRequired] = useState<
    Record<string, boolean>
  >({});
  const [pipelineLoading, setPipelineLoading] = useState(true);
  const [pipelineError, setPipelineError] = useState<string | null>(null);
  const [pipelineRetry, setPipelineRetry] = useState(0);
  const [selectedLifecycle, setSelectedLifecycle] = useState<
    "active" | "hold" | "cancel" | "all"
  >("active");

  const itemsPerPage = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    // The partner id comes from localStorage (set at sign-in) or the shared
    // session, never from a fresh /auth/me call here.
    let id: string | null = null;
    try {
      id = localStorage.getItem("partnerId");
    } catch {
      /* storage unavailable */
    }
    if (!id && user) {
      id = user.partner_id ?? user.id ?? null;
      if (id) {
        try {
          localStorage.setItem("partnerId", id);
        } catch {
          /* ignore */
        }
      }
    }
    if (id) setPartnerId(id);
  }, [user]);

  useEffect(() => {
    if (stages.length === 0 || !partnerId) return;
    let cancelled = false;
    setPipelineLoading(true);
    setPipelineError(null);
    Promise.all(
      stages.map((s) =>
        api
          .get(`/partners/${partnerId}/applications`, {
            params: {
              stage_id: s.id,
              limit: 10,
              status: selectedLifecycle,
              include_members: true,
            },
          })
          .then((res) => ({
            id: s.id,
            count: (res.data as any)?.total ?? 0,
            failed: false,
            hasAction: ((res.data as any)?.items ?? []).some((app: any) =>
              isAdvisorAction(app.status)
            ),
          }))
          .catch(() => ({ id: s.id, count: 0, hasAction: false, failed: true }))
      )
    ).then((results) => {
      if (cancelled) return;
      const counts: Record<string, number> = {};
      const actionMap: Record<string, boolean> = {};
      results.forEach((r) => {
        counts[r.id] = r.count;
        actionMap[r.id] = r.hasAction;
      });
      setStageCounts(counts);
      setStageActionRequired(actionMap);
      setPipelineError(
        results.some((result) => result.failed)
          ? "Some application stage totals could not load."
          : null
      );
      setPipelineLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [stages.length, partnerId, selectedLifecycle, pipelineRetry, stages]);

  // include_members: an agency admin sees their members' applications too
  // (D8); the backend ignores it for everyone else.
  const {
    total: grandTotal,
    loading: totalsLoading,
    error: totalsError,
    refetch: refetchTotals,
  } = usePartnerApplications({
    partnerId,
    limit: 1,
    status: selectedLifecycle,
    include_members: true,
  });

  const {
    items: applications,
    total,
    loading,
    error,
    refetch,
  } = usePartnerApplications({
    partnerId,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    status: selectedLifecycle,
    stage_id: selectedStages ?? undefined,
    stage_status_id:
      selectedStageStatus !== "all" ? selectedStageStatus : undefined,
    search: debouncedSearch || undefined,
    university_id:
      selectedUniversity !== "all" ? selectedUniversity : undefined,
    include_members: true,
  });

  const submittedByMember = (app: {
    partner_id?: string | null;
    partner_name?: string | null;
  }) =>
    app.partner_id && app.partner_id !== partnerId
      ? app.partner_name || "a team member"
      : null;

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const needsPartnerAction = (status: string) => isAdvisorAction(status);

  const activeFiltersCount = [
    selectedUniversity !== "all",
    selectedStages !== null,
    selectedStageStatus !== "all",
    selectedLifecycle !== "active",
    searchTerm !== "",
  ].filter(Boolean).length;

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...applications];

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() ?? "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() ?? "";
        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [applications, sortConfig]);

  const totalPages = Math.ceil(total / itemsPerPage);
  const paginatedApplications = filteredAndSortedApplications;
  const displayTotal =
    paginatedApplications.length < itemsPerPage
      ? (currentPage - 1) * itemsPerPage + paginatedApplications.length
      : grandTotal;

  const status = getAsyncStatus(
    loading,
    error,
    paginatedApplications,
    (r) => r.length === 0
  );

  // Display name for a status code, from the stage-status list.
  const statusLabel = (status: string) => {
    const normalized = status?.toLowerCase().replace(/\s+/g, "_") ?? "";
    const match = stageStatuses.find(
      (s) => s.name.toLowerCase().replace(/\s+/g, "_") === normalized
    );
    // Advisors read status names in the Unibexs voice ("Under Review by Unibexs").
    return unibexsVoice(
      match?.name ??
      (normalized.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) ||
        "Unknown")
    );
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedUniversity("all");
    setSelectedStages(null);
    setSelectedStageStatus("all");
    setSelectedLifecycle("active");
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
  };

  return (
    <Card extra="mt-6 ">
      <DashboardHeader
        hideTitle
        as="h2"
        title="Applications dashboard"
        subtitle="Manage and track student applications"
        primaryAction={
          <Button
            variant="primary"
            onClick={() => router.push("/partner/applications/apply-now")}
            icon={<FilePlus className="h-4 w-4" aria-hidden="true" />}
            text="Create application"
          />
        }
        className="border-b border-ub-border p-4 sm:p-6"
      />

      {
        <div className="min-w-0 p-4 sm:p-6 border-b border-ub-border">
          <PipelineCard
            stages={stages}
            stageCounts={stageCounts}
            stageActionRequired={stageActionRequired}
            selectedId={selectedStages}
            onSelect={(id) => {
              setSelectedStages(id);
              setCurrentPage(1);
            }}
            loading={pipelineLoading || stagesLoading || totalsLoading}
            error={pipelineError || stagesError || totalsError}
            onRetry={() => {
              setPipelineRetry((value) => value + 1);
              void refetchTotals();
              if (stagesError) void refetchStages();
            }}
            scopeLabel={
              selectedLifecycle === "active"
                ? "Active applications"
                : selectedLifecycle === "hold"
                ? "Applications on hold"
                : selectedLifecycle === "cancel"
                ? "Cancelled applications"
                : "All applications"
            }
            totalCount={grandTotal}
            onViewCommission={() => {
              const commStage = stages.find((s) =>
                s.name.toLowerCase().includes("commission")
              );
              if (commStage) {
                setSelectedStages(commStage.id);
                setCurrentPage(1);
              }
            }}
          />
        </div>
      }

      <div className="border-b border-ub-border p-4 sm:p-6">
        <ApplicationFilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          selectedStages={selectedStages ?? "all"}
          onStagesChange={(val) => {
            setSelectedStages(val === "all" ? null : val);
            setCurrentPage(1);
          }}
          stageOptions={stages.map((s) => ({ label: unibexsVoice(s.name), value: s.id }))}
          selectedUniversity={selectedUniversity}
          onUniversityChange={(val) => {
            setSelectedUniversity(val);
            setCurrentPage(1);
          }}
          universityOptions={universities.map((u) => ({
            label: u.name,
            value: u.id,
          }))}
          selectedStageStatus={selectedStageStatus}
          onStageStatusChange={(val) => {
            setSelectedStageStatus(val);
            setCurrentPage(1);
          }}
          stageStatusOptions={stageStatuses.map((s) => ({
            label: unibexsVoice(s.name),
            value: s.id,
          }))}
          stageStatusLoading={stageStatusesLoading}
          showLifecycleFilter
          selectedLifecycle={selectedLifecycle}
          onLifecycleChange={(val) => {
            setSelectedLifecycle(val as "active" | "hold" | "cancel" | "all");
            setCurrentPage(1);
          }}
          resultsCount={displayTotal}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
          showFilters={showMobileFilters}
          onToggleFilters={() => setShowMobileFilters((v) => !v)}
        />
      </div>

      <div className="border-t border-ub-border p-6">
        <ApplicationsTable
          rows={paginatedApplications}
          loading={loading}
          error={error}
          onRetry={refetch}
          hrefFor={(id) => `/partner/applications/${id}`}
          ownership="advisor"
          statusLabel={statusLabel}
          needsAction={needsPartnerAction}
          selectable={false}
          selectionResetKey={[
            selectedLifecycle,
            selectedStages,
            selectedStageStatus,
            selectedUniversity,
            debouncedSearch,
            currentPage,
          ].join("|")}
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              itemCount={paginatedApplications.length}
              totalCount={displayTotal}
              itemLabel="results"
              loading={loading}
            />
          }
        />
      </div>
    </Card>
  );
};

export default PartnerApplications;
