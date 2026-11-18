"use client";
import { tableSectionPadding } from "components/ub/recipes";
import TableActions, {
  TableAction,
} from "components/ub/data/tables/TableActions";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Percent,
  BadgeCheck,
  Eye,
  RefreshCw,
  Ban,
  Power,
  Settings,
  UserPlus,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";

import {
  useAgencyMembers,
  useSuspendMember,
  useReactivateMember,
} from "../../hooks";
import type { AgencyMember } from "../../types";

import SearchInput from "components/ub/forms/selection/SearchInput";
import FilterSelectField from "components/ub/forms/selection/FilterSelectField";
import TableWrapper from "components/ub/data/tables/TableWrapper";
import TableSkeletonRows from "components/ub/data/tables/TableSkeletonRows";
import TableEmptyRow from "components/ub/data/tables/TableEmptyRow";
import TableErrorRow from "components/ub/data/tables/TableErrorRow";
import TablePagination from "components/ub/data/tables/TablePagination";
import AnimatedTableRow from "components/ub/data/tables/AnimatedTableRow";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Tooltip from "components/ub/feedback/dialogs/Tooltip";
import Button from "components/ub/core/buttons/Button";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

import SuspendReactivateMemberModal from "./SuspendReactivateMemberModal";
import EditMemberCommissionModal from "./EditMemberCommissionModal";
import FilterButton from "components/ub/core/buttons/FilterButton";
import EntityCell from "components/ub/data/display/EntityCell";

const ITEMS_PER_PAGE = 20;

const STATUS_OPTIONS = [
  { value: "true", label: "Active" },
  { value: "false", label: "Suspended" },
];

const COMMISSION_OPTIONS = [
  { value: "true", label: "Visible" },
  { value: "false", label: "Hidden" },
];

interface AgencyMembersTableProps {
  onChanged?: () => void;
}

