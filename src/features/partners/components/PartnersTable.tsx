"use client";

import { AxiosError } from "axios";
import React, { useMemo, useState } from "react";
import {
  ArrowLeft, ArrowRight, ChevronRight, Handshake, LayoutGrid,
  Pencil, RefreshCw, SlidersHorizontal, Trash2, Building2,
  UserCog, Users, CheckCircle, XCircle, BadgeCheck, BadgeX, User, ShieldCheck,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAllPartners, useDeletePartner } from "../hooks";
import { useAccountManagers } from "features/account-managers/hooks";
import AssignPartnerManager from "./AssignPartnerManager";
import DeletePartner from "./DeletePartner";
import ReviewPartnerPopup from "./ReviewPartnerPopup";
import StatsFilterCards, { type FilterCardItem } from "components/filters/StatsFilterCards";
import FilterSelectField from "components/form/filter/FilterSelectField";
import SearchInput from "components/form/filter/SearchInput";
import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";
import NoMessagesFound from "components/emptyData/NoMessagesFound";
import Loading from "components/loading/Loading";
import Link from "components/ui/links/LinkBtn";
import { useToast } from "components/context/ToastContext";
import { PARTNER_TYPE } from "constants/lists";

const ITEMS_PER_PAGE = 10;

type StatusFilter = "active" | "inactive" | "verified" | "unverified" | "individual" | "company" | null;

