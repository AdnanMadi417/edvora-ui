"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronRight, Users, Mail, BadgeCheck, Building2,
  CheckCircle, XCircle, RefreshCw, FileText, CalendarDays, Share2, Handshake,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { useAccountManagerPartners } from "features/partners/hooks";
import SearchInput from "components/ub/forms/selection/SearchInput";
import TableWrapper from "components/ub/data/tables/TableWrapper";
import TableSkeletonRows from "components/ub/data/tables/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/tables/TableEmptyRow";
import TableErrorRow from "components/ub/data/tables/TableErrorRow";
import TablePagination from "components/ub/data/tables/TablePagination";
import AnimatedTableRow from "components/ub/data/tables/AnimatedTableRow";
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
    <div className="mt-6 text-p2 bg-white rounded-lg border border-slate-200">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Advisors</h3>
          <p className="mt-0.5 text-sm text-slate-500">Advisors assigned to you</p>
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
          {searchTerm.trim() !== "" && (
            <Button
              onClick={clearFilters}
              icon={<RefreshCw className="h-4 w-4" />}
              text="Clear"
              bgColor="bg-white"
              textColor="text-red-600"
              borderColor="border-red-200"
              hoverTextColor="hover:text-red-600"
              hoverBorderColor="hover:border-red-200"
              className="hover:bg-red-50"
            />
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
              itemLabel="advisors"
              loading={loading}
            />
          }
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  { icon: Users,      label: "Advisor",      minW: "min-w-[160px] sm:min-w-[220px]" },
                  { icon: Mail,       label: "Contact Info", minW: "min-w-[150px] sm:min-w-[200px]", hide: "hidden sm:table-cell" },
                  { icon: FileText,   label: "Applications" },
                  { icon: BadgeCheck, label: "Status" },
                  { icon: CalendarDays, label: "Registered", hide: "hidden lg:table-cell" },
                ].map(({ icon: Icon, label, minW, hide }) => (
                  <th key={label} className={`${minW ?? ""} ${hide ?? ""} px-6 py-4 text-start text-sm font-semibold text-slate-900`}>
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
              {isInitialLoad && <TableSkeletonRows columns={6} rows={ITEMS_PER_PAGE} />}

              {!isInitialLoad && error && (
                <TableErrorRow colSpan={6} message={error} onRetry={refetch} />
              )}

              {!isInitialLoad && !error && partners.length === 0 && (
                <TableEmptyRow
                  colSpan={6}
                  title="No advisors found"
                  subtitle={searchTerm.trim() ? "Try adjusting your search." : "You don't have any assigned partners yet."}
                  icon={<Handshake className="h-8 w-8 text-slate-400" />}
                  action={
                    searchTerm.trim() ? (
                      <Button
                        onClick={clearFilters}
                        icon={<RefreshCw className="h-3.5 w-3.5" />}
                        text="Clear search"
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

              <AnimatePresence>
              {!isInitialLoad && !error && partners.map((partner) => (
                <AnimatedTableRow
                  key={partner.id}
                  className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                  onClick={() => router.push(`/account-manager/advisors/${partner.id}`)}
                >
                  <td className="min-w-[160px] max-w-[160px] px-6 py-4 sm:min-w-[220px] sm:max-w-[220px]">
                    <div className="flex items-center gap-2">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                        {partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${partner.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{partner.name || "Unknown Advisor"}</div>
                        <div className="truncate text-xs text-slate-500 capitalize">{partner.type || "—"} · {partner.country || "—"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="hidden min-w-[150px] max-w-[150px] px-6 py-4 sm:table-cell sm:min-w-[200px] sm:max-w-[200px]">
                    <div className="truncate text-sm text-slate-900">{partner.phone || "—"}</div>
                    <div className="truncate text-xs text-slate-500">{partner.email || "—"}</div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {partner.applications_count}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {partner.is_active ? (
                        <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                      ) : (
                        <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Inactive</StatusBadge>
                      )}
                      {partner.is_shared && (
                        <StatusBadge variant="info" icon={<Share2 className="h-3 w-3" />}>Shared</StatusBadge>
                      )}
                      {partner.agency_membership && (
                        <StatusBadge variant="info" icon={<Building2 className="h-3 w-3" />}>
                          Member of {partner.agency_membership.agency_name}
                        </StatusBadge>
                      )}
                    </div>
                  </td>

                  <td className="hidden px-6 py-4 lg:table-cell">
                    <div className="text-sm text-slate-900">
                      <AppDate value={partner.created_at} format="short" fallback="—" />
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                  </td>
                </AnimatedTableRow>
              ))}
              </AnimatePresence>
            </tbody>
          </table>
        </TableWrapper>
      </div>
    </div>
  );
}
