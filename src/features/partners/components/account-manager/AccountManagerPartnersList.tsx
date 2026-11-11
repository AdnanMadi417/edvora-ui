"use client";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import type { AccountManagerPartnerListItem } from "features/partners/types";
import AdvisorDirectoryToolbar from "../shared/AdvisorDirectoryToolbar";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Users,
  Mail,
  BadgeCheck,
  Building2,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  CalendarDays,
  Share2,
  Handshake,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAccountManagerPartners } from "features/partners/hooks";
import TablePagination from "components/ub/data/tables/TablePagination";
import AppDate from "components/ub/data/formatting/AppDate";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Button from "components/ub/core/buttons/Button";

const ITEMS_PER_PAGE = 10;

export default function AccountManagerPartnersList() {
  const router = useRouter();

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
      key: "0",
      header: "Advisor",
      cell: (partner) => (
        <>
          <div className="flex items-center gap-2">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ub-tone-brand-bg text-sm font-semibold text-ub-text-link">
              {partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
              <span
                className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ub-surface ${
                  partner.is_active ? "bg-ub-tone-success-dot" : "bg-ub-tone-neutral-dot"
                }`}
              />
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-ub-text-primary">
                {partner.name || "Unknown Advisor"}
              </div>
              <div className="truncate text-xs text-ub-text-secondary capitalize">
                {partner.type || "—"} · {partner.country || "—"}
              </div>
            </div>
          </div>
        </>
      ),
    },
    {
      key: "1",
      header: "Contact info",
      cell: (partner) => (
        <>
          <div className="truncate text-sm text-ub-text-primary">
            {partner.phone || "—"}
          </div>
          <div className="truncate text-xs text-ub-text-secondary">
            {partner.email || "—"}
          </div>
        </>
      ),
    },
    {
      key: "2",
      header: "Applications",
      cell: (partner) => (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-md border border-ub-border bg-ub-surface-subtle px-2.5 py-1 text-xs font-medium text-ub-text-secondary">
            {partner.applications_count}
          </span>
        </>
      ),
    },
    {
      key: "3",
      header: "Status",
      cell: (partner) => (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {partner.is_active ? (
              <StatusBadge
                variant="success"
                icon={<CheckCircle className="h-3 w-3" />}
              >
                Active
              </StatusBadge>
            ) : (
              <StatusBadge
                variant="neutral"
                icon={<XCircle className="h-3 w-3" />}
              >
                Inactive
              </StatusBadge>
            )}
            {partner.is_shared && (
              <StatusBadge variant="info" icon={<Share2 className="h-3 w-3" />}>
                Shared
              </StatusBadge>
            )}
            {partner.agency_membership && (
              <StatusBadge
                variant="info"
                icon={<Building2 className="h-3 w-3" />}
              >
                Member of {partner.agency_membership.agency_name}
              </StatusBadge>
            )}
          </div>
        </>
      ),
    },
    {
      key: "4",
      header: "Registered",
      cell: (partner) => (
        <>
          <div className="text-sm text-ub-text-primary">
            <AppDate value={partner.created_at} format="short" fallback="—" />
          </div>
        </>
      ),
    },
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
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable
          columns={columns}
          rows={partners}
          getRowId={(partner) => partner.id}
          getRowHref={(partner) => `/account-manager/advisors/${partner.id}`}
          caption="Advisor directory"
          loading={isInitialLoad}
          error={error}
          onRetry={refetch}
          getRowClassName={() => "md:[&>td]:py-4"}
          scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
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