export default function AgencyMembersTable({
  onChanged,
}: AgencyMembersTableProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCommission, setSelectedCommission] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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
  const commissionVisible =
    selectedCommission === "true"
      ? true
      : selectedCommission === "false"
      ? false
      : undefined;

  const { members, total, loading, error, refetch } = useAgencyMembers({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    is_active: isActive,
    commission_visible: commissionVisible,
  });

  const { suspendMember, loading: isSuspending } = useSuspendMember();
  const { reactivateMember, loading: isReactivating } = useReactivateMember();
  const [suspendTarget, setSuspendTarget] = useState<AgencyMember | null>(null);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);

  const [commissionTarget, setCommissionTarget] = useState<AgencyMember | null>(
    null
  );
  const [isCommissionOpen, setIsCommissionOpen] = useState(false);

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
    selectedCommission !== "all",
    searchTerm !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedStatus("all");
    setSelectedCommission("all");
    setCurrentPage(1);
  };

  const handleToggleActive = async () => {
    if (!suspendTarget) return;
    try {
      if (suspendTarget.is_active) {
        await suspendMember(suspendTarget.partner_id);
        showToast("Member suspended successfully.", "success");
      } else {
        await reactivateMember(suspendTarget.partner_id);
        showToast("Member reactivated successfully.", "success");
      }
      setIsSuspendOpen(false);
      setSuspendTarget(null);
      refetch();
      onChanged?.();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to update member. ${backendMessage}`, "error");
    }
  };

  return (
    <>
      {/* Filter Bar */}
      <div className="p-6 border-b border-ub-border">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex items-center gap-2 sm:contents">
            <SearchInput
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchTerm(e.target.value)
              }
              placeholder="Search by name or email..."
              className="sm:w-64 sm:flex-none"
            />
            {isRefetching && (
              <RefreshCw
                className="h-4 w-4 shrink-0 animate-spin text-ub-text-tertiary"
                aria-label="Updating results"
              />
            )}
            <FilterButton className="sm:hidden" count={activeFiltersCount} expanded={showMobileFilters} onClick={() => setShowMobileFilters((v) => !v)} />
          </div>

          <div
            className={`flex w-full flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out sm:contents ${
              showMobileFilters
                ? "max-h-[200px] opacity-100"
                : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"
            }`}
          >
            <div className="w-full sm:w-36 shrink-0">
              <FilterSelectField
                value={selectedStatus}
                onChange={(v: string) => {
                  setSelectedStatus(v);
                  setCurrentPage(1);
                }}
                options={STATUS_OPTIONS}
                icon={BadgeCheck}
                defaultOption="All Status"
              />
            </div>
            <div className="w-full sm:w-40 shrink-0">
              <FilterSelectField
                value={selectedCommission}
                onChange={(v: string) => {
                  setSelectedCommission(v);
                  setCurrentPage(1);
                }}
                options={COMMISSION_OPTIONS}
                icon={Percent}
                defaultOption="All Commission"
              />
            </div>

            {activeFiltersCount > 0 && (
              <Button
                onClick={clearFilters}
                icon={<RefreshCw className="h-4 w-4" />}
                text="Clear"
                variant="secondary"
                className="hover:bg-ub-tone-danger-bg sm:w-auto"
              />
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={tableSectionPadding}>
        <TableWrapper
          scrollLabel="Scroll to see all columns and rows"
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              itemCount={members.length}
              totalCount={total}
              itemLabel="members"
              loading={loading}
            />
          }
        >
          <table className="ub-legacy-table w-full min-w-[720px]">
            <thead>
              <tr className="border-b border-ub-border bg-ub-surface-subtle">
                {[
                  { icon: User, label: "Name", minW: "min-w-[220px]" },
                  { icon: Mail, label: "Email", minW: "min-w-[200px]" },
                  { icon: Percent, label: "Commission" },
                ].map(({ icon: Icon, label, minW }) => (
                  <th
                    key={label}
                    className={`${
                      minW ?? ""
                    } px-6 py-4 text-start text-sm font-semibold text-ub-text-primary`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-ub-text-tertiary" />
                      {label}
                    </div>
                  </th>
                ))}
                <th className="w-32 px-4 py-4 text-end text-sm font-semibold text-ub-text-primary">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody
              className={`divide-y divide-ub-border bg-ub-surface ${
                isRefetching ? "opacity-60 transition-opacity" : ""
              }`}
            >
              {isInitialLoad && (
                <TableSkeletonRows columns={4} rows={ITEMS_PER_PAGE} />
              )}

              {!isInitialLoad && error && (
                <TableErrorRow colSpan={4} message={error} onRetry={refetch} />
              )}

              {!isInitialLoad && !error && members.length === 0 && (
                <TableEmptyRow
                  colSpan={4}
                  title={
                    activeFiltersCount > 0
                      ? "No members found"
                      : "No members yet"
                  }
                  subtitle={
                    activeFiltersCount > 0
                      ? "Try adjusting your filters."
                      : "Invite your first team member to get started."
                  }
                  icon={<UserPlus className="h-8 w-8 text-ub-text-tertiary" />}
                  action={
                    activeFiltersCount > 0 ? (
                      <Button
                        onClick={clearFilters}
                        icon={<RefreshCw className="h-3.5 w-3.5" />}
                        text="Clear filters"
                        variant="secondary"
                        className="hover:bg-ub-surface-subtle"
                      />
                    ) : undefined
                  }
                />
              )}

              <AnimatePresence>
                {!isInitialLoad &&
                  !error &&
                  members.map((member) => (
                    <AnimatedTableRow
                      key={member.id}
                      className="cursor-pointer transition-colors hover:bg-ub-surface-subtle"
                      onClick={() =>
                        router.push(
                          `/partner/team-members/${member.partner_id}`
                        )
                      }
                    >
                      <td data-label="Name" data-primary className="min-w-[220px] px-6 py-4">
                        <EntityCell
                          name={member.name || member.email}
                          status={{ status: member.is_active, label: member.is_active ? "Active" : "Suspended" }}
                        />
                      </td>

                      <td data-label="Email" className="min-w-[200px] px-6 py-4">
                        <div className="truncate text-sm text-ub-text-secondary" title={member.email}>
                          {member.email}
                        </div>
                      </td>

                      <td data-label="Commission" className="px-6 py-4">
                        {member.commission_visible ? (
                          <Tooltip
                            position="right"
                            content={`This member can see ${member.commission_display_percentage}% of their commission. Use Edit commission settings to change this.`}
                          >
                            <StatusBadge variant="info">
                              {member.commission_display_percentage}% visible
                            </StatusBadge>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            position="right"
                            content="This member can't see any commission info. Use Edit commission settings to make it visible."
                          >
                            <StatusBadge variant="neutral">Hidden</StatusBadge>
                          </Tooltip>
                        )}
                      </td>

                      <td
                        data-label="Actions"
                        className="px-4 py-4 text-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TableActions label={member.name}>
                          <TableAction
                            label={`View ${member.name}`}
                            icon={<Eye className="h-4 w-4" />}
                            href={`/partner/team-members/${member.partner_id}`}
                            primary
                          />
                          <TableAction
                            label="Edit commission settings"
                            icon={<Settings className="h-4 w-4" />}
                            onSelect={() => {
                              setCommissionTarget(member);
                              setIsCommissionOpen(true);
                            }}
                          />
                          <TableAction
                            label={
                              member.is_active
                                ? "Suspend member"
                                : "Reactivate member"
                            }
                            icon={
                              member.is_active ? (
                                <Ban className="h-4 w-4" />
                              ) : (
                                <Power className="h-4 w-4" />
                              )
                            }
                            onSelect={() => {
                              setSuspendTarget(member);
                              setIsSuspendOpen(true);
                            }}
                          />
                        </TableActions>
                      </td>
                    </AnimatedTableRow>
                  ))}
              </AnimatePresence>
            </tbody>
          </table>
        </TableWrapper>
      </div>

      <SuspendReactivateMemberModal
        isOpen={isSuspendOpen}
        onClose={() => {
          setIsSuspendOpen(false);
          setSuspendTarget(null);
        }}
        onConfirm={handleToggleActive}
        isSubmitting={isSuspending || isReactivating}
        memberName={suspendTarget?.name ?? ""}
        isActive={suspendTarget?.is_active ?? false}
      />

      <EditMemberCommissionModal
        isOpen={isCommissionOpen}
        onClose={() => {
          setIsCommissionOpen(false);
          setCommissionTarget(null);
        }}
        onSuccess={() => {
          refetch();
          onChanged?.();
        }}
        member={commissionTarget}
      />
    </>
  );
}
