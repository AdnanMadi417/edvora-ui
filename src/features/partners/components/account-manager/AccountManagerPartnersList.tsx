"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronRight, Users, Mail, BadgeCheck,
  CheckCircle, XCircle, RefreshCw, FileText,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAccountManagerPartners } from "features/partners/hooks";
import SearchInput from "components/form/filter/SearchInput";
import { TableWrapper, TableSkeletonRows, TableEmptyRow, TableErrorRow, TablePagination } from "components/ui/table";

const ITEMS_PER_PAGE = 10;

export default function AccountManagerPartnersList() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { partners, total, loading, error, refetch } = useAccountManagerPartners({
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

  return (
    <div className="mt-6 max-w-5xl mx-auto text-p2 bg-white rounded-lg border border-slate-200">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Partners</h3>
          <p className="mt-0.5 text-sm text-slate-500">Partners assigned to you</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full sm:w-64 sm:flex-none"
          />
          {isRefetching && (
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-slate-400" aria-label="Updating results" />
          )}
          {searchTerm !== "" && (
            <button
              onClick={clearFilters}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="p-6">
        <TableWrapper
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              itemCount={partners.length}
              totalCount={total}
              itemLabel="partners"
              loading={loading}
            />
          }
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  { icon: Users,      label: "Partner",      minW: "min-w-[220px]" },
                  { icon: Mail,       label: "Contact Info", minW: "min-w-[200px]" },
                  { icon: FileText,   label: "Applications" },
                  { icon: BadgeCheck, label: "Status" },
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
              {isInitialLoad && <TableSkeletonRows columns={5} rows={ITEMS_PER_PAGE} />}

              {!isInitialLoad && error && (
                <TableErrorRow colSpan={5} message={error} onRetry={refetch} />
              )}

              {!isInitialLoad && !error && partners.length === 0 && (
                <TableEmptyRow
                  colSpan={5}
                  title="No partners found"
                  subtitle={searchTerm ? "Try adjusting your search." : "You don't have any assigned partners yet."}
                  action={
                    searchTerm ? (
                      <button
                        onClick={clearFilters}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Clear search
                      </button>
                    ) : undefined
                  }
                />
              )}

              {!isInitialLoad && !error && partners.map((partner) => (
                <tr
                  key={partner.id}
                  className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                  onClick={() => router.push(`/account-manager/partners/${partner.id}`)}
                >
                  <td className="min-w-[220px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                        {partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${partner.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{partner.name || "Unknown Partner"}</div>
                        <div className="truncate text-xs text-slate-500 capitalize">{partner.type || "—"} · {partner.country || "—"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="truncate text-sm text-slate-900">{partner.phone || "—"}</div>
                    <div className="truncate text-xs text-slate-500">{partner.email || "—"}</div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {partner.applications_count}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {partner.is_active ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
                          <XCircle className="h-3 w-3" /> Inactive
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      </div>
    </div>
  );
}
