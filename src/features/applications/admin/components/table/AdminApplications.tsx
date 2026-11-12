import Card from "components/ub/data/cards/Card";
import React, { useState, useMemo, useEffect } from "react";
import PipelineCard from "features/applications/partner/components/PipelineCard";

import { useAdminApplications } from "features/applications/admin/hooks/useAdminApplications";
import { useUniversities } from "features/universities/hooks";
import { useAllStages, useAllStageStatuses } from "features/applications/hooks";

import ApplicationFilterBar from "components/ub/navigation/controls/ApplicationFilterBar";
import ApplicationsTable from "features/applications/components/ApplicationsTable";
import DashboardHeader from "components/ub/dashboard/shared/DashboardHeader";
import TablePagination from "components/ub/data/tables/TablePagination";
import { getAsyncStatus } from "components/ub/feedback/states/AsyncStatus";
import api from "lib/useApi";

const ACTION_REQUIRED_STATUSES = new Set([
  "new_application",
  "payment_submitted",
  "eval_under_review",
  "e-visa_under_review",
  "visa_documents_under_review",
  "arrival_confirmed",
  "extra_arrival_documents_under_review",
  "issue_response_received",
  "commission_disputed",
]);

const ModernApplicationsTable = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    if (stages.length === 0) {
      setPipelineLoading(false);
      return;
    }
    let cancelled = false;
    setPipelineLoading(true);
    setPipelineError(null);
    Promise.all(
      stages.map((s) =>
        api
          .get("/admin/applications", {
            params: { stage_id: s.id, limit: 10, status: selectedLifecycle },
          })
          .then((res) => ({
            id: s.id,
            count: (res.data as any)?.total ?? 0,
            failed: false,
            hasAction: ((res.data as any)?.items ?? []).some((app: any) =>
              ACTION_REQUIRED_STATUSES.has(
                app.status?.toLowerCase().replace(/\s+/g, "_")
              )
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
  }, [stages.length, selectedLifecycle, stages, pipelineRetry]);

  const {
    total: grandTotal,
    loading: totalsLoading,
    error: totalsError,
    refetch: refetchTotals,
  } = useAdminApplications({ limit: 1, status: selectedLifecycle });

  const {
    items: adminApplications,
    loading,
    total,
    error,
    refetch,
  } = useAdminApplications({
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    status: selectedLifecycle,
    stage_id: selectedStages ?? undefined,
    stage_status_id:
      selectedStageStatus !== "all" ? selectedStageStatus : undefined,
    search: debouncedSearch || undefined,
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const activeFiltersCount = [
    selectedUniversity !== "all",
    selectedStages !== null,
    selectedStageStatus !== "all",
    selectedLifecycle !== "active",
    searchTerm !== "",
  ].filter(Boolean).length;

  const filteredAndSortedApplications = useMemo(() => {
    let filtered = [...adminApplications];

    if (selectedUniversity !== "all") {
      filtered = filtered.filter(
        (app) =>
          app.university_name?.toLowerCase() ===
          selectedUniversity.toLowerCase()
      );
    }

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
  }, [adminApplications, selectedUniversity, sortConfig]);

  const totalPages = Math.ceil(total / itemsPerPage);
  const paginatedApplications = filteredAndSortedApplications;

  const status = getAsyncStatus(
    loading,
    error,
    paginatedApplications,
    (r) => r.length === 0
  );

  const needsAction = (status: string) =>
    ACTION_REQUIRED_STATUSES.has(status?.toLowerCase().replace(/\s+/g, "_"));

  // Display name for a status code, from the stage-status list.
  const statusLabel = (status: string) => {
    const normalized = status?.toLowerCase().replace(/\s+/g, "_") ?? "";
    const match = stageStatuses.find(
      (s) => s.name.toLowerCase().replace(/\s+/g, "_") === normalized
    );
    return (
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
      {/* Header */}
      <DashboardHeader
        hideTitle
        as="h2"
        title="Applications dashboard"
        subtitle="Manage and track student applications"
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
            title="Applications pipeline"
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
          stageOptions={stages.map((s) => ({ label: s.name, value: s.id }))}
          selectedUniversity={selectedUniversity}
          onUniversityChange={(val) => {
            setSelectedUniversity(val);
            setCurrentPage(1);
          }}
          universityOptions={universities.map((u) => ({
            label: u.name,
            value: u.name,
          }))}
          selectedStageStatus={selectedStageStatus}
          onStageStatusChange={(val) => {
            setSelectedStageStatus(val);
            setCurrentPage(1);
          }}
          stageStatusOptions={stageStatuses.map((s) => ({
            label: s.name,
            value: s.id,
          }))}
          stageStatusLoading={stageStatusesLoading}
          showLifecycleFilter
          selectedLifecycle={selectedLifecycle}
          onLifecycleChange={(val) => {
            setSelectedLifecycle(val as "active" | "hold" | "cancel" | "all");
            setCurrentPage(1);
          }}
          resultsCount={total}
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
          hrefFor={(id) => `/admin/applications/${id}`}
          ownership="advisor-and-manager"
          statusLabel={statusLabel}
          needsAction={needsAction}
          defaultDensity="compact"
          selectable={true}
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
              totalCount={total}
              itemLabel="results"
              loading={loading}
            />
          }
        />
      </div>
    </Card>
  );
};

export default ModernApplicationsTable;
