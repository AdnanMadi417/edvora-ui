"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  RefreshCw, Users, UserCog, BadgeCheck, CalendarDays, Pencil,
  ShieldCheck, CheckCircle, XCircle, Ban, Power, Clock, Handshake,
  SlidersHorizontal, Building2, User,
} from "lucide-react";
import { AppDate } from "components/ui/date";
import { StatusBadge } from "components/ui/badges";
import { usePartners, useUpdatePartner } from "features/partners/hooks";
import { useAccountManagers } from "features/account-managers/hooks";
import ReviewPartnerPopup from "../admin/ReviewPartnerPopup";
import SuspendActivatePartner from "../admin/SuspendActivatePartner";
import StatsFilterCards, { type FilterCardItem } from "components/filters/StatsFilterCards";
import FilterSelectField from "components/form/filter/FilterSelectField";
import SearchInput from "components/form/filter/SearchInput";
import { TableWrapper, TableSkeletonRows, TableEmptyRow, TableErrorRow, TablePagination } from "components/ui/table";
import PresignedImage from "components/ui/PresignedImage";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

const ITEMS_PER_PAGE = 10;

type StatusFilter = "active" | "inactive" | "individual" | "agency" | null;

function statusToParams(status: StatusFilter): { is_active?: boolean; type?: string } {
  if (status === "active")     return { is_active: true };
  if (status === "inactive")   return { is_active: false };
  if (status === "individual") return { type: "individual" };
  if (status === "agency")     return { type: "agency" };
  return {};
}

