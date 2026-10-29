"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { ChevronRight, Eye, EyeOff, Landmark, Pencil, RefreshCw, SlidersHorizontal } from "lucide-react";
import SearchInput from "components/ub/forms/SearchInput";
import FilterSelectField from "components/ub/forms/FilterSelectField";
import Button from "components/ub/core/Button";
import IconButton from "components/ub/core/IconButton";
import TableWrapper from "components/ub/data/TableWrapper";
import TableSkeletonRows from "components/ub/data/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/TableEmptyRow";
import TableErrorRow from "components/ub/data/TableErrorRow";
import TablePagination from "components/ub/data/TablePagination";
import AnimatedTableRow from "components/ub/data/AnimatedTableRow";
import { getAsyncStatus } from "components/ub/feedback/AsyncStatus";
import StatusBadge from "components/ub/data/StatusBadge";
import Tooltip from "components/ub/feedback/Tooltip";
import { useToast } from "components/ub/feedback/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { useBanks, useUpdateBank } from "../hooks";
import type { Bank } from "../types";
import { ISO_COUNTRIES, getCountryName } from "constants/lists";

const COUNTRY_OPTIONS = ISO_COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.code})` }));
const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

interface Props {
  /** Where "Add Bank"/row clicks/the edit icon navigate to — defaults to
   *  the admin route. The data-entry page passes its own base path. */
  basePath?: string;
}

// Admin/data-entry "Manage Banks" screen. Add/View/Edit are full pages (not
// modals), same as Payment Methods' details/edit pages. Shared by both the
// admin and
// data-entry sidebar entries (features/banks) — a standalone feature,
// navigated to from the Knowledge Hub sidebar section but not nested under
// it — gated the same way every other Knowledge Hub page is: by the
// role-based /admin and /data-entry layouts, not a separate permission flag.
export default function BanksTable({ basePath = "/admin/advisors/banks" }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  // "all" needs every record (active + inactive) from the API so it can be
  // filtered to "inactive only" client-side — the API itself has no way to
  // ask for inactive-only, just an include/exclude toggle.
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { banks, loading, error, refetch } = useBanks({
    country: countryFilter.trim() || undefined,
    include_inactive: statusFilter !== "active",
  });

  const { updateBank } = useUpdateBank();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggleActive = async (bank: Bank) => {
    const nextActive = !bank.is_active;
    setTogglingId(bank.id);
    try {
      await updateBank(bank.id, { is_active: nextActive });
      showToast(nextActive ? "Bank activated" : "Bank deactivated", "success");
      refetch();
    } catch (error: unknown) {
      showToast(parseApiError(error, nextActive ? "Failed to activate bank" : "Failed to deactivate bank"), "error");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredBanks = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return banks.filter((bank) => {
      const matchesSearch =
        !term ||
        bank.name.toLowerCase().includes(term) ||
        bank.code.toLowerCase().includes(term) ||
        (bank.swift_code ?? "").toLowerCase().includes(term);
      const matchesStatus = statusFilter === "all" || (statusFilter === "active") === bank.is_active;
      return matchesSearch && matchesStatus;
    });
  }, [banks, searchTerm, statusFilter]);

  const status = getAsyncStatus(loading, error, filteredBanks, (b) => b.length === 0);
  const activeFiltersCount = (searchTerm.trim() ? 1 : 0) + (countryFilter.trim() ? 1 : 0) + (statusFilter !== "all" ? 1 : 0);
  const clearFilters = () => {
    setSearchTerm("");
    setCountryFilter("");
    setStatusFilter("all");
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBanks = filteredBanks.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(Math.ceil(filteredBanks.length / itemsPerPage), 1);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, countryFilter, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2 rounded-lg border border-slate-200 bg-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Banks</h3>
          <p className="mt-1 text-sm text-slate-500">Manage the bank reference list used on partner account forms</p>
        </div>
        <Button
          onClick={() => router.push(`${basePath}/create`)}
          icon={<Landmark className="h-5 w-5" />}
          text="Add Bank"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-blue-800"
          hoverBorderColor="hover:border-blue-700"
        />
      </div>

      {/* Search & Filters */}
      <div className=" border-y border-slate-200 pt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center p-6">
        <div className="flex items-center gap-2 sm:contents">
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search by name, code, or SWIFT code..."
            className="sm:w-64 sm:flex-none"
          />
          <button
            type="button"
            onClick={() => setShowMobileFilters((v) => !v)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 sm:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div
          className={`flex w-full flex-col gap-2 overflow-hidden transition-all duration-300 ease-in-out sm:contents ${
            showMobileFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"
          }`}
        >
          <div className="w-full sm:w-56 sm:flex-none">
            <FilterSelectField
              value={countryFilter || "all"}
              onChange={(v: string) => setCountryFilter(v === "all" ? "" : v)}
              options={COUNTRY_OPTIONS}
              defaultOption="All Countries"
            />
          </div>
          <div className="w-full sm:w-44 sm:flex-none">
            <FilterSelectField
              value={statusFilter}
              onChange={(v: string) => setStatusFilter(v as "all" | "active" | "inactive")}
              options={STATUS_OPTIONS}
              defaultOption="Status: All"
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
              className="hover:bg-red-50"
            />
          )}
        </div>
      </div>

      {/* Table */}

      <div className="p-6 ">
        <TableWrapper
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              itemCount={currentBanks.length}
              totalCount={filteredBanks.length}
              itemLabel="banks"
              loading={status === "loading"}
            />
          }
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Country</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Code</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">SWIFT Code</th>
                <th className="min-w-[220px] px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Bank Name</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Status</th>
                <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Actions</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {status === "loading" && <TableSkeletonRows columns={7} rows={5} />}

              {status === "error" && <TableErrorRow colSpan={7} message={error ?? undefined} onRetry={refetch} />}

              {status === "empty" && (
                <TableEmptyRow
                  colSpan={7}
                  title="No banks found"
                  subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "No banks have been added yet."}
                  icon={<Landmark className="h-8 w-8 text-slate-400" />}
                />
              )}

              <AnimatePresence>
              {status === "success" &&
                currentBanks.map((bank) => (
                  <AnimatedTableRow
                    key={bank.id}
                    className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                    onClick={() => router.push(`${basePath}/${bank.id}`)}
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{getCountryName(bank.country)}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{bank.code}</td>
                    <td className="px-6 py-4 text-sm text-slate-700">{bank.swift_code ?? "—"}</td>
                    <td className="min-w-[220px] px-6 py-4 text-sm text-slate-900">{bank.name}</td>
                    <td className="px-6 py-4">
                      {bank.is_active ? (
                        <StatusBadge variant="success">Active</StatusBadge>
                      ) : (
                        <StatusBadge variant="neutral">Inactive</StatusBadge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`${basePath}/${bank.id}/edit`);
                          }}
                          title="Edit bank"
                          icon={<Pencil className="h-4 w-4" />}
                          bgColor="bg-transparent"
                          textColor="text-slate-500"
                          borderColor="border-transparent"
                          hoverTextColor="hover:text-slate-700"
                          hoverBorderColor="hover:border-transparent"
                          className="hover:bg-slate-100"
                        />

                        <div className="h-6 border-l border-slate-200" />

                        <Tooltip content={bank.is_active ? "Deactivate bank" : "Activate bank"} position="left">
                          <IconButton
                            aria-label={bank.is_active ? "Deactivate bank" : "Activate bank"}
                            disabled={togglingId === bank.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleActive(bank);
                            }}
                            icon={bank.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            bgColor="bg-transparent"
                            textColor="text-slate-500"
                            borderColor="border-transparent"
                            hoverTextColor="hover:text-slate-700"
                            hoverBorderColor="hover:border-transparent"
                            className="hover:bg-slate-100"
                          />
                        </Tooltip>
                      </div>
                    </td>
                    <td className="w-8 pr-4 py-4">
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
