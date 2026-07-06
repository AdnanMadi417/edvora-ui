"use client";

import React, { useState, useMemo, useEffect } from "react";
import PresignedImage from "components/ui/PresignedImage";
import {
  ChevronUp,
  ChevronDown,
  ChevronRight,
  Flag,
  Clock,
  User,
  Building,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
} from "lucide-react";
import StatsFilterCards, { type FilterCardItem, type CardColorScheme } from "components/filters/StatsFilterCards";

import { useRouter } from "next/navigation";
import api from "lib/useApi";

import { useAccountManagerApplications } from "features/applications/account-manager/hooks/useAccountManagerApplications";
import { useUniversities } from "features/universities/hooks";
import { useAllStages, useAllStageStatuses } from "features/applications/hooks";

import EmptyData from "components/emptyData/EmptyTableData";
import PrevButton from "components/ui/buttons/PrevButton";
import NextButton from "components/ui/buttons/NextButton";
import ApplicationFilterBar from "components/filters/ApplicationFilterBar";
import { AppDate } from "components/ui/date";


const STAGE_COLORS: CardColorScheme[] = ["blue", "violet", "emerald", "amber", "rose", "cyan"];

const getStatusColors = (code: string) => {
  if (!code) return { bg: "bg-gray-100 border-slate-200", text: "text-gray-700" };
  if (code.includes("reject") || code.includes("expired")) return { bg: "bg-red-50 border-red-200", text: "text-red-700" };
  if (code.includes("approv") || code.includes("confirm") || code.includes("accepted") || code.includes("completed")) return { bg: "bg-green-50 border-green-200", text: "text-green-700" };
  if (code.includes("correction") || code.includes("re_upload") || code.includes("re-upload") || code.includes("disputed")) return { bg: "bg-orange-50 border-orange-200", text: "text-orange-700" };
  if (code.includes("review") || code.includes("waiting") || code.includes("processing") || code.includes("pending")) return { bg: "bg-yellow-50 border-yellow-200", text: "text-yellow-700" };
  return { bg: "bg-blue-50 border-blue-200", text: "text-blue-700" };
};

const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    <td className="px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-3 w-44 animate-pulse rounded bg-gray-200" />
        </div>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-2">
        <div className="h-4 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-28 animate-pulse rounded bg-gray-200" />
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-32 animate-pulse rounded-md bg-gray-200" />
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
    </td>
    <td className="px-4 py-4" />
  </tr>
);