export default function ReviewerPartnersTable() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedManager, setSelectedManager] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const { accountManagers } = useAccountManagers();
  const managerOptions = accountManagers.map((m) => ({ label: m.name, value: m.id }));

  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewPartner, setReviewPartner] = useState<{ id: string; name: string; assignedManagerId?: string } | null>(null);

  const { showToast } = useToast();
  const { updatePartner, isUpdatingPartner } = useUpdatePartner();
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [suspendTarget, setSuspendTarget] = useState<any>(null);

  const handleSuspendActivate = async () => {
    if (!suspendTarget) return;
    try {
      // Only the field actually changing — see PartnersTable.tsx for why
      // sending the whole stale row here is dangerous.
      await updatePartner(suspendTarget.id, {
        is_active: !suspendTarget.is_active,
      });
      showToast(suspendTarget.is_active ? "Partner account suspended" : "Partner account activated", "success");
      setIsSuspendOpen(false);
      refetch();
    } catch (err: unknown) {
      const fallback = suspendTarget.is_active ? "Failed to suspend account" : "Failed to activate account";
      showToast(parseApiError(err, fallback), "error");
    }
  };

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

  const loadingStartedRef = React.useRef(false);
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
    { id: "active",      label: "Active",     count: stats?.active     ?? 0, icon: CheckCircle, colorScheme: "emerald" },
    { id: "inactive",    label: "Suspended",  count: stats?.inactive   ?? 0, icon: XCircle,     colorScheme: "rose" },
    { id: "individual",  label: "Individual", count: stats?.individual ?? 0, icon: User,        colorScheme: "violet" },
    { id: "agency",      label: "Company",    count: stats?.agency     ?? 0, icon: Building2,   colorScheme: "cyan" },
  ], [stats]);

  const displayTotal = partners.length < ITEMS_PER_PAGE
    ? (currentPage - 1) * ITEMS_PER_PAGE + partners.length
    : total;

  const activeFiltersCount = [
    selectedManager !== "all",
    searchTerm !== "",
  ].filter(Boolean).length;

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
          <h3 className="text-xl font-semibold text-slate-900">Partner Registrations</h3>
          <p className="mt-0.5 text-sm text-slate-500">Review and approve or reject partner registrations</p>
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

      <div className="overflow-x-auto p-6">
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
                { icon: Users,      label: "Partner",          minW: "min-w-[180px] sm:min-w-[250px]" },
                { icon: Users,      label: "Contact Info",     minW: "min-w-[160px] sm:min-w-[220px]", hide: "hidden sm:table-cell" },
                { icon: UserCog,    label: "Assigned Manager", minW: "min-w-[130px] sm:min-w-[180px]", hide: "hidden md:table-cell" },
                { icon: BadgeCheck, label: "Status" },
                { icon: CalendarDays, label: "Registered", hide: "hidden lg:table-cell" },
                { icon: Pencil,     label: "Actions" },
              ].map(({ icon: Icon, label, minW, hide }) => (
                <th key={label} className={`${minW ?? ""} ${hide ?? ""} px-6 py-4 text-start text-sm font-semibold tracking-wider text-slate-900`}>
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-slate-400" />
                    {label}
                  </div>
                </th>
              ))}
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
                title="No partners found"
                subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "No partners have registered yet."}
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

            {!isInitialLoad && !error && partners.map((partner) => {
              const isPending = !partner.is_verified && !partner.is_active;
              return (
                <tr
                  key={partner.id}
                  className="cursor-pointer transition-colors hover:bg-slate-100/50"
                  onClick={() => router.push(`/reviewer/partners/${partner.id}`)}
                >
                  <td className="min-w-[180px] max-w-[180px] px-6 py-4 sm:min-w-[250px] sm:max-w-[250px]">
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
                        <div className="truncate text-sm font-medium text-slate-900">
                          {partner.type === "agency" ? partner.company_details?.company_name || partner.name || "Unknown Partner" : partner.name || "Unknown Partner"}
                        </div>
                        <div className="truncate text-xs text-slate-500 capitalize">
                          {partner.type === "agency" && partner.company_details?.company_name ? `${partner.name} · ` : ""}
                          {partner.type || "—"} · {partner.country || "—"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="hidden min-w-[160px] max-w-[160px] px-6 py-4 sm:table-cell sm:min-w-[220px] sm:max-w-[220px]">
                    <div className="truncate text-sm text-slate-900">{partner.phone || "—"}</div>
                    <div className="truncate text-xs text-slate-500">{partner.email || "—"}</div>
                  </td>

                  <td className="hidden max-w-[180px] px-6 py-4 md:table-cell">
                    <div className="truncate text-sm text-slate-900">
                      {partner.assigned_manager_name || <span className="text-slate-400">Unassigned</span>}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {isPending ? (
                      <StatusBadge variant="warning" icon={<Clock className="h-3 w-3" />}>Pending Review</StatusBadge>
                    ) : partner.is_active ? (
                      <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                    ) : (
                      <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Inactive</StatusBadge>
                    )}
                  </td>

                  <td className="hidden px-6 py-4 lg:table-cell">
                    <div className="text-sm text-slate-900">
                      <AppDate value={partner.created_at} format="short" fallback="—" />
                    </div>
                  </td>

                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      {isPending && (
                        <>
                          <IconButton
                            onClick={() => { setReviewPartner({ id: partner.id, name: partner.name || "", assignedManagerId: partner.assigned_manager_id || undefined }); setIsReviewOpen(true); }}
                            title="Review registration"
                            icon={<ShieldCheck className="h-4 w-4" />}
                            bgColor="bg-transparent"
                            textColor="text-amber-500"
                            borderColor="border-transparent"
                            hoverTextColor="hover:text-amber-600"
                            hoverBorderColor="hover:border-transparent"
                            className="hover:bg-amber-50"
                          />
                          <div className="h-5 border-l border-slate-200" />
                        </>
                      )}

                      <IconButton
                        onClick={() => { setSuspendTarget(partner); setIsSuspendOpen(true); }}
                        title={partner.is_active ? "Suspend account" : "Activate account"}
                        icon={partner.is_active ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                        bgColor="bg-transparent"
                        textColor="text-slate-400"
                        borderColor="border-transparent"
                        hoverTextColor={partner.is_active ? "hover:text-red-600" : "hover:text-emerald-600"}
                        hoverBorderColor="hover:border-transparent"
                        className={partner.is_active ? "hover:bg-red-50" : "hover:bg-emerald-50"}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
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
          managerOptions={managerOptions}
          currentManagerId={reviewPartner.assignedManagerId}
        />
      )}

      {suspendTarget && (
        <SuspendActivatePartner
          isOpen={isSuspendOpen}
          onClose={() => setIsSuspendOpen(false)}
          onConfirm={handleSuspendActivate}
          isSubmitting={isUpdatingPartner}
          partnerName={suspendTarget.name || ""}
          isActive={!!suspendTarget.is_active}
        />
      )}
    </div>
  );
}
