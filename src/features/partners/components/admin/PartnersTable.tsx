"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Pencil, RefreshCw, SlidersHorizontal, Building2,
  UserCog, Users, CheckCircle, XCircle, BadgeCheck, BadgeX, User, ShieldCheck, CalendarDays,
} from "lucide-react";
import { AppDate } from "components/ui/date";
import { useRouter } from "next/navigation";
import { usePartners, useDeletePartner } from "features/partners/hooks";
import { useAccountManagers } from "features/account-managers/hooks";
import AssignPartnerManager from "./AssignPartnerManager";
import ReviewPartnerPopup from "./ReviewPartnerPopup";
import StatsFilterCards, { type FilterCardItem } from "components/filters/StatsFilterCards";
import FilterSelectField from "components/form/filter/FilterSelectField";
import SearchInput from "components/form/filter/SearchInput";
import { TableWrapper, TableSkeletonRows, TableEmptyRow, TableErrorRow, TablePagination } from "components/ui/table";
import PresignedImage from "components/ui/PresignedImage";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";

const ITEMS_PER_PAGE = 10;

type StatusFilter = "active" | "inactive" | "verified" | "unverified" | "individual" | "agency" | null;

function statusToParams(status: StatusFilter): { is_active?: boolean; is_verified?: boolean; type?: string } {
  if (status === "active")     return { is_active: true };
  if (status === "inactive")   return { is_active: false };
  if (status === "verified")   return { is_verified: true };
  if (status === "unverified") return { is_verified: false };
  if (status === "individual") return { type: "individual" };
  if (status === "agency")     return { type: "agency" };
  return {};
}