const ModernApplicationsTable = () => {
  const router = useRouter();
  const [managerId, setManagerId] = useState<string>("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { universities } = useUniversities();
  const { stages } = useAllStages();
  const { stageStatuses, stageStatusesLoading } = useAllStageStatuses();

  const [selectedUniversity, setSelectedUniversity] = useState<string>("all");
  const [selectedStages, setSelectedStages] = useState<string | null>(null);
  const [selectedStageStatus, setSelectedStageStatus] = useState<string>("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [stageCounts, setStageCounts] = useState<Record<string, number>>({});
  const [selectedLifecycle, setSelectedLifecycle] = useState<"active" | "hold" | "cancel" | "all">("active");

  const itemsPerPage = 10;

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const resolveManager = async () => {
      let id = localStorage.getItem("managerId");
      if (!id) {
        const meRes = await api.get("/auth/me");
        id = meRes.data.manager_id ?? meRes.data.id;
        if (id) localStorage.setItem("managerId", id);
      }
      if (id) setManagerId(id);
    };
    resolveManager();
  }, []);


  useEffect(() => {
    if (stages.length === 0 || !managerId) return;
    let cancelled = false;
    Promise.all(
      stages.map((s) =>
        api.get(`/account-managers/${managerId}/applications`, { params: { stage_id: s.id, limit: 1, status: selectedLifecycle } })
          .then((res) => ({ id: s.id, count: (res.data as any)?.total ?? 0 }))
          .catch(() => ({ id: s.id, count: 0 }))
      )
    ).then((results) => {
      if (cancelled) return;
      const map: Record<string, number> = {};
      results.forEach((r) => { map[r.id] = r.count; });
      setStageCounts(map);
    });
    return () => { cancelled = true; };
  }, [stages.length, managerId, selectedLifecycle]);

  const { total: grandTotal } = useAccountManagerApplications({ managerId, limit: 1, status: selectedLifecycle });

  const { items: applications, total, loading } = useAccountManagerApplications({
    managerId,
    limit: itemsPerPage,
    offset: (currentPage - 1) * itemsPerPage,
    status: selectedLifecycle,
    stage_id: selectedStages ?? undefined,
    stage_status_id: selectedStageStatus !== "all" ? selectedStageStatus : undefined,
    search: debouncedSearch || undefined,
    university_id: selectedUniversity !== "all" ? selectedUniversity : undefined,
  });


  const stageCards = useMemo<FilterCardItem[]>(() => [
    { id: null, label: "All Applications", count: grandTotal, icon: LayoutGrid, colorScheme: "slate" },
    ...stages.map((s, i) => ({
      id: s.id,
      label: s.name,
      count: stageCounts[s.id] ?? "—",
      icon: Flag,
      colorScheme: STAGE_COLORS[i % STAGE_COLORS.length],
    })),
  ], [stages, stageCounts, grandTotal]);

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
  }, [applications, selectedUniversity, sortConfig]);

  const actionRequiredStatuses = useMemo(() => new Set([
    'new_application',
    'payment_submitted',
    'eval_under_review',
    'e-visa_under_review',
    'visa_documents_under_review',
    'arrival_confirmed',
    'extra_arrival_documents_under_review',
    'issue_response_received',
    'commission_disputed',
  ]), []);

  const needsAction = (status: string) =>
    actionRequiredStatuses.has(status?.toLowerCase().replace(/\s+/g, '_'));

  const totalPages = Math.ceil(total / itemsPerPage);
  const paginatedApplications = filteredAndSortedApplications;
  const displayTotal = paginatedApplications.length < itemsPerPage
    ? (currentPage - 1) * itemsPerPage + paginatedApplications.length
    : grandTotal;

  const StatusBadge = ({ status }: { status: string }) => {
    const normalized = status?.toLowerCase().replace(/\s+/g, "_") ?? "";
    const match = stageStatuses.find((s) => s.name.toLowerCase().replace(/\s+/g, "_") === normalized);
    const label = match?.name ?? (normalized.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown");
    const { bg, text } = getStatusColors(normalized);
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium ${bg} ${text}`} title={label}>
        <span className="truncate max-w-[160px]">{label}</span>
      </span>
    );
  };

  const SortIndicator = ({ field }) => {
    if (sortConfig.key !== field) {
      return (
        <ChevronUp className="h-4 w-4 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" />
      );
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="h-4 w-4 text-accent" />
    ) : (
      <ChevronDown className="h-4 w-4 text-accent" />
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
    <div className="mt-6 max-w-5xl mx-auto text-p2 bg-white rounded-lg border border-slate-200">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Applications Dashboard</h3>
          <p className="mt-0.5 text-sm text-slate-500">Manage and track student applications</p>
        </div>
      </div>

      <div className="hidden sm:block p-6 border-b border-slate-200">
        <StatsFilterCards
          cards={stageCards}
          selectedId={selectedStages}
          onSelect={(id) => { setSelectedStages(id); setCurrentPage(1); }}
        />
      </div>

      <div className="border-b border-slate-200 p-6">
        <ApplicationFilterBar
          searchTerm={searchTerm}
          onSearchChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          selectedStages={selectedStages ?? "all"}
          onStagesChange={(val) => {
            setSelectedStages(val === "all" ? null : val);
            setCurrentPage(1);
          }}
          stageOptions={stages.map((s) => ({ label: s.name, value: s.id }))}
          selectedUniversity={selectedUniversity}
          onUniversityChange={(val) => { setSelectedUniversity(val); setCurrentPage(1); }}
          universityOptions={universities.map((u) => ({ label: u.name, value: u.id }))}
          selectedStageStatus={selectedStageStatus}
          onStageStatusChange={(val) => { setSelectedStageStatus(val); setCurrentPage(1); }}
          stageStatusOptions={stageStatuses.map((s) => ({ label: s.name, value: s.id }))}
          stageStatusLoading={stageStatusesLoading}
          showLifecycleFilter
          selectedLifecycle={selectedLifecycle}
          onLifecycleChange={(val) => { setSelectedLifecycle(val as "active" | "hold" | "cancel" | "all"); setCurrentPage(1); }}
          resultsCount={displayTotal}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
          showFilters={showMobileFilters}
          onToggleFilters={() => setShowMobileFilters((v) => !v)}
        />
      </div>

      <div className="border-t border-slate-200 p-6">
      <div className="overflow-hidden rounded-lg border border-slate-200">

      {/* Mobile card list */}
      <div className="md:hidden divide-y divide-slate-100">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <div className="h-11 w-11 shrink-0 animate-pulse rounded-md bg-gray-200" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex justify-between gap-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-3 w-12 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-5 w-28 animate-pulse rounded-md bg-gray-200" />
              </div>
            </div>
          ))
        ) : paginatedApplications.length === 0 ? (
          <div className="px-6 py-8 text-center"><EmptyData /></div>
        ) : (
          paginatedApplications.map((app) => (
            <div
              key={app.id}
              className={`flex cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors bg-white hover:bg-slate-100/50 ${
                needsAction(app.status) ? 'border-l-2 border-l-blue-400 bg-blue-50/30' : ''
              }`}
              onClick={() => router.push(`/account-manager/applications/${app.id}`)}
            >
              <div className="relative shrink-0">
                <PresignedImage
                  fileKey={app.student_photo_file_key}
                  alt={app.student_name}
                  className="h-11 w-11 rounded-full object-cover"
                  fallback={
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                      {app.student_name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  }
                />
                {needsAction(app.status) && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-md bg-blue-400 ring-2 ring-white">
                    <span className="h-1.5 w-1.5 rounded-md bg-white" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-slate-900">{app.student_name}</span>
                  <span className="shrink-0 text-xs text-slate-400"><AppDate value={app.updated_at} format="relative" /></span>
                </div>
                <div className="mt-0.5 truncate text-xs text-slate-500">{app.program_name}</div>
                <div className="mt-1.5"><StatusBadge status={app.status} /></div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
            </div>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th
                onClick={() => handleSort("student_name")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100/50"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  Student
                  <SortIndicator field="student_name" />
                </div>
              </th>

              <th
                onClick={() => handleSort("program_name")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100/50"
              >
                <div className="flex min-w-[250px] items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  University / Program
                  <SortIndicator field="program_name" />
                </div>
              </th>

              <th
                onClick={() => handleSort("partner_name")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100/50"
              >
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-400" />
                  Partner
                  <SortIndicator field="partner_name" />
                </div>
              </th>

              <th
                onClick={() => handleSort("stage")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100/50"
              >
                <div className="flex min-w-[200px] items-center gap-2">
                  <Flag className="h-4 w-4 text-slate-400" />
                  Stage / Status
                  <SortIndicator field="stage" />
                </div>
              </th>

              <th
                onClick={() => handleSort("updated_at")}
                className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors hover:bg-slate-100/50"
              >
                <div className="flex min-w-[100px] items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Updated
                  <SortIndicator field="updated_at" />
                </div>
              </th>

              <th className="w-10 px-4 py-4" />
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
            ) : paginatedApplications.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                  <EmptyData />
                </td>
              </tr>
            ) : (
              paginatedApplications.map((app) => (
                <tr
                  key={app.id}
                  className={`group cursor-pointer transition-colors hover:bg-slate-100/50 ${
                    needsAction(app.status) ? 'border-l-2 border-l-blue-400 bg-blue-50/30' : ''
                  }`}
                  onClick={() => router.push(`/account-manager/applications/${app.id}`)}
                >
                  <td className="min-w-[200px] max-w-[300px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <PresignedImage
                          fileKey={app.student_photo_file_key}
                          alt={app.student_name}
                          className="h-10 w-10 rounded-full object-cover"
                          fallback={
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                              {app.student_name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                          }
                        />
                        {needsAction(app.status) && (
                          <span
                            className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-md bg-blue-400 ring-2 ring-white"
                            title="Needs review"
                          >
                            <span className="h-1.5 w-1.5 rounded-md bg-white" />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">{app.student_name}</div>
                        <div className="truncate text-xs text-slate-500">{app.passport_number ?? "—"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[250px] max-w-[300px] px-6 py-4">
                    <div className="truncate font-medium text-slate-900">{app.program_name}</div>
                    <div className="truncate text-xs text-slate-500">{app.university_name}</div>
                  </td>

                  <td className="min-w-[180px] max-w-[250px] px-6 py-4">
                    <div className="truncate text-sm text-slate-700">{app.partner_name}</div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1.5">
                      <div className="text-xs text-slate-500 truncate">{app.stage}</div>
                      <StatusBadge status={app.status} />
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-500">
                      <AppDate value={app.updated_at} format="relative" />
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-200 p-6 text-sm text-slate-500 md:flex-row">
        <div>
          {paginatedApplications.length === 0 && !loading ? (
            <span>No results found</span>
          ) : (
            <>
              Showing{" "}
              <span className="font-medium text-slate-700">
                {(currentPage - 1) * itemsPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-slate-700">
                {(currentPage - 1) * itemsPerPage + paginatedApplications.length}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">
                {displayTotal}
              </span>{" "}
              results
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <PrevButton
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            text="Prev"
            icon={<ArrowLeft className="h-4 w-4" />}
          />
          <span className="px-2 text-slate-500">
            Page {currentPage} of {Math.max(Math.ceil(displayTotal / itemsPerPage), 1)}
          </span>
          <NextButton
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={paginatedApplications.length < itemsPerPage}
            text="Next"
            icon={<ArrowRight className="h-4 w-4" />}
          />
        </div>
      </div>

      </div>
      </div>
    </div>
  );
};

export default ModernApplicationsTable;