export default function PartnersTable() {
  const router = useRouter();
  const { showToast } = useToast();

  const { partners, partnersLoading, partnersError, refetch } = useAllPartners();
  const { accountManagers } = useAccountManagers();
  const { deletePartner, loading: deleteLoading } = useDeletePartner();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManager, setSelectedManager] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [reviewPartner, setReviewPartner] = useState<{ id: string; name: string } | null>(null);

  // Stats
  const statsCards = useMemo<FilterCardItem[]>(() => [
    { id: null,           label: "All Partners", count: partners.length,                                       icon: LayoutGrid,  colorScheme: "slate" },
    { id: "active",       label: "Active",        count: partners.filter((p) => p.is_active).length,           icon: CheckCircle, colorScheme: "emerald" },
    { id: "inactive",     label: "Inactive",      count: partners.filter((p) => !p.is_active).length,          icon: XCircle,     colorScheme: "rose" },
    { id: "verified",     label: "Verified",      count: partners.filter((p) => p.is_verified).length,         icon: BadgeCheck,  colorScheme: "blue" },
    { id: "unverified",   label: "Not Verified",  count: partners.filter((p) => !p.is_verified).length,        icon: BadgeX,      colorScheme: "amber" },
    { id: "individual",   label: "Individual",    count: partners.filter((p) => p.type === "individual").length,icon: User,        colorScheme: "violet" },
    { id: "company",      label: "Company",       count: partners.filter((p) => p.type === "company").length,  icon: Building2,   colorScheme: "cyan" },
  ], [partners]);

  const filteredPartners = useMemo(() =>
    partners
      .filter((p) => {
        const term = searchTerm.toLowerCase();
        return p.name?.toLowerCase().includes(term) || p.email?.toLowerCase().includes(term);
      })
      .filter((p) => selectedManager === "all" || p.assigned_manager_id === selectedManager)
      .filter((p) => selectedType === "all" || p.type === selectedType)
      .filter((p) => {
        if (!selectedStatus) return true;
        if (selectedStatus === "active") return p.is_active;
        if (selectedStatus === "inactive") return !p.is_active;
        if (selectedStatus === "verified") return p.is_verified;
        if (selectedStatus === "unverified") return !p.is_verified;
        if (selectedStatus === "individual") return p.type === "individual";
        if (selectedStatus === "company") return p.type === "company";
        return true;
      }),
    [partners, searchTerm, selectedManager, selectedType, selectedStatus]
  );

  const totalPages = Math.ceil(filteredPartners.length / ITEMS_PER_PAGE);
  const currentPartners = filteredPartners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const activeFiltersCount = [
    selectedManager !== "all",
    selectedType !== "all",
    searchTerm !== "",
  ].filter(Boolean).length;

  const managerOptions = accountManagers.map((m) => ({ label: m.name, value: m.id }));

  const handleDelete = async () => {
    if (!selectedPartnerId) return;
    try {
      await deletePartner(selectedPartnerId);
      showToast("Partner deleted successfully.", "success");
      setIsDeleteOpen(false);
      setSelectedPartnerId(null);
      refetch();
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      showToast(axiosError.response?.data?.message || "Failed to delete partner.", "error");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedManager("all");
    setSelectedType("all");
    setSelectedStatus(null);
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
        <Link
          href="/admin/partners/register-partner"
          icon={<Handshake className="h-5 w-5" />}
          label="Register Partner"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-blue-800"
          hoverBorderColor="hover:border-blue-700"
        />
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
          <div className="flex items-center gap-2 sm:contents">
            <SearchInput
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Search by name or email..."
              className="sm:w-64 sm:flex-none"
            />
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

          <div className={`flex w-full flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out sm:contents ${showMobileFilters ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"}`}>
            <div className="w-full sm:w-44 flex-shrink-0">
              <FilterSelectField
                value={selectedManager}
                onChange={(v: string) => { setSelectedManager(v); setCurrentPage(1); }}
                options={managerOptions}
                icon={UserCog}
                defaultOption="All Managers"
              />
            </div>
            <div className="w-full sm:w-44 flex-shrink-0">
              <FilterSelectField
                value={selectedType}
                onChange={(v: string) => { setSelectedType(v); setCurrentPage(1); }}
                options={PARTNER_TYPE.map((t) => ({ label: t.label, value: t.value }))}
                icon={Users}
                defaultOption="All Types"
              />
            </div>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        
      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  { icon: Users,      label: "Partner",          minW: "min-w-[250px]" },
                  { icon: Users,      label: "Contact Info",     minW: "min-w-[220px]" },
                  { icon: UserCog,    label: "Assigned Manager", minW: "min-w-[180px]" },
                  { icon: BadgeCheck, label: "Status" },
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

            <tbody className="divide-y divide-slate-100 bg-white">
              {partnersLoading && (
                <tr><td colSpan={6} className="px-6 py-10 text-center"><Loading text="Fetching partners..." /></td></tr>
              )}

              {!partnersError && !partnersLoading && currentPartners.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center"><NoMessagesFound title="No partners found" subtitle="Try adjusting your filters." /></td></tr>
              )}

              {!partnersError && currentPartners.map((partner) => (
                <tr
                  key={partner.id}
                  className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                  onClick={() => router.push(`/admin/partners/${partner.id}`)}
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
                    <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {!partner.is_verified && (
                        <>
                          <button
                            onClick={() => { setReviewPartner({ id: partner.id, name: partner.name || "" }); setIsReviewOpen(true); }}
                            className="flex items-center justify-center rounded-lg p-2 text-amber-400 transition hover:bg-amber-50 hover:text-amber-600"
                            title="Review registration"
                          >
                            <ShieldCheck className="h-4 w-4" />
                          </button>
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
                      <button
                        onClick={() => { setSelectedPartner(partner); setIsAssignModalOpen(true); }}
                        className="flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <UserCog className="h-4 w-4" />
                      </button>
                      <div className="h-5 border-l border-slate-200" />
                      <button
                        onClick={() => { setSelectedPartnerId(partner.id); setIsDeleteOpen(true); }}
                        className="flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <ChevronRight className="h-4 w-4 text-slate-300 opacity-0 transition-opacity group-hover:opacity-100" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 p-6 text-sm text-slate-500 sm:flex-row">
          {filteredPartners.length > 0 ? (
            <span>
              Showing <span className="font-medium text-slate-700">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-medium text-slate-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPartners.length)}</span> of{" "}
              <span className="font-medium text-slate-700">{filteredPartners.length}</span> partners
            </span>
          ) : <span />}
          <div className="flex items-center gap-2">
            <PrevButton onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} text="Prev" icon={<ArrowLeft className="h-4 w-4" />} />
            <span>Page {currentPage} of {Math.max(totalPages, 1)}</span>
            <NextButton onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage >= totalPages} text="Next" icon={<ArrowRight className="h-4 w-4" />} />
          </div>
        </div>
      </div>

      </div>

      <DeletePartner isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} isDeleting={deleteLoading} />

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
