"use client";
import { tableSectionPadding } from "components/ub/recipes";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import type { AccountManagerPartnerListItem } from "features/partners/types";
import AdvisorDirectoryToolbar from "../shared/AdvisorDirectoryToolbar";

import AdvisorEntityCell, {
  advisorSubtitle,
} from "../shared/AdvisorEntityCell";

import React, { useEffect, useRef, useState } from "react";
import { useAccountManagerPartners } from "features/partners/hooks";
import TablePagination from "components/ub/data/tables/TablePagination";
import AppDate from "components/ub/data/formatting/AppDate";

const ITEMS_PER_PAGE = 10;

export default function AccountManagerPartnersList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      // Trim so a pasted email with a stray space still matches.
      setDebouncedSearch(searchTerm.trim());
      setCurrentPage(1);
    }, 400);

    return () => clearTimeout(t);
  }, [searchTerm]);

  const { partners, total, loading, error, refetch } =
    useAccountManagerPartners({
      limit: ITEMS_PER_PAGE,
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
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

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  const columns: DataTableColumn<AccountManagerPartnerListItem>[] = [
    {
      key: "advisor",
      header: "Advisor",
      cell: (partner) => (
        <AdvisorEntityCell
          advisor={partner}
          subtitle={
            partner.is_shared
              ? `${advisorSubtitle(partner)} · Shared`
              : undefined
          }
        />
      ),
    },
    {
      key: "applications",
      header: "Applications",
      cell: (partner) => (
        <span className="ub-tabular">{partner.applications_count}</span>
      ),
    },
    {
      key: "registered",
      header: "Registered",
      cell: (partner) => (
        <AppDate value={partner.created_at} format="short" fallback="—" />
      ),
    },
    // No actions column: the only action was View, and the row opens it.
  ];

  return (
    <div className="mt-6 min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-ub-border">
        <div>
          <p className="mt-0.5 text-sm text-ub-text-secondary">
            Advisors assigned to you
          </p>
        </div>
      </div>

      <div className="border-b border-ub-border p-4 sm:p-6">
        <AdvisorDirectoryToolbar
          search={searchTerm}
          onSearch={setSearchTerm}
          total={total}
          loading={isRefetching}
          onClear={clearFilters}
        />
      </div>

      {/* Table */}
      <div className={`min-w-0 ${tableSectionPadding}`}>
        <DataTable
          columns={columns}
          rows={partners}
          getRowId={(partner) => partner.id}
          getRowHref={(partner) => `/account-manager/advisors/${partner.id}`}
          caption="Advisor directory"
          loading={isInitialLoad}
          error={error}
          onRetry={refetch}
          getRowClassName={() => "lg:[&>td]:py-4"}
          scrollClassName="max-h-[60dvh] overflow-y-auto overscroll-contain md:max-h-[65dvh]"
          empty={{
            title: "No advisors found",
            description: "Try another search or adjust your filters.",
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
