"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  SlidersHorizontal,
  Ban,
  Power,
  UserPlus,
  KeyRound,
  Users,
} from "lucide-react";
import {
  useStaffUsers,
  useSuspendStaffUser,
  useReactivateStaffUser,
} from "../../hooks";
import type { StaffUser } from "../../types";
import FilterSelectField from "components/ub/forms/selection/FilterSelectField";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import TablePagination from "components/ub/data/tables/TablePagination";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import Drawer from "components/ub/feedback/dialogs/Drawer";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftRole, setDraftRole] = useState<RoleFilter>("all");
  const [draftStatus, setDraftStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const isActive =
    selectedStatus === "true"
      ? true
      : selectedStatus === "false"
      ? false
      : undefined;
  const role = selectedRole === "all" ? undefined : selectedRole;

  const { staffUsers, total, loading, error, refetch } = useStaffUsers({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    role,
    is_active: isActive,
  });

  const { suspendStaffUser, loading: isSuspending } = useSuspendStaffUser();
  const { reactivateStaffUser, loading: isReactivating } =
    useReactivateStaffUser();
  const [suspendTarget, setSuspendTarget] = useState<StaffUser | null>(null);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isResendOtpOpen, setIsResendOtpOpen] = useState(false);

  const activeFiltersCount = [
    selectedRole !== "all",
    selectedStatus !== "all",
  ].filter(Boolean).length;

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

  const columns: DataTableColumn<StaffUser>[] = [
    {
      key: "name",
      header: "Staff user",
      cell: (user) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
            {user.name?.slice(0, 2).toUpperCase() || "?"}
          </span>
          <span
            className="line-clamp-2 break-words font-medium"
            title={user.name}
          >
            {user.name}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (user) => (
        <span className="break-all text-ub-text-secondary" title={user.email}>
          {user.email}
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      cell: (user) => (
        <StatusBadge variant="info">{user.role?.name ?? "—"}</StatusBadge>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (user) => (
        <StatusBadge variant={user.is_active ? "success" : "neutral"}>
          {user.is_active ? "Active" : "Suspended"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (user) => (
        <TableActions>
          <TableAction
            label={user.is_active ? "Suspend account" : "Reactivate account"}
            icon={
              user.is_active ? (
                <Ban className="h-4 w-4" />
              ) : (
                <Power className="h-4 w-4" />
              )
            }
            onSelect={() => {
              setSuspendTarget(user);
              setIsSuspendOpen(true);
            }}
          />
        </TableActions>
      ),
    },
  ];

  return (
    <section className="mt-5 min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex flex-col gap-4 border-b border-ub-border p-4 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
            <Users className="h-5 w-5" />
          </span>
          <p className="text-ub-body-sm text-ub-text-secondary">
            Manage admin, reviewer, and data entry accounts.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            text="Invite staff user"
            variant="primary"
            icon={<UserPlus className="h-4 w-4" />}
            onClick={() => setIsInviteOpen(true)}
          />
          <Button
            text="Resend code"
            variant="secondary"
            icon={<KeyRound className="h-4 w-4" />}
            onClick={() => setIsResendOtpOpen(true)}
          />
        </div>
      </header>
      <div className="border-b border-ub-border p-4 sm:p-6">
        <DataTableToolbar
          search={{
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: "Search by name or email...",
          }}
          resultLabel={`${total} staff users`}
          filters={
            <Button
              text={
                activeFiltersCount
                  ? `Filters (${activeFiltersCount})`
                  : "Filters"
              }
              variant="secondary"
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => {
                setDraftRole(selectedRole);
                setDraftStatus(selectedStatus);
                setFiltersOpen(true);
              }}
            />
          }
        />
      </div>
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter staff users"
        description="Choose a role and account status."
        footer={
          <>
            <Button
              text="Clear filters"
              variant="secondary"
              onClick={() => {
                setSelectedRole("all");
                setSelectedStatus("all");
                setCurrentPage(1);
                setFiltersOpen(false);
              }}
            />
            <Button
              text="Apply filters"
              variant="primary"
              onClick={() => {
                setSelectedRole(draftRole);
                setSelectedStatus(draftStatus);
                setCurrentPage(1);
                setFiltersOpen(false);
              }}
            />
          </>
        }
      >
        <div className="space-y-6">
          <label className="block space-y-2">
            <span className="text-ub-label-sm">Role</span>
            <FilterSelectField
              value={draftRole}
              onChange={(v) => setDraftRole(v as RoleFilter)}
              options={ROLE_OPTIONS}
              defaultOption="All roles"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-ub-label-sm">Status</span>
            <FilterSelectField
              value={draftStatus}
              onChange={setDraftStatus}
              options={STATUS_OPTIONS}
              defaultOption="All statuses"
            />
          </label>
        </div>
      </Drawer>
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable
          caption="Staff users"
          columns={columns}
          rows={staffUsers}
          getRowId={(user) => user.id}
          getRowLabel={(user) => user.name}
          getRowHref={(user) => `/admin/staff-users/${user.id}`}
          loading={loading}
          error={error}
          onRetry={refetch}
          getRowClassName={() => "md:[&>td]:py-4"}
          scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
          empty={{
            title: "No staff users found",
            description: "Try another search or adjust your filters.",
            action: (
              <Button
                text="Clear search and filters"
                variant="secondary"
                onClick={clearFilters}
              />
            ),
          }}
        />
        <TablePagination
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          itemsPerPage={ITEMS_PER_PAGE}
          itemCount={staffUsers.length}
          totalCount={total}
          itemLabel="staff users"
          loading={loading}
        />
      </div>
      <SuspendReactivateStaffUserModal
        isOpen={isSuspendOpen}
        onClose={() => {
          setIsSuspendOpen(false);
          setSuspendTarget(null);
        }}
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
    </section>
  );
}
