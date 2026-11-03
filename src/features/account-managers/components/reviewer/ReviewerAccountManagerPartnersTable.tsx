"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  ChevronRight, Users, Mail, BadgeCheck,
  CheckCircle, XCircle, RefreshCw, SlidersHorizontal, Handshake,
} from "lucide-react";
import { usePartners } from "features/partners/hooks";
import FilterSelectField from "components/ub/forms/FilterSelectField";
import SearchInput from "components/ub/forms/SearchInput";
import TableWrapper from "components/ub/data/TableWrapper";
import TableSkeletonRows from "components/ub/data/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/TableEmptyRow";
import TableErrorRow from "components/ub/data/TableErrorRow";
import TablePagination from "components/ub/data/TablePagination";
import AnimatedTableRow from "components/ub/data/AnimatedTableRow";
import StatusBadge from "components/ub/data/StatusBadge";
import PresignedImage from "components/ub/data/PresignedImage";
import Button from "components/ub/core/Button";

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
  const router = useRouter();
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

  return (
    <div className="mb-5 rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Assigned Advisors</h3>
          <p className="mt-0.5 text-sm text-slate-500">Advisors managed by this account manager</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="border-b border-slate-200 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center gap-2 sm:contents">
            <SearchInput
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
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
                value={selectedStatus}
                onChange={(v: string) => { setSelectedStatus(v as StatusFilter); setCurrentPage(1); }}
                options={STATUS_OPTIONS}
                icon={Users}
                defaultOption="All Statuses"
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
                  { icon: Users,      label: "Advisor",      minW: "min-w-[220px]" },
                  { icon: Mail,       label: "Contact Info", minW: "min-w-[200px]" },
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
              {isInitialLoad && <TableSkeletonRows columns={4} rows={ITEMS_PER_PAGE} />}

              {!isInitialLoad && error && (
                <TableErrorRow colSpan={4} message={error} onRetry={refetch} />
              )}

              {!isInitialLoad && !error && partners.length === 0 && (
                <TableEmptyRow
                  colSpan={4}
                  title="No advisors found"
                  subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "This manager has no assigned advisors yet."}
                  icon={<Handshake className="h-8 w-8 text-slate-400" />}
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

              <AnimatePresence>
              {!isInitialLoad && !error && partners.map((partner) => (
                <AnimatedTableRow
                  key={partner.id}
                  className="group cursor-pointer transition-colors hover:bg-slate-50/50"
                  onClick={() => router.push(`/reviewer/advisors/${partner.id}`)}
                >
                  <td className="min-w-[220px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                        <PresignedImage
                          fileKey={(partner.type === "individual" ? partner.individual_details?.profile_photo_file_key : partner.company_details?.logo_file_key) ?? undefined}
                          alt={partner.name}
                          className="h-full w-full object-cover"
                          fallback={partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
                        />
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${partner.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{partner.name || "Unknown Advisor"}</div>
                        <div className="truncate text-xs text-slate-500 capitalize">{partner.type || "—"} · {partner.country || "—"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="truncate text-sm text-slate-900">{partner.phone || "—"}</div>
                    <div className="truncate text-xs text-slate-500">{partner.email || "—"}</div>
                  </td>

                  <td className="px-6 py-4">
                    {partner.is_active ? (
                      <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                    ) : (
                      <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Inactive</StatusBadge>
                    )}
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