export default function PartnersTable() {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedManager, setSelectedManager] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("unverified");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const { accountManagers } = useAccountManagers();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewPartner, setReviewPartner] = useState<{ id: string; name: string } | null>(null);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { partners, total, stats, loading, error, refetch } = usePartners({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    assigned_manager_id: selectedManager !== "all" ? selectedManager : undefined,
    ...statusToParams(selectedStatus),
  });

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

  const statsCards = useMemo<FilterCardItem[]>(() => [
    { id: "unverified",  label: "Pending Review", count: stats?.unverified ?? 0, icon: BadgeX,      colorScheme: "amber" },
    { id: "active",      label: "Active",          count: stats?.active     ?? 0, icon: CheckCircle, colorScheme: "emerald" },
    { id: "inactive",    label: "Suspended",       count: stats?.inactive   ?? 0, icon: XCircle,     colorScheme: "rose" },
    { id: "verified",    label: "Verified",        count: stats?.verified   ?? 0, icon: BadgeCheck,  colorScheme: "blue" },
    { id: "individual",  label: "Individual",      count: stats?.individual ?? 0, icon: User,        colorScheme: "violet" },
    { id: "agency",      label: "Company",         count: stats?.agency     ?? 0, icon: Building2,   colorScheme: "cyan" },
  ], [stats]);

  const displayTotal = partners.length < ITEMS_PER_PAGE
    ? (currentPage - 1) * ITEMS_PER_PAGE + partners.length
    : total;

  const activeFiltersCount = [
    selectedManager !== "all",
    searchTerm !== "",
  ].filter(Boolean).length;

  const managerOptions = accountManagers.map((m) => ({ label: m.name, value: m.id }));

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedManager("all");
    setCurrentPage(1);
  };

  const handleCardSelect = (id: string | null) => {
    setSelectedStatus((prev) => (prev === id ? null : (id as StatusFilter)));
    setCurrentPage(1);
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto text-p2 bg-white rounded-lg border border-slate-200">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Partners</h3>
          <p className="mt-0.5 text-sm text-slate-500">Manage and view all partner organizations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="hidden sm:block p-6 border-b border-slate-200">
        <StatsFilterCards
          cards={statsCards}
          selectedId={selectedStatus}
          onSelect={handleCardSelect}
        />
      </div>

      {/* Filter Bar */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

          {/* Search + mobile toggle */}
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
            {activeFiltersCount > 0 && (
              <div className="sm:hidden">
                <IconButton
                  onClick={clearFilters}
                  icon={<RefreshCw className="h-4 w-4" />}
                  bgColor="bg-white"
                  textColor="text-red-500"
                  borderColor="border-red-200"
                  hoverTextColor="hover:text-red-500"
                  hoverBorderColor="hover:border-red-200"
                  className="hover:bg-red-50"
                />
              </div>
            )}
          </div>

          {/* Collapsible dropdowns */}
          <div className={`flex w-full flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out sm:contents ${showMobileFilters ? "max-h-[200px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"}`}>
            <div className="w-full sm:w-44 flex-shrink-0">
              <FilterSelectField
                value={selectedManager}
                onChange={(v: string) => { setSelectedManager(v); setCurrentPage(1); }}
                options={managerOptions}
                icon={UserCog}
                defaultOption="All Managers"
              />
            </div>

            {(activeFiltersCount > 0 || debouncedSearch !== "") && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                {displayTotal.toLocaleString()}
                <span className="font-normal text-blue-500">results</span>
              </span>
            )}

            {activeFiltersCount > 0 && (
              <div className="hidden sm:block">
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
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">

        {/* Table */}
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
                  { icon: Users,      label: "Partner",          minW: "min-w-[250px]" },
                  { icon: Users,      label: "Contact Info",     minW: "min-w-[220px]" },
                  { icon: UserCog,    label: "Assigned Manager", minW: "min-w-[180px]" },
                  { icon: BadgeCheck, label: "Status" },
                  { icon: CalendarDays, label: "Registered" },
                  { icon: Pencil,     label: "Actions" },
                ].map(({ icon: Icon, label, minW }) => (
                  <th key={label} className={`${minW ?? ""} px-6 py-4 text-start text-sm font-semibold tracking-wider text-slate-900`}>
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
              {isInitialLoad && <TableSkeletonRows columns={7} rows={ITEMS_PER_PAGE} />}

              {!isInitialLoad && error && (
                <TableErrorRow colSpan={7} message={error} onRetry={refetch} />
              )}

              {!isInitialLoad && !error && partners.length === 0 && (
                <TableEmptyRow
                  colSpan={7}
                  title="No partners found"
                  subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "No partners have registered yet."}
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

              {!isInitialLoad && !error && partners.map((partner) => (
                  <tr
                    key={partner.id}
                    className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                    onClick={() => router.push(`/admin/partners/${partner.id}`)}
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
                      <div className="truncate text-sm text-slate-900">
                        {partner.assigned_manager_name || <span className="text-slate-400">Unassigned</span>}
                      </div>
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

                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900">
                        <AppDate value={partner.created_at} format="short" fallback="—" />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>

                        {!partner.is_verified && !partner.is_active && (
                          <>
                            <IconButton
                              onClick={() => { setReviewPartner({ id: partner.id, name: partner.name || "" }); setIsReviewOpen(true); }}
                              title="Review registration"
                              icon={<ShieldCheck className="h-4 w-4" />}
                              bgColor="bg-transparent"
                              textColor="text-amber-400"
                              borderColor="border-transparent"
                              hoverTextColor="hover:text-amber-600"
                              hoverBorderColor="hover:border-transparent"
                              className="hover:bg-amber-50"
                            />
                            <div className="h-5 border-l border-slate-200" />
                          </>
                        )}

                        <a
                          href={`/admin/partners/${partner.id}/edit`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        >
                          <Pencil className="h-4 w-4" />
                        </a>
                        <div className="h-5 border-l border-slate-200" />
                        <IconButton
                          onClick={() => { setSelectedPartner(partner); setIsAssignModalOpen(true); }}
                          title="Assign manager"
                          icon={<UserCog className="h-4 w-4" />}
                          bgColor="bg-transparent"
                          textColor="text-slate-400"
                          borderColor="border-transparent"
                          hoverTextColor="hover:text-slate-700"
                          hoverBorderColor="hover:border-transparent"
                          className="hover:bg-slate-100"
                        />
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

      {reviewPartner && (
        <ReviewPartnerPopup
          isOpen={isReviewOpen}
          onClose={() => setIsReviewOpen(false)}
          onSuccess={refetch}
          partnerId={reviewPartner.id}
          partnerName={reviewPartner.name}
        />
      )}

      {isAssignModalOpen && selectedPartner && (
        <AssignPartnerManager
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          onSuccess={refetch}
          partnerId={selectedPartner.id}
          currentManagerId={selectedPartner.assigned_manager_id}
          managerOptions={managerOptions}
        />
      )}
    </div>
  );
}
