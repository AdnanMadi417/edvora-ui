"use client";
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
  ChevronRight,
  CheckCircle,
  XCircle,
  RefreshCw,
  SlidersHorizontal,
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
import IconButton from "components/ub/core/buttons/IconButton";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

import SuspendReactivateMemberModal from "./SuspendReactivateMemberModal";
import EditMemberCommissionModal from "./EditMemberCommissionModal";

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
      <div className="p-6 border-b border-slate-200">
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
                className="h-4 w-4 shrink-0 animate-spin text-slate-400"
                aria-label="Updating results"
              />
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
          <table className="w-full min-w-[800px] md:min-w-0">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  {
                    icon: User,
                    label: "Name",
                    minW: "min-w-[140px] sm:min-w-[200px]",
                  },
                  {
                    icon: Mail,
                    label: "Email",
                    minW: "min-w-[160px] sm:min-w-[200px]",
                  },
                  { icon: Percent, label: "Commission" },
                  { icon: BadgeCheck, label: "Status" },
                ].map(({ icon: Icon, label, minW }) => (
                  <th
                    key={label}
                    className={`${
                      minW ?? ""
                    } px-6 py-4 text-start text-sm font-semibold text-slate-900`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-slate-400" />
                      {label}
                    </div>
                  </th>
                ))}
                <th className="w-10 px-4 py-4" />
                <th className="w-10 px-4 py-4" />
                <th className="w-10 px-4 py-4" />
              </tr>
            </thead>

            <tbody
              className={`divide-y divide-slate-100 bg-white ${
                isRefetching ? "opacity-60 transition-opacity" : ""
              }`}
            >
              {isInitialLoad && (
                <TableSkeletonRows columns={7} rows={ITEMS_PER_PAGE} />
              )}

              {!isInitialLoad && error && (
                <TableErrorRow colSpan={7} message={error} onRetry={refetch} />
              )}

              {!isInitialLoad && !error && members.length === 0 && (
                <TableEmptyRow
                  colSpan={7}
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
                  icon={<UserPlus className="h-8 w-8 text-slate-400" />}
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
                {!isInitialLoad &&
                  !error &&
                  members.map((member) => (
                    <AnimatedTableRow
                      key={member.id}
                      className="group cursor-pointer transition-colors hover:bg-slate-100/50"
                      onClick={() =>
                        router.push(
                          `/partner/team-members/${member.partner_id}`
                        )
                      }
                    >
                      <td className="min-w-[140px] px-6 py-4 sm:min-w-[200px]">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                            {member.name?.slice(0, 2).toUpperCase() ?? "?"}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-slate-900">
                              {member.name}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="min-w-[160px] px-6 py-4 sm:min-w-[200px]">
                        <div className="truncate text-sm text-slate-500">
                          {member.email}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {member.commission_visible ? (
                          <Tooltip
                            position="right"
                            content={`This member can see ${member.commission_display_percentage}% of their commission. Use the settings icon to change this.`}
                          >
                            <StatusBadge variant="info">
                              {member.commission_display_percentage}% Visible
                            </StatusBadge>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            position="right"
                            content="This member can't see any commission info. Use the settings icon to make it visible."
                          >
                            <StatusBadge variant="neutral">Hidden</StatusBadge>
                          </Tooltip>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        {member.is_active ? (
                          <StatusBadge
                            variant="success"
                            icon={<CheckCircle className="h-3 w-3" />}
                          >
                            Active
                          </StatusBadge>
                        ) : (
                          <StatusBadge
                            variant="neutral"
                            icon={<XCircle className="h-3 w-3" />}
                          >
                            Suspended
                          </StatusBadge>
                        )}
                      </td>

                      <td
                        colSpan={2}
                        className="px-4 py-4"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <TableActions label={member.name}>
                          <TableAction
                            label={"Edit commission settings"}
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
