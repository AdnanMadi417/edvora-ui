"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Settings,
  CheckCircle,
  XCircle,
  User,
  PhoneCall,
  BadgeCheck,
  UserCog,
} from "lucide-react";

import { useAllPartners } from "hooks/partners/usePartnersList";
import { useAccountManagerList } from "hooks/account-managers/useAccountManagerList";

import NextButton from "components/ui/buttons/NextButton";
import PrevButton from "components/ui/buttons/PrevButton";

import NoMessagesFound from "components/emptyData/NoMessagesFound";
import EmptyData from "components/emptyData/EmptyTableData";
import AssignPartnerManager from "components/admin/partners/popups/AssignPartnerManager";

import Loading from "components/loading/Loading";

const PartnersTable = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const { partners, partnersLoading, partnersError } = useAllPartners();
  const { accountManagers } = useAccountManagerList();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<any>(null);

  const [selectedState, setSelectedState] = useState<string>("all");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const filteredPartners = partners.filter((partner) => {
    const term = searchTerm.toLowerCase();

    const matchesSearch = partner.name
      .toLowerCase()
      .match(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  }>({
    key: "",
    direction: "asc",
  });

  const sortedPartners = React.useMemo(() => {
    if (!sortConfig.key) return filteredPartners;

    return [...filteredPartners].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (typeof aValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      return 0;
    });
  }, [filteredPartners]);
  const currentPartners = sortedPartners.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const [selectedPartners, setselectedPartners] = useState<
    Record<string, boolean>
  >({});

  const selectedCount = Object.values(selectedPartners).filter(Boolean).length;

  useEffect(() => {
    if (currentPartners.length) {
      const defaults = {};
      currentPartners.forEach((p) => {
        defaults[p.id] = 1;
      });
    }
  }, [filteredPartners]);

  useEffect(() => {
    setselectedPartners((prev) => {
      const updated: Record<string, boolean> = { ...prev };
      filteredPartners.forEach((p) => {
        if (!(p.id in updated)) {
          updated[p.id] = false;
        }
      });
      return updated;
    });
  }, [filteredPartners]);

  const managerOptions = accountManagers.map((m) => ({
    label: m.name,
    value: m.id,
  }));

  return (
    <div className="mt-6 overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Partners</h3>
              <p className="mt-1 text-sm text-slate-500">
                Manage and view all partner organizations and collaboration
                details
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search by university, Partner, or level..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="bg-background w-full rounded-full border border-gray-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedState("all");
                setCurrentPage(1);
              }}
              className="flex items-center justify-center gap-2 rounded-full border border-red-600 px-4 py-2 text-sm font-medium text-red-700 transition hover:border-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>

            {selectedCount > 0 && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                {selectedCount} selected
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative mb-8 overflow-hidden rounded-lg border border-gray-200 bg-card">
        <div className="block">
          {partnersLoading && <Loading text="Fetching Partners data..." />}

          {!partnersError &&
            !partnersLoading &&
            currentPartners.length === 0 && (
              <NoMessagesFound
                title="No Partners found"
                subtitle="Try adjusting your search or filters."
              />
            )}

          {!partnersError && partners.length > 0 && (
            <div className="block">
              <div className="overflow-x-auto rounded-lg rounded-b-none bg-card">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-card">
                      <th className="group min-w-[250px] cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-500" />
                          <span>Partner Name</span>
                        </div>
                      </th>

                      <th className="group min-w-[220px] max-w-[260px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                        <div className="flex items-center gap-2">
                          <PhoneCall className="h-4 w-4 text-slate-500" />
                          <span>Contact Info</span>
                        </div>
                      </th>

                      <th className="group min-w-[220px] max-w-[260px] cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                        <div className="flex items-center gap-2">
                          <UserCog className="h-4 w-4 text-slate-500" />
                          <span>Assigned Manager</span>
                        </div>
                      </th>

                      <th className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="h-4 w-4 text-slate-500" />
                          <span>Status</span>
                        </div>
                      </th>

                      <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                        <div className="flex items-center gap-2">
                          <Settings className="h-4 w-4 text-slate-500" />
                          <span>Actions</span>
                        </div>
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-border-slate-200 divide-y bg-primary">
                    {partnersLoading ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-4 text-center text-p1 text-slate-500"
                        >
                          Loading Partners Data...
                        </td>
                      </tr>
                    ) : currentPartners.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className="px-6 py-8 text-center text-slate-500"
                        >
                          <EmptyData />
                        </td>
                      </tr>
                    ) : (
                      currentPartners.map((partner) => (
                        <tr
                          key={partner.id}
                          className="hover:bg-primary/10 group transition-colors"
                        >
                          <td className="min-w-[220px] max-w-[320px] px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="relative flex-shrink-0">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                                  {partner.name
                                    ? partner.name.slice(0, 2).toUpperCase()
                                    : "NA"}
                                </div>

                                <span
                                  className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                                    partner.is_active
                                      ? "bg-emerald-500"
                                      : "bg-slate-300"
                                  }`}
                                  title={
                                    partner.is_active ? "Active" : "Inactive"
                                  }
                                />
                              </div>

                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-slate-900">
                                  {partner.name || "Unknown Partner"}
                                </div>

                                <div className="truncate text-xs text-slate-500">
                                  {partner.country || "—"}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="min-w-0 space-y-1">
                              <div className="truncate text-sm text-slate-900">
                                {partner.phone || "No phone"}
                              </div>

                              <div className="truncate text-xs text-slate-500">
                                {partner.email || "No email"}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="truncate text-sm text-slate-900">
                              {partner.assigned_manager_name || (
                                <span className="text-xs text-slate-400">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm">
                              {partner.is_active ? (
                                <span className="bg inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-green-600 bg-green-50 px-3 py-1 text-xs text-green-600">
                                  <XCircle className="h-3 w-3" /> Active
                                </span>
                              ) : (
                                <span className="bg inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-red-600 bg-red-50 px-3 py-1 text-xs text-red-600">
                                  <CheckCircle className="h-3 w-3" /> Not Active
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                role="menuitem"
                                aria-label="Assign Manager"
                                onClick={() => {
                                  setSelectedPartner(partner);
                                  setIsAssignModalOpen(true);
                                }}
                                className="flex items-center justify-center rounded-full p-2 hover:bg-slate-100"
                              >
                                <UserCog className="h-4 w-4 text-slate-500 hover:text-slate-700" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-1 items-center gap-4 border-t border-gray-200 p-4 sm:p-6 md:flex  md:justify-between">
                {partners.length > 0 && (
                  <div className="flex items-center gap-1 text-sm font-medium text-slate-500">
                    Showing
                    <span className="font-medium">
                      {(currentPage - 1) * itemsPerPage + 1}
                    </span>
                    to
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, partners.length)}
                    </span>
                    of
                    <span className="font-medium">{partners.length}</span>
                    Partners
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <PrevButton
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    text="Prev"
                    icon={<ArrowLeft className="h-4 w-4" />}
                  />

                  <span className="px-3 py-1 font-medium text-slate-500">
                    Page {currentPage} of{" "}
                    {Math.ceil(partners.length / itemsPerPage)}
                  </span>

                  <NextButton
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(
                          prev + 1,
                          Math.ceil(partners.length / itemsPerPage)
                        )
                      )
                    }
                    disabled={
                      currentPage === Math.ceil(partners.length / itemsPerPage)
                    }
                    text="Next"
                    icon={<ArrowRight className="h-4 w-4" />}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
};

export default PartnersTable;
