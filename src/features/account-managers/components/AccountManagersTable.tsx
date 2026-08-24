"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  ChevronRight, User, Mail, CheckCircle, Settings,
  RefreshCw, Pencil, Users,
  AlertCircle, Trash2, SlidersHorizontal, Activity, XCircle,
} from "lucide-react";
import { MdPersonAdd } from "react-icons/md";

import { useAccountManagers } from "../hooks/useAccountManagers";
import { useDeleteAccountManager } from "../hooks/useDeleteAccountManager";
import DeleteAccountManagerModal from "./DeleteAccountManagerModal";

import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import SearchInput from "components/form/filter/SearchInput";
import FilterSelectField from "components/form/filter/FilterSelectField";
import { TableWrapper, TableSkeletonRows, TableEmptyRow, TableErrorRow, TablePagination } from "components/ui/table";
import { StatusBadge } from "components/ui/badges";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";

import { useRouter } from "next/navigation";
import Link from "next/link";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { label: "Active",   value: "true" },
  { label: "Inactive", value: "false" },
];

const AccountManagersTable = () => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(null);
  const [selectedManagerName, setSelectedManagerName] = useState<string>("");

  const { showToast } = useToast();
  const { deleteAccountManager, loading: deleteLoading } = useDeleteAccountManager();

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const isActive = selectedStatus === "true" ? true : selectedStatus === "false" ? false : undefined;

  const { accountManagers, total, loading, error, refetch } = useAccountManagers({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    is_active: isActive,
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

  const activeFiltersCount = [
    selectedStatus !== "all",
    searchTerm !== "",
  ].filter(Boolean).length;

  const handleDelete = async () => {
    if (!selectedManagerId) return;
    try {
      await deleteAccountManager(selectedManagerId);
      showToast("Account Manager deleted successfully.", "success");
      setIsDeleteOpen(false);
      setSelectedManagerId(null);
      setSelectedManagerName("");
      refetch();
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to delete Account Manager. Please try again."), "error");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto text-p2 bg-white rounded-lg border border-slate-200">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Account Managers</h3>
          <p className="mt-0.5 text-sm text-slate-500">View, manage, and track all account managers</p>
        </div>
        <Link
          href="/admin/account-managers/create"
          className="flex items-center justify-center gap-2 rounded-lg border border-blue-600 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 transition hover:border-blue-700 hover:text-blue-800"
        >
          <MdPersonAdd className="h-4 w-4" />
          Create Manager
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

          {/* Search + mobile toggle */}
          <div className="flex items-center gap-2 sm:contents">
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            <div className="w-full sm:w-36 flex-shrink-0">
              <FilterSelectField
                value={selectedStatus}
                onChange={(v) => { setSelectedStatus(v); setCurrentPage(1); }}
                options={STATUS_OPTIONS}
                icon={Activity}
                defaultOption="All Status"
              />
            </div>

            {(activeFiltersCount > 0 || debouncedSearch !== "") && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                {total.toLocaleString()}
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

      {/* Table */}

      <div className="p-6">
      
        <TableWrapper
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              itemCount={accountManagers.length}
              totalCount={total}
              itemLabel="results"
              loading={loading}
            />
          }
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  { icon: User,         label: "Name",              minW: "min-w-[200px]" },
                  { icon: Mail,         label: "Email",             minW: "min-w-[200px]" },
                  { icon: Users,        label: "Assigned Partners", minW: "min-w-[180px]" },
                  { icon: CheckCircle,  label: "Status",            minW: "min-w-[120px]" },
                  { icon: Settings,     label: "Actions" },
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
              {isInitialLoad && <TableSkeletonRows columns={6} rows={ITEMS_PER_PAGE} />}

              {!isInitialLoad && error && (
                <TableErrorRow colSpan={6} message={error} onRetry={refetch} />
              )}

              {!isInitialLoad && !error && accountManagers.length === 0 && (
                <TableEmptyRow
                  colSpan={6}
                  title={activeFiltersCount > 0 ? "No account managers found" : "No account managers yet"}
                  subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "Create your first account manager to get started."}
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
                    ) : (
                      <Link
                        href="/admin/account-managers/create"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-blue-600 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:border-blue-700 hover:text-blue-800"
                      >
                        <MdPersonAdd className="h-3.5 w-3.5" />
                        Create Manager
                      </Link>
                    )
                  }
                />
              )}

              {!isInitialLoad && !error && accountManagers.map((m) => (
                <tr
                  key={m.id}
                  className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                  onClick={() => router.push(`/admin/account-managers/profile/${m.id}`)}
                >
                  <td className="min-w-[200px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                        {m.name?.slice(0, 2).toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{m.name}</div>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[200px] px-6 py-4">
                    <div className="truncate text-sm text-slate-500">{m.email}</div>
                  </td>

                  <td className="px-6 py-4">
                    {Number(m.assigned_partners_count) > 0 ? (
                      <StatusBadge variant="success" icon={<Users className="h-3 w-3" />}>
                        {Number(m.assigned_partners_count)} Partner{Number(m.assigned_partners_count) !== 1 && "s"}
                      </StatusBadge>
                    ) : (
                      <StatusBadge variant="danger" icon={<AlertCircle className="h-3 w-3" />}>Needs Partner</StatusBadge>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    {m.is_active ? (
                      <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                    ) : (
                      <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Inactive</StatusBadge>
                    )}
                  </td>

                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/account-managers/profile/${m.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <div className="h-5 border-l border-slate-200" />
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedManagerId(m.id);
                          setSelectedManagerName(m.name);
                          setIsDeleteOpen(true);
                        }}
                        icon={<Trash2 className="h-4 w-4" />}
                        bgColor="bg-transparent"
                        textColor="text-slate-400"
                        borderColor="border-transparent"
                        hoverTextColor="hover:text-red-600"
                        hoverBorderColor="hover:border-transparent"
                        className="hover:bg-red-50"
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


      <DeleteAccountManagerModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={deleteLoading}
        AccountManager={selectedManagerName}
      />
    </div>
  );
};

export default AccountManagersTable;
