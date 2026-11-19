"use client";
import { TextButton } from "components/ub/core/buttons/TextButton";
import { tableSectionPadding } from "components/ub/recipes";

import React, { useEffect, useRef, useState } from "react";
import {
  Users, RefreshCw, Handshake, Eye, SlidersHorizontal,
} from "lucide-react";
import { usePartners } from "features/partners/hooks";
import type { Partner } from "features/partners/types";
import DataTable, { type DataTableColumn } from "components/ub/data/tables/DataTable";
import TableActions, { TableAction } from "components/ub/data/tables/TableActions";
import AppDate from "components/ub/data/formatting/AppDate";
import AdvisorEntityCell, { advisorName } from "features/partners/components/shared/AdvisorEntityCell";
import FilterSelectField from "components/ub/forms/selection/FilterSelectField";
import SearchInput from "components/ub/forms/selection/SearchInput";
import TablePagination from "components/ub/data/tables/TablePagination";

const ITEMS_PER_PAGE = 5;

type StatusFilter = "active" | "inactive" | "verified" | "unverified" | "individual" | "agency" | "all";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "verified", label: "Verified" },
  { value: "unverified", label: "Unverified" },
  { value: "individual", label: "Individual" },
  { value: "agency", label: "Company" },
];

function statusToParams(status: StatusFilter): { is_active?: boolean; is_verified?: boolean; type?: string } {
  if (status === "active") return { is_active: true };
  if (status === "inactive") return { is_active: false };
  if (status === "verified") return { is_verified: true };
  if (status === "unverified") return { is_verified: false };
  if (status === "individual") return { type: "individual" };
  if (status === "agency") return { type: "agency" };
  return {};
}

interface ReviewerAccountManagerPartnersTableProps {
  managerId: string;
}

export default function ReviewerAccountManagerPartnersTable({ managerId }: ReviewerAccountManagerPartnersTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { partners, total, loading, error, refetch } = usePartners({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    assigned_manager_id: managerId,
    ...statusToParams(selectedStatus),
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

  const activeFiltersCount = [selectedStatus !== "all", searchTerm !== ""].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const columns: DataTableColumn<Partner>[] = [
    {
      key: "advisor",
      header: "Advisor",
      cell: (partner) => <AdvisorEntityCell advisor={partner} subtitle={undefined} />,
    },
    {
      key: "last-login",
      header: "Last login",
      cell: (partner) => <AppDate value={partner.last_login} format="short" fallback="Never" />,
    },
    {
      key: "registered",
      header: "Registered",
      cell: (partner) => <AppDate value={partner.created_at} format="short" fallback="—" />,
    },
    {
      key: "actions",
      header: "Actions",
      align: "end",
      cell: (partner) => (
        <TableActions label={advisorName(partner)}>
          <TableAction label="View advisor" icon={<Eye className="h-4 w-4" />} href={`/reviewer/advisors/${partner.id}`} primary />
        </TableActions>
      ),
    },
  ];

  return (
    <div className="mb-5 rounded-lg border border-ub-border bg-ub-surface">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-ub-border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-ub-text-primary">Assigned Advisors</h3>
          <p className="mt-0.5 text-sm text-ub-text-secondary">Advisors managed by this account manager</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-ub-border p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center gap-2 sm:contents">
            <SearchInput
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="sm:w-64 sm:flex-none"
            />
            {isRefetching && (
              <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-ub-text-tertiary" aria-label="Updating results" />
            )}
            <button
              type="button"
              aria-label={activeFiltersCount > 0 ? `Filters, ${activeFiltersCount} active` : "Filters"}
              aria-expanded={showMobileFilters}
              className="relative sm:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-ub-border bg-ub-surface text-ub-text-secondary hover:bg-ub-surface-subtle"
              onClick={() => setShowMobileFilters((v) => !v)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              {activeFiltersCount > 0 && (
                <span aria-hidden="true" className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-ub-action-primary text-[10px] font-bold text-white">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          <div className={`flex w-full flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out sm:contents ${showMobileFilters ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"}`}>
            <div className="w-full sm:w-44 shrink-0">
              <FilterSelectField
                value={selectedStatus}
                onChange={(v: string) => { setSelectedStatus(v as StatusFilter); setCurrentPage(1); }}
                options={STATUS_OPTIONS}
                icon={Users}
                defaultOption="All Statuses"
              />
            </div>

            {activeFiltersCount > 0 && (
              <TextButton size="sm" onClick={clearFilters} className="[@media(pointer:coarse)]:min-h-11">
                Clear filters
              </TextButton>
            )}
          </div>
        </div>
      </div>

      <div className={tableSectionPadding}>
        <DataTable
          columns={columns}
          rows={partners}
          getRowId={(partner) => partner.id}
          getRowHref={(partner) => `/reviewer/advisors/${partner.id}`}
          caption="Assigned advisors"
          loading={isInitialLoad}
          error={error}
          onRetry={refetch}
          skeletonRows={ITEMS_PER_PAGE}
          getRowClassName={() => (isRefetching ? "opacity-60 transition-opacity" : undefined)}
          empty={{
            title: "No advisors found",
            description: activeFiltersCount > 0 ? "Try adjusting your filters." : "This manager has no assigned advisors yet.",
            icon: <Handshake className="h-8 w-8 text-ub-text-tertiary" />,
            action:
              activeFiltersCount > 0 ? (
                <TextButton size="sm" onClick={clearFilters} className="[@media(pointer:coarse)]:min-h-11">
                  Clear filters
                </TextButton>
              ) : undefined,
          }}
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              itemCount={partners.length}
              totalCount={total}
              itemLabel="advisors"
              loading={loading}
            />
          }
        />
      </div>
    </div>
  );
}
