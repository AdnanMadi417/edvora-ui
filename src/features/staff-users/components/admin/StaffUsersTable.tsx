"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User, Mail, ShieldCheck, BadgeCheck, ChevronRight,
  CheckCircle, XCircle, RefreshCw, SlidersHorizontal, Ban, Power,
  UserPlus, KeyRound, Users,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

import { useStaffUsers, useSuspendStaffUser, useReactivateStaffUser } from "../../hooks";
import type { StaffUser } from "../../types";

import SearchInput from "components/ub/forms/selection/SearchInput";
import FilterSelectField from "components/ub/forms/selection/FilterSelectField";
import TableWrapper from "components/ub/data/tables/TableWrapper";
import TableSkeletonRows from "components/ub/data/tables/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/tables/TableEmptyRow";
import TableErrorRow from "components/ub/data/tables/TableErrorRow";
import TablePagination from "components/ub/data/tables/TablePagination";
import AnimatedTableRow from "components/ub/data/tables/AnimatedTableRow";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import ActionsDropdown from "components/ub/navigation/menus/ActionsDropdown";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

import SuspendReactivateStaffUserModal from "./SuspendReactivateStaffUserModal";
import InviteStaffUserModal from "./InviteStaffUserModal";
import ResendStaffInvitationOtpModal from "./ResendStaffInvitationOtpModal";

const ITEMS_PER_PAGE = 20;

type RoleFilter = "admin" | "reviewer" | "data_entry" | "all";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "reviewer", label: "Reviewer" },
  { value: "data_entry", label: "Data Entry" },
];

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Suspended" },
];

