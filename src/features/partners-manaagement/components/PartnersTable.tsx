"use client";

import { AxiosError } from "axios";
import React, { useEffect, useState } from "react";
import {
  Search, RefreshCw, ArrowRight, ArrowLeft, Settings,
  CheckCircle, XCircle, User, PhoneCall, BadgeCheck,
  UserCog, Handshake, Trash2, ChevronRight, Pencil,
  SlidersHorizontal, Filter,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAllPartners, useDeletePartner } from "../hooks";
import { useAccountManagerList } from "hooks/account-managers/useAccountManagerList";
import AssignPartnerManager from "./AssignPartnerManager";
import DeletePartner from "./DeletePartner";
import FilterSelectField from "components/form/filter/FilterSelectField";
import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";
import NoMessagesFound from "components/emptyData/NoMessagesFound";
import Loading from "components/loading/Loading";
import Link from "components/ui/links/LinkBtn";
import { useToast } from "components/context/ToastContext";
import { PARTNER_TYPE } from "constants/lists";

const ITEMS_PER_PAGE = 10;

export default function PartnersTable() {
  const router = useRouter();
  const { showToast } = useToast();

  const { partners, partnersLoading, partnersError } = useAllPartners();
  const { accountManagers } = useAccountManagerList();
  const { deletePartner, loading: deleteLoading } = useDeletePartner();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedManager, setSelectedManager] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

  const filteredPartners = React.useMemo(() =>
    partners
      .filter((p) => {
        const term = searchTerm.toLowerCase();
        return p.name?.toLowerCase().includes(term) || p.email?.toLowerCase().includes(term);
      })
      .filter((p) => selectedManager === "all" || p.assigned_manager_id === selectedManager)
      .filter((p) => selectedType === "all" || p.type === selectedType),
    [partners, searchTerm, selectedManager, selectedType]
  );

  const currentPartners = filteredPartners.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(filteredPartners.length / ITEMS_PER_PAGE);

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
      router.push("/admin/partners");
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string }>;
      showToast(axiosError.response?.data?.message || "Failed to delete partner.", "error");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedManager("all");
    setSelectedType("all");
    setCurrentPage(1);
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Partners</h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage and view all partner organizations and collaboration details
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="flex items-center gap-2 sm:contents">
              <div className="relative flex-1 sm:w-64 sm:flex-none flex-shrink-0">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="bg-background w-full rounded-md border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <button
                className="relative sm:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-gray-200 bg-background text-slate-500 hover:bg-slate-50"
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

            <div className={`flex-col gap-3 sm:contents ${showMobileFilters ? "flex" : "hidden sm:contents"}`}>
              <div className="w-full flex-shrink-0 sm:w-48">
                <FilterSelectField value={selectedManager} onChange={setSelectedManager} options={managerOptions} icon={UserCog} defaultOption="All Managers" />
              </div>
              <div className="w-full flex-shrink-0 sm:w-48">
                <FilterSelectField value={selectedType} onChange={setSelectedType} options={PARTNER_TYPE.map((t) => ({ label: t.label, value: t.value }))} icon={Filter} defaultOption="All Types" />
              </div>
              <button onClick={clearFilters} className="flex items-center justify-center gap-2 rounded-md border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100">
                <RefreshCw className="h-4 w-4" /> Clear
              </button>
            </div>

            <Link href="/admin/partners/register-partner" icon={<Handshake className="h-5 w-5" />} label="Register Partner" bgColor="bg-blue-50" textColor="text-blue-700" borderColor="border-blue-600" hoverTextColor="hover:text-blue-800" hoverBorderColor="hover:border-blue-700" />
          </div>
        </div>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="overflow-x-auto rounded-lg rounded-b-none bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-card">
                {[
                  { icon: User, label: "Partner Name", minW: "min-w-[250px]" },
                  { icon: PhoneCall, label: "Contact Info", minW: "min-w-[220px]" },
                  { icon: UserCog, label: "Assigned Manager", minW: "min-w-[220px]" },
                  { icon: BadgeCheck, label: "Status" },
                  { icon: Settings, label: "Actions" },
                ].map(({ icon: Icon, label, minW }) => (
                  <th key={label} className={`group ${minW ?? ""} cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900`}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-500" />
                      <span>{label}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 bg-primary">
              {partnersLoading && (
                <tr><td colSpan={5} className="px-6 py-8 text-center"><Loading text="Fetching Partners data..." /></td></tr>
              )}

              {!partnersError && !partnersLoading && currentPartners.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-8 text-center"><NoMessagesFound title="No partners found" subtitle="There are currently no partners available." /></td></tr>
              )}

              {!partnersError && currentPartners.map((partner) => (
                <tr
                  key={partner.id}
                  className="group cursor-pointer transition-colors hover:bg-primary/10"
                  onClick={() => router.push(`/admin/partners/${partner.id}`)}
                >
                  <td className="min-w-[220px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                        {partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{partner.name || "Unknown Partner"}</div>
                        <div className="truncate text-xs text-slate-500">{partner.country || "Not Provided"}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="truncate text-sm text-slate-900">{partner.phone || "No phone"}</div>
                      <div className="truncate text-xs text-slate-500">{partner.email || "No email"}</div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="truncate text-sm text-slate-900">
                      {partner.assigned_manager_name || <span className="text-slate-400">Unassigned</span>}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {partner.is_active ? (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-green-600 bg-green-50 px-3 py-1 text-xs text-green-600">
                        <CheckCircle className="h-3 w-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md border border-red-600 bg-red-50 px-3 py-1 text-xs text-red-600">
                        <XCircle className="h-3 w-3" /> Not Active
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <a href={`/admin/partners/${partner.id}/edit`} onClick={(e) => e.stopPropagation()} className="flex items-center justify-center rounded-md p-2 hover:bg-slate-100">
                        <Pencil className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                      </a>
                      <div className="h-6 border-l border-slate-200" />
                      <button onClick={(e) => { e.stopPropagation(); setSelectedPartner(partner); setIsAssignModalOpen(true); }} className="flex items-center justify-center rounded-md p-2 hover:bg-slate-100">
                        <UserCog className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                      </button>
                      <div className="h-6 border-l border-slate-200" />
                      <button onClick={(e) => { e.stopPropagation(); setSelectedPartnerId(partner.id); setIsDeleteOpen(true); }} className="flex items-center justify-center rounded-md p-2 hover:bg-slate-100">
                        <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
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

        <div className="grid grid-cols-1 items-center gap-4 border-t border-gray-200 p-4 sm:p-6 md:flex md:justify-between">
          {partners.length > 0 && (
            <span className="text-sm font-medium text-slate-500">
              Showing <span className="font-medium">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to{" "}
              <span className="font-medium">{Math.min(currentPage * ITEMS_PER_PAGE, filteredPartners.length)}</span> of{" "}
              <span className="font-medium">{filteredPartners.length}</span> Partners
            </span>
          )}
          <div className="flex justify-end gap-2">
            <PrevButton onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1} text="Prev" icon={<ArrowLeft className="h-4 w-4" />} />
            <span className="px-3 py-1 font-medium text-slate-500">Page {currentPage} of {totalPages}</span>
            <NextButton onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} text="Next" icon={<ArrowRight className="h-4 w-4" />} />
          </div>
        </div>
      </div>

      <DeletePartner isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} isDeleting={deleteLoading} />

      {isAssignModalOpen && selectedPartner && (
        <AssignPartnerManager
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          partnerId={selectedPartner.id}
          currentManagerId={selectedPartner.assigned_manager_id}
          managerOptions={managerOptions}
        />
      )}
    </div>
  );
}
