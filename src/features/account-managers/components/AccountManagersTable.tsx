"use client";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import React, { useEffect, useState } from "react";
import {
  ArrowRightLeft,
  Eye,
  Pencil,
  Share2,
  Users,
  UserCog,
  Trash2,
  SlidersHorizontal,
  Plus,
} from "lucide-react";
import { useAccountManagers } from "../hooks/useAccountManagers";
import { useDeleteAccountManager } from "../hooks/useDeleteAccountManager";
import DeleteAccountManagerModal from "./DeleteAccountManagerModal";
import TransferPartnersModal from "./TransferPartnersModal";
import type { AccountManager } from "../types";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import {
  getApiErrorCode,
  getApiErrorDetails,
  parseApiError,
} from "utils/parseApiError";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import TablePagination from "components/ub/data/tables/TablePagination";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import LinkBtn from "components/ub/core/buttons/LinkBtn";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import FilterSelectField from "components/ub/forms/selection/FilterSelectField";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { label: "Active", value: "true" },
  { label: "Inactive", value: "false" },
];

const AccountManagersTable = ({ readOnly = false }: { readOnly?: boolean }) => {
  const router = useRouter();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draftStatus, setDraftStatus] = useState("all");
  const basePath = readOnly
    ? "/reviewer/account-managers"
    : "/admin/account-managers";
  const [currentPage, setCurrentPage] = useState(1);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedManagerId, setSelectedManagerId] = useState<string | null>(
    null
  );
  const [selectedManagerName, setSelectedManagerName] = useState<string>("");
  const [selectedManager, setSelectedManager] = useState<AccountManager | null>(
    null
  );
  // Deletion is blocked while the manager still has partners — pre-checked
  // from the row's count, and re-checked from the backend's 409 (UBX-318).
  const [deleteBlockedCount, setDeleteBlockedCount] = useState<number | null>(
    null
  );

  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [transferSource, setTransferSource] = useState<AccountManager | null>(
    null
  );
  const [resumeDeleteAfterTransfer, setResumeDeleteAfterTransfer] =
    useState(false);

  const { showToast } = useToast();
  const { deleteAccountManager, loading: deleteLoading } =
    useDeleteAccountManager();

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

  const { accountManagers, total, loading, error, refetch } =
    useAccountManagers({
      page: currentPage,
      page_size: ITEMS_PER_PAGE,
      search: debouncedSearch || undefined,
      is_active: isActive,
    });

  const activeFiltersCount = selectedStatus === "all" ? 0 : 1;

  const openDelete = (m: AccountManager) => {
    setSelectedManagerId(m.id);
    setSelectedManagerName(m.name);
    setSelectedManager(m);
    const count = Number(m.assigned_partners_count) || 0;
    setDeleteBlockedCount(count > 0 ? count : null);
    setIsDeleteOpen(true);
  };

  const openTransfer = (m: AccountManager) => {
    setTransferSource(m);
    setIsTransferOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedManagerId) return;
    try {
      await deleteAccountManager(selectedManagerId);
      showToast("Account Manager deleted successfully.", "success");
      setIsDeleteOpen(false);
      setSelectedManagerId(null);
      setSelectedManagerName("");
      setSelectedManager(null);
      setDeleteBlockedCount(null);
      refetch();
    } catch (err: unknown) {
      if (getApiErrorCode(err) === "manager_has_assigned_partners") {
        // The row's count was stale: the backend refuses until the partners
        // are transferred. Keep the modal open and show the transfer path.
        const fromApi = Number(
          getApiErrorDetails(err)?.assigned_partners_count
        );
        setDeleteBlockedCount(
          Number.isFinite(fromApi) && fromApi > 0 ? fromApi : 1
        );
        return;
      }
      showToast(
        parseApiError(
          err,
          "Failed to delete Account Manager. Please try again."
        ),
        "error"
      );
    }
  };

  // From the blocked delete modal: hand the partners over first, then come
  // back to the (now unblocked) delete confirmation.
  const handleTransferFromDelete = () => {
    if (!selectedManager) return;
    setIsDeleteOpen(false);
    setResumeDeleteAfterTransfer(true);
    openTransfer(selectedManager);
  };

  const handleTransferred = () => {
    refetch();
    if (resumeDeleteAfterTransfer && selectedManager) {
      setResumeDeleteAfterTransfer(false);
      setDeleteBlockedCount(null);
      setIsDeleteOpen(true);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedStatus("all");
    setCurrentPage(1);
  };

  const columns: DataTableColumn<AccountManager>[] = [
    {
      key: "name",
      header: "Account manager",
      cell: (m) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
            {m.name?.slice(0, 2).toUpperCase() || "?"}
          </span>
          <span className="line-clamp-2 break-words font-medium" title={m.name}>
            {m.name}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (m) => (
        <span className="break-all text-ub-text-secondary" title={m.email}>
          {m.email}
        </span>
      ),
    },
    {
      key: "advisors",
      header: "Assigned advisors",
      cell: (m) => (
        <div className="flex flex-wrap gap-2">
          <StatusBadge
            variant={
              Number(m.assigned_partners_count) > 0 ? "success" : "neutral"
            }
            icon={<Users className="h-3 w-3" />}
          >
            {Number(m.assigned_partners_count) || 0} assigned
          </StatusBadge>
          {Number(m.shared_partners_count) > 0 && (
            <StatusBadge variant="info" icon={<Share2 className="h-3 w-3" />}>
              {Number(m.shared_partners_count)} shared
            </StatusBadge>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (m) => (
        <StatusBadge variant={m.is_active ? "success" : "neutral"}>
          {m.is_active ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      cell: (m) => (
        <TableActions>
          {!readOnly && (
            <>
              <TableAction
                label={`Edit ${m.name}`}
                icon={<Pencil className="h-4 w-4" />}
                onSelect={() => router.push(`${basePath}/profile/${m.id}/edit`)}
                primary
              />
              <TableAction
                label={"Transfer or share advisors"}
                icon={<ArrowRightLeft className="h-4 w-4" />}
                onSelect={() => openTransfer(m)}
                disabled={(Number(m.assigned_partners_count) || 0) === 0}
              />
              <TableAction
                label={`Delete ${m.name}`}
                icon={<Trash2 className="h-4 w-4" />}
                onSelect={() => openDelete(m)}
                danger
              />
            </>
          )}
        </TableActions>
      ),
    },
  ];

  return (
    <section className="mt-5 min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
      <header className="flex flex-col gap-4 border-b border-ub-border p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
            <UserCog className="h-5 w-5" />
          </span>
          <p className="text-ub-body-sm text-ub-text-secondary">
            {readOnly
              ? "View account managers and their advisor assignments."
              : "Manage account managers, advisor assignments, and account access."}
          </p>
        </div>
        {!readOnly && (
          <LinkBtn
            href="/admin/account-managers/create"
            label="Create manager"
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
          />
        )}
      </header>
      <div className="border-b border-ub-border p-4 sm:p-6">
        <DataTableToolbar
          search={{
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: "Search by name or email...",
          }}
          resultLabel={`${total} account managers`}
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
        title="Filter account managers"
        description="Narrow account managers by account status."
        footer={
          <>
            <Button
              text="Clear filters"
              variant="secondary"
              onClick={() => {
                setDraftStatus("all");
                setSelectedStatus("all");
                setCurrentPage(1);
                setFiltersOpen(false);
              }}
            />
            <Button
              text="Apply filters"
              variant="primary"
              onClick={() => {
                setSelectedStatus(draftStatus);
                setCurrentPage(1);
                setFiltersOpen(false);
              }}
            />
          </>
        }
      >
        <label className="block space-y-2">
          <span className="text-ub-label-sm">Status</span>
          <FilterSelectField
            value={draftStatus}
            onChange={setDraftStatus}
            options={STATUS_OPTIONS}
            defaultOption="All statuses"
          />
        </label>
      </Drawer>
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable
          caption="Account managers"
          columns={readOnly ? columns.filter((column) => column.key !== "actions") : columns}
          rows={accountManagers}
          getRowId={(m) => m.id}
          getRowLabel={(m) => m.name}
          getRowHref={(m) => `${basePath}/profile/${m.id}`}
          loading={loading}
          error={error}
          onRetry={refetch}
          getRowClassName={() => "md:[&>td]:py-4"}
          scrollClassName="max-h-[65dvh] overflow-y-auto overscroll-contain"
          empty={{
            title: "No account managers found",
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
          itemCount={accountManagers.length}
          totalCount={total}
          itemLabel="account managers"
          loading={loading}
        />
      </div>

      <DeleteAccountManagerModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        isDeleting={deleteLoading}
        AccountManager={selectedManagerName}
        blockedPartnersCount={deleteBlockedCount}
        onTransferPartners={handleTransferFromDelete}
      />

      <TransferPartnersModal
        isOpen={isTransferOpen}
        onClose={() => {
          setIsTransferOpen(false);
          setResumeDeleteAfterTransfer(false);
        }}
        sourceManager={transferSource}
        onTransferred={handleTransferred}
        // From the blocked-delete path only a move unblocks the deletion.
        allowShare={!resumeDeleteAfterTransfer}
      />
    </section>
  );
};

export default AccountManagersTable;
