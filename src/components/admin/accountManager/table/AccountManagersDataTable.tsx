import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Eye,
  User,
  Mail,
  CheckCircle,
  Settings,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Pencil,
  Users,
  AlertCircle, Trash2,
} from 'lucide-react';
import { MdPersonAdd } from "react-icons/md";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

import { useAccountManagerList } from "hooks/account-managers/useAccountManagerList";
import { useDeleteAccountManager } from 'hooks/account-managers/useDeleteAccountManager';

import NoMessagesFound from 'components/emptyData/NoMessagesFound';
import DeleteAccountManager from 'components/admin/accountManager/popups/DeleteAccountManager';
import { useToast } from 'components/context/ToastContext';

import PrevButton from "components/ui/buttons/PrevButton";
import NextButton from "components/ui/buttons/NextButton";

import ClearButton from "components/ui/buttons/DangerButton";
import Link from "next/link";

const ModernAccountManagersTable = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const { accountManagers, loading } = useAccountManagerList();

  const { showToast } = useToast();
  const { deleteAccountManager } = useDeleteAccountManager();
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredAndSortedAccountManagers = useMemo(() => {
    let filtered = [...accountManagers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((app) =>
        (app.name?.toLowerCase() ?? "").includes(term)
      );
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key]?.toString().toLowerCase() ?? "";
        const bVal = b[sortConfig.key]?.toString().toLowerCase() ?? "";

        if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [accountManagers, searchTerm, sortConfig]);
  const itemsPerPage = 10;
  const total = filteredAndSortedAccountManagers.length;

  const totalPages = Math.ceil(total / itemsPerPage);

  const paginatedAccountManagers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAndSortedAccountManagers.slice(start, end);
  }, [filteredAndSortedAccountManagers, currentPage]);

  const [selectedUniversityId, setSelectedUniversityId] = useState<
    string | null
  >(null);
  const [selectedAccountManager, setSelectedAccountManager] =
    useState<string>("");

  const handleDelete = async () => {
    if (!selectedUniversityId) return;

    try {
      await deleteAccountManager(selectedUniversityId);

      showToast("Account Manager deleted successfully.", "success");

      setIsDeleteOpen(false);
      setSelectedUniversityId(null);
      setSelectedAccountManager("");

      setTimeout(() => location.reload(), 2000);

    } catch (error: any) {
      showToast("Failed to delete Account Manager. Please try again.", "error");
    }
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto overflow-hidden text-p2">
      <div className="relative mb-8 overflow-hidden rounded-lg border border-slate-200 bg-card">
        <div className="relative p-6">
          <div className="mb-6 flex flex-col gap-6 rounded-xl md:flex-row md:items-center md:justify-between">
            <div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">
                  Account Managers Dashboard
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  View, manage, and track all account managers
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-slate-500" />
              <input
                type="text"
                placeholder="Search Account Managers by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-background w-full rounded-md border border-slate-200 px-4 py-2.5 pl-10 pr-4 text-sm text-slate-500 outline-0 placeholder:text-slate-500 focus:border-blue-500 focus:ring-0 focus:ring-blue-500"
              />
            </div>

            <ClearButton
              onClick={() => {
                setSearchTerm("");
              }}
              text="Clear"
              icon={<RefreshCw className="h-4 w-4" />}
            />

            <Link
              className="bg-background-700 flex items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-2.5 text-sm text-slate-500 outline-0 transition hover:border-blue-700 hover:text-blue-700 sm:w-auto"
              href="/admin/account-managers/create"
            >
              <MdPersonAdd className="h-4 w-4" />
              Create Manager
            </Link>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg rounded-b-none border border-b-0 border-slate-200 bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-card">
              <th className="group cursor-pointer px-6 py-4 text-start font-bold tracking-wider text-slate-900 transition-colors">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-500" />
                  Name
                </div>
              </th>

              <th className="group cursor-pointer px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  Email
                </div>
              </th>

              <th className="group px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                <div className="flex min-w-[200px] items-center gap-2">
                  <Users className="h-4 w-4 text-slate-500" />
                  Assigned Partners
                </div>
              </th>

              <th className="group px-6 py-4 text-start font-semibold tracking-wider text-slate-900 transition-colors">
                <div className="flex min-w-[120px] items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-slate-500" />
                  Status
                </div>
              </th>

              <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-slate-500" />
                  Actions
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-border-slate-200 divide-y bg-primary">
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-4 text-center text-p1 text-slate-500"
                >
                  Loading Account Managers...
                </td>
              </tr>
            ) : paginatedAccountManagers.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  <NoMessagesFound
                    title="No account managers found"
                    subtitle="There are currently no account managers available."
                  />
                </td>
              </tr>
            ) : (
              paginatedAccountManagers.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-primary/10 group transition-colors"
                >
                  <td className="min-w-[200px] max-w-[250px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center
                rounded-md bg-accent-light text-h6 font-medium text-slate-700 "
                      >
                        {app.name?.charAt(0).toUpperCase() ?? "?"}
                      </div>

                      <div className="w-full overflow-hidden">
                        <div className="truncate text-slate-900">
                          {app.name}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[200px] max-w-[250px] px-6 py-4">
                    <div className="truncate text-slate-500">{app.email}</div>
                  </td>

                  <td className="px-6 py-4">
                    {Number(app.assigned_partners_count) > 0 ? (
                      <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        <Users className="h-3 w-3" />
                        {Number(app.assigned_partners_count)} Partner
                        {Number(app.assigned_partners_count) !== 1 && "s"}
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-2 whitespace-nowrap rounded-md border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                        <AlertCircle className="h-3 w-3" />
                        Needs Partner
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4">
                    <div
                      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-3 py-1 text-xs font-semibold
        ${
                        app.is_active
                          ? "border-green-600 bg-green-100 text-green-700"
                          : "border-slate-300 bg-slate-100 text-slate-500"
                      }`}
                    >
                      {app.is_active ? (
                        <FaCheckCircle className="text-[10px]" />
                      ) : (
                        <FaTimesCircle className="text-[10px]" />
                      )}
                      {app.is_active ? "Active" : "Inactive"}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/account-managers/profile/${app.id}`}
                        aria-label="View Manager"
                        className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:outline-none"
                      >
                        <Eye className="h-4 w-4 text-slate-500 transition-colors hover:text-slate-700" />
                      </Link>

                      <div className="h-6 border-l border-slate-200" />

                      <Link
                        href={`/admin/account-managers/profile/${app.id}/edit`}
                        aria-label="Edit Manager"
                        className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 transition-all hover:bg-slate-100 hover:text-slate-900 focus:bg-slate-100 focus:outline-none"
                      >
                        <Pencil className="h-4 w-4 text-slate-500 transition-colors hover:text-slate-700" />
                      </Link>

                      <div className="h-6 border-l border-slate-200" />

                      <button
                        role="menuitem"
                        aria-label="Delete Account Manager"
                        onClick={() => {
                          setSelectedUniversityId(app.id);
                          setSelectedAccountManager(app.name);
                          setIsDeleteOpen(true);
                        }}
                        className="flex items-center justify-center rounded-md p-2 text-sm text-slate-700 hover:bg-slate-100 focus:outline-none"
                      >
                        <Trash2 className="h-4 w-4 text-slate-500 hover:text-red-600" />
                      </button>

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="sticky bottom-0 rounded-b-lg border border-slate-200 bg-card px-6 py-4">
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-slate-500 md:flex-row">
          <div>
            Showing{" "}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            to{" "}
            <span className="font-normal">
              {Math.min(
                currentPage * itemsPerPage,
                filteredAndSortedAccountManagers.length
              )}
            </span>{" "}
            of{" "}
            <span className="font-normal">
              {filteredAndSortedAccountManagers.length}
            </span>{" "}
            results
          </div>

          <div className="flex items-center gap-2">
            <PrevButton
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              text="Prev"
              icon={<ArrowLeft className="h-4 w-4" />}
            />

            <span className="px-2 text-slate-500">
              Page {currentPage} of {totalPages}
            </span>

            <NextButton
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              text="Next"
              icon={<ArrowRight className="h-4 w-4" />}
            />
          </div>
        </div>
      </div>

      <DeleteAccountManager
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={loading}
        AccountManager={selectedAccountManager}
      />

    </div>
  );
};

export default ModernAccountManagersTable;
