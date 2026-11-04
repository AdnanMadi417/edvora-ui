"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck, KeyRound, BadgeCheck, Trash2, Plus,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { useRoles, useDeleteRole } from "../../hooks";
import type { Role } from "../../types";

import SearchInput from "components/ub/forms/selection/SearchInput";
import TableWrapper from "components/ub/data/tables/TableWrapper";
import TableSkeletonRows from "components/ub/data/tables/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/tables/TableEmptyRow";
import TableErrorRow from "components/ub/data/tables/TableErrorRow";
import TablePagination from "components/ub/data/tables/TablePagination";
import AnimatedTableRow from "components/ub/data/tables/AnimatedTableRow";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

import CreateRoleModal from "./CreateRoleModal";
import DeleteRoleConfirmation from "./DeleteRoleConfirmation";

const ITEMS_PER_PAGE = 10;

export default function RolesTable() {
  const { showToast } = useToast();
  const { roles, loading, error, refetch } = useRoles();
  const { deleteRole, loading: isDeleting } = useDeleteRole();

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  useEffect(() => setCurrentPage(1), [searchTerm]);

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

  const filteredRoles = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return roles;
    return roles.filter(
      (r) => r.name.toLowerCase().includes(term) || r.code.toLowerCase().includes(term)
    );
  }, [roles, searchTerm]);

  const pagedRoles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredRoles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRoles, currentPage]);

  const handleDelete = async () => {
    if (!selectedRole) return;
    try {
      await deleteRole(selectedRole.id);
      showToast("Role deleted successfully.", "success");
      setIsDeleteOpen(false);
      setSelectedRole(null);
      refetch();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to delete role. ${backendMessage}`, "error");
    }
  };

  return (
    <div className="mt-6 text-p2 bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
        <div>
          <h3 className="text-xl font-semibold text-slate-900">Roles</h3>
          <p className="mt-0.5 text-sm text-slate-500">Manage roles and the permissions granted to them</p>
        </div>
        <Button
          onClick={() => setIsCreateOpen(true)}
          icon={<Plus className="h-4 w-4" />}
          text="Create Role"
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-blue-800"
          hoverBorderColor="hover:border-blue-700"
        />
      </div>

      {/* Filter Bar */}
      <div className="p-6 border-b border-slate-200">
        <SearchInput
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          placeholder="Search by name or code..."
          className="sm:w-64"
        />
      </div>

      {/* Table */}
      <div className="p-6">
        <TableWrapper
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              itemCount={pagedRoles.length}
              totalCount={filteredRoles.length}
              itemLabel="roles"
              loading={loading}
            />
          }
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  { icon: ShieldCheck, label: "Name", minW: "min-w-[200px]" },
                  { icon: KeyRound,    label: "Code",  minW: "min-w-[160px]" },
                  { icon: BadgeCheck,  label: "Type" },
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

              {!isInitialLoad && !error && filteredRoles.length === 0 && (
                <TableEmptyRow
                  colSpan={4}
                  title={searchTerm ? "No roles found" : "No roles yet"}
                  subtitle={searchTerm ? "Try adjusting your search." : "Create your first custom role to get started."}
                  icon={<ShieldCheck className="h-8 w-8 text-slate-400" />}
                />
              )}

              <AnimatePresence>
              {!isInitialLoad && !error && pagedRoles.map((role) => (
                <AnimatedTableRow key={role.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="min-w-[200px] px-6 py-4">
                    <div className="truncate text-sm font-medium text-slate-900">{role.name}</div>
                  </td>

                  <td className="min-w-[160px] px-6 py-4">
                    <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{role.code}</code>
                  </td>

                  <td className="px-6 py-4">
                    {role.is_system ? (
                      <StatusBadge variant="neutral">System</StatusBadge>
                    ) : (
                      <StatusBadge variant="info">Custom</StatusBadge>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    {!role.is_system && (
                      <IconButton
                        onClick={() => { setSelectedRole(role); setIsDeleteOpen(true); }}
                        title="Delete role"
                        icon={<Trash2 className="h-4 w-4" />}
                        bgColor="bg-transparent"
                        textColor="text-slate-400"
                        borderColor="border-transparent"
                        hoverTextColor="hover:text-red-600"
                        hoverBorderColor="hover:border-transparent"
                        className="hover:bg-red-50"
                      />
                    )}
                  </td>
                </AnimatedTableRow>
              ))}
              </AnimatePresence>
            </tbody>
          </table>
        </TableWrapper>
      </div>

      <CreateRoleModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={refetch}
      />

      <DeleteRoleConfirmation
        isOpen={isDeleteOpen}
        onClose={() => { setIsDeleteOpen(false); setSelectedRole(null); }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        roleName={selectedRole?.name}
      />
    </div>
  );
}
