"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, User, GraduationCap, Clock, RefreshCw, SlidersHorizontal, ClipboardList } from "lucide-react";
import { useAccountManagerApplications } from "features/applications/hooks";
import PresignedImage from "components/ui/PresignedImage";
import SearchInput from "components/form/filter/SearchInput";
import FilterSelectField from "components/form/filter/FilterSelectField";
import { TableWrapper, TableSkeletonRows, TableEmptyRow, TableErrorRow, TablePagination } from "components/ui/table";
import { StatusBadge } from "components/ui/badges";
import { getStatusVariant } from "utils/getStatusVariant";
import Button from "components/ui/buttons/Button";

const ITEMS_PER_PAGE = 5;

type Lifecycle = "active" | "hold" | "cancel" | "all";

const LIFECYCLE_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "hold", label: "On Hold" },
  { value: "cancel", label: "Cancelled" },
  { value: "all", label: "All" },
];

interface AccountManagerPartnerApplicationsTableProps {
  partnerId: string;
}

export default function AccountManagerPartnerApplicationsTable({ partnerId }: AccountManagerPartnerApplicationsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLifecycle, setSelectedLifecycle] = useState<Lifecycle>("active");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { items: applications, total, loading, error, refetch } = useAccountManagerApplications({
    partner_id: partnerId,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    status: selectedLifecycle,
    search: debouncedSearch || undefined,
  });

  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const loadingStartedRef = useRef(false);
  useEffect(() => {
    if (loading) {
      loadingStartedRef.current = true;
    } else if (loadingStartedRef.current) {
      setHasLoadedOnce(true);
    }
  }, [loading]);

  const isInitialLoad = !hasLoadedOnce;
  const isRefetching = loading && hasLoadedOnce;

  const activeFiltersCount = [selectedLifecycle !== "active", searchTerm !== ""].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedLifecycle("active");
    setCurrentPage(1);
  };

  return (
    <>
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 sm:flex-row sm:items-center sm:justify-between p-6">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Applications</h3>
          <p className="mt-0.5 text-sm text-slate-500">Student applications submitted by this partner</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center gap-2 sm:contents">
            <SearchInput
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder="Search by student name..."
              className="sm:w-64 sm:flex-none"
            />
            {isRefetching && (
              <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-slate-400" aria-label="Updating results" />
            )}
            <button
              className="relative sm:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              onClick={() => setShowMobileFilters((v) => !v)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          <div className={`flex w-full flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out sm:contents ${showMobileFilters ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"}`}>
            <div className="w-full sm:w-44 flex-shrink-0">
              <FilterSelectField
                value={selectedLifecycle}
                onChange={(v: string) => { setSelectedLifecycle(v as Lifecycle); setCurrentPage(1); }}
                options={LIFECYCLE_OPTIONS}
                icon={Clock}
                defaultOption="All Applications"
              />
            </div>

            {activeFiltersCount > 0 && (
              <Button
                onClick={clearFilters}
                icon={<RefreshCw className="h-4 w-4" />}
                text="Clear"
                bgColor="bg-white"
                textColor="text-red-600"
                borderColor="border-red-200"
                hoverTextColor="hover:text-red-600"
                hoverBorderColor="hover:border-red-200"
                className="hover:bg-red-50 sm:w-auto"
              />
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <TableWrapper
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              itemCount={applications.length}
              totalCount={total}
              itemLabel="applications"
              loading={loading}
            />
          }
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  { icon: User,          label: "Student", minW: "min-w-[160px] sm:min-w-[220px]" },
                  { icon: GraduationCap, label: "Program", minW: "min-w-[150px] sm:min-w-[200px]" },
                  { icon: Clock,         label: "Status" },
                ].map(({ icon: Icon, label, minW }) => (
                  <th key={label} className={`${minW ?? ""} px-6 py-4 text-start text-sm font-semibold text-slate-900`}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      {label}
                    </div>
                  </th>
                ))}
                <th className="w-10 px-4 py-4" />
              </tr>
            </thead>

            <tbody className={`divide-y divide-slate-100 bg-white ${isRefetching ? "opacity-60 transition-opacity" : ""}`}>
              {isInitialLoad && <TableSkeletonRows columns={4} rows={ITEMS_PER_PAGE} />}

              {!isInitialLoad && error && (
                <TableErrorRow colSpan={4} message={error} onRetry={refetch} />
              )}

              {!isInitialLoad && !error && applications.length === 0 && (
                <TableEmptyRow
                  colSpan={4}
                  title="No applications found"
                  subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "This partner hasn't submitted any applications yet."}
                  icon={<ClipboardList className="h-8 w-8 text-slate-400" />}
                  action={
                    activeFiltersCount > 0 ? (
                      <Button
                        onClick={clearFilters}
                        icon={<RefreshCw className="h-3.5 w-3.5" />}
                        text="Clear filters"
                        bgColor="bg-white"
                        textColor="text-slate-700"
                        borderColor="border-slate-200"
                        hoverTextColor="hover:text-slate-700"
                        hoverBorderColor="hover:border-slate-200"
                        className="hover:bg-slate-50"
                      />
                    ) : undefined
                  }
                />
              )}

              {!isInitialLoad && !error && applications.map((app) => {
                const statusVariant = getStatusVariant(app.status?.toLowerCase().replace(/\s+/g, "_") ?? "");
                return (
                  <tr
                    key={app.id}
                    className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                    onClick={() => window.open(`/account-manager/applications/${app.id}`, "_blank")}
                  >
                    <td className="min-w-[160px] max-w-[160px] px-6 py-4 sm:min-w-[220px] sm:max-w-[220px]">
                      <div className="flex items-center gap-3">
                        <PresignedImage
                          fileKey={app.student_photo_file_key}
                          alt={app.student_name}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                          fallback={
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                              {app.student_name?.[0]?.toUpperCase() ?? "?"}
                            </div>
                          }
                        />
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium text-slate-900">{app.student_name}</div>
                          <div className="truncate text-xs text-slate-500">{app.student_email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="min-w-[150px] max-w-[150px] px-6 py-4 sm:min-w-[200px] sm:max-w-[200px]">
                      <div className="truncate text-sm text-slate-900">{app.program_name}</div>
                      <div className="truncate text-xs text-slate-500">{app.university_name}</div>
                    </td>

                    <td className="max-w-[140px] px-6 py-4">
                      <StatusBadge variant={statusVariant}>
                        <span className="truncate max-w-[110px]">{app.status}</span>
                      </StatusBadge>
                    </td>

                    <td className="px-4 py-4">
                      <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrapper>
      </div>
    </>
  );
}