export default function StaffUsersTable() {
  const router = useRouter();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<RoleFilter>("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const isActive = selectedStatus === "true" ? true : selectedStatus === "false" ? false : undefined;
  const role = selectedRole === "all" ? undefined : selectedRole;

  const { staffUsers, total, loading, error, refetch } = useStaffUsers({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    role,
    is_active: isActive,
  });

  const { suspendStaffUser, loading: isSuspending } = useSuspendStaffUser();
  const { reactivateStaffUser, loading: isReactivating } = useReactivateStaffUser();
  const [suspendTarget, setSuspendTarget] = useState<StaffUser | null>(null);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isResendOtpOpen, setIsResendOtpOpen] = useState(false);

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

  const activeFiltersCount = [selectedRole !== "all", selectedStatus !== "all", searchTerm !== ""].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedRole("all");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const handleToggleActive = async () => {
    if (!suspendTarget) return;
    try {
      if (suspendTarget.is_active) {
        await suspendStaffUser(suspendTarget.id);
        showToast("Staff user suspended successfully.", "success");
      } else {
        await reactivateStaffUser(suspendTarget.id);
        showToast("Staff user reactivated successfully.", "success");
      }
      setIsSuspendOpen(false);
      setSuspendTarget(null);
      refetch();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to update staff user. ${backendMessage}`, "error");
    }
  };

  return (
    <div className="mt-6 text-p2 bg-white rounded-lg border border-slate-200">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 border-b border-slate-200">
        <div>
          <p className="mt-0.5 text-sm text-slate-500">Admin, reviewer, and data entry accounts</p>
        </div>
        <ActionsDropdown
          label="Invitations"
          items={[
            {
              label: "Invite Staff User",
              icon: UserPlus,
              onClick: () => setIsInviteOpen(true),
              color: "green",
            },
            {
              label: "Resend Verification Code",
              icon: KeyRound,
              onClick: () => setIsResendOtpOpen(true),
              color: "amber",
            },
          ]}
        />
      </div>

      {/* Filter Bar */}
      <div className="p-6 border-b border-slate-200">
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
            <div className="w-full sm:w-40 flex-shrink-0">
              <FilterSelectField
                value={selectedRole}
                onChange={(v: string) => { setSelectedRole(v as RoleFilter); setCurrentPage(1); }}
                options={ROLE_OPTIONS}
                icon={ShieldCheck}
                defaultOption="All Roles"
              />
            </div>

            <div className="w-full sm:w-36 flex-shrink-0">
              <FilterSelectField
                value={selectedStatus}
                onChange={(v: string) => { setSelectedStatus(v); setCurrentPage(1); }}
                options={STATUS_OPTIONS}
                icon={BadgeCheck}
                defaultOption="All Status"
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

      {/* Table */}
      <div className="p-6">
        <TableWrapper
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              itemCount={staffUsers.length}
              totalCount={total}
              itemLabel="staff users"
              loading={loading}
            />
          }
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  { icon: User,        label: "Name",  minW: "min-w-[200px]" },
                  { icon: Mail,        label: "Email", minW: "min-w-[200px]" },
                  { icon: ShieldCheck, label: "Role" },
                  { icon: BadgeCheck,  label: "Status" },
                ].map(({ icon: Icon, label, minW }) => (
                  <th key={label} className={`${minW ?? ""} px-6 py-4 text-start text-sm font-semibold text-slate-900`}>
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      {label}
                    </div>
                  </th>
                ))}
                <th className="w-10 px-4 py-4" />
                <th className="w-10 px-4 py-4" />
              </tr>
            </thead>

            <tbody className={`divide-y divide-slate-100 bg-white ${isRefetching ? "opacity-60 transition-opacity" : ""}`}>
              {isInitialLoad && <TableSkeletonRows columns={6} rows={ITEMS_PER_PAGE} />}

              {!isInitialLoad && error && (
                <TableErrorRow colSpan={6} message={error} onRetry={refetch} />
              )}

              {!isInitialLoad && !error && staffUsers.length === 0 && (
                <TableEmptyRow
                  colSpan={6}
                  title={activeFiltersCount > 0 ? "No staff users found" : "No staff users yet"}
                  subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "No admin, reviewer, or data entry accounts yet."}
                  icon={<Users className="h-8 w-8 text-slate-400" />}
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
              {!isInitialLoad && !error && staffUsers.map((user) => (
                <AnimatedTableRow
                  key={user.id}
                  className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                  onClick={() => router.push(`/admin/staff-users/${user.id}`)}
                >
                  <td className="min-w-[200px] px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                        {user.name?.slice(0, 2).toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">{user.name}</div>
                      </div>
                    </div>
                  </td>

                  <td className="min-w-[200px] px-6 py-4">
                    <div className="truncate text-sm text-slate-500">{user.email}</div>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge variant="info">{user.role?.name ?? "—"}</StatusBadge>
                  </td>

                  <td className="px-6 py-4">
                    {user.is_active ? (
                      <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                    ) : (
                      <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Suspended</StatusBadge>
                    )}
                  </td>

                  <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                    <IconButton
                      onClick={() => { setSuspendTarget(user); setIsSuspendOpen(true); }}
                      title={user.is_active ? "Suspend account" : "Reactivate account"}
                      icon={user.is_active ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                      bgColor="bg-transparent"
                      textColor="text-slate-400"
                      borderColor="border-transparent"
                      hoverTextColor={user.is_active ? "hover:text-red-600" : "hover:text-emerald-600"}
                      hoverBorderColor="hover:border-transparent"
                      className={user.is_active ? "hover:bg-red-50" : "hover:bg-emerald-50"}
                    />
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

      <SuspendReactivateStaffUserModal
        isOpen={isSuspendOpen}
        onClose={() => { setIsSuspendOpen(false); setSuspendTarget(null); }}
        onConfirm={handleToggleActive}
        isSubmitting={isSuspending || isReactivating}
        staffUserName={suspendTarget?.name ?? ""}
        isActive={suspendTarget?.is_active ?? false}
      />

      <InviteStaffUserModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />

      <ResendStaffInvitationOtpModal
        isOpen={isResendOtpOpen}
        onClose={() => setIsResendOtpOpen(false)}
      />
    </div>
  );
}
