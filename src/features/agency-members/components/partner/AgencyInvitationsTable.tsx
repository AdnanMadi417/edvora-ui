"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  User, Mail, Activity, CalendarDays,
  RefreshCw, SlidersHorizontal, Send,
} from "lucide-react";

import { useAgencyInvitations, useResendSubmissionLink } from "../../hooks";
import type { AgencyInvitation, InvitationProgress } from "../../types";

import SearchInput from "components/form/filter/SearchInput";
import FilterSelectField from "components/form/filter/FilterSelectField";
import { AppDate } from "components/ui/date";
import { TableWrapper, TableSkeletonRows, TableEmptyRow, TableErrorRow, TablePagination } from "components/ui/table";
import { StatusBadge, type StatusBadgeVariant } from "components/ui/badges";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

import ResendSubmissionLinkConfirmation from "./ResendSubmissionLinkConfirmation";

const ITEMS_PER_PAGE = 20;

const PROGRESS_OPTIONS = [
  { value: "otp_pending", label: "OTP Pending" },
  { value: "otp_expired", label: "OTP Expired" },
  { value: "pending_profile", label: "Pending Profile" },
  { value: "link_expired", label: "Link Expired" },
  { value: "completed", label: "Completed" },
  { value: "superseded", label: "Superseded" },
];

const PROGRESS_LABELS: Record<InvitationProgress, string> = {
  otp_pending: "OTP Pending",
  otp_expired: "OTP Expired",
  pending_profile: "Pending Profile",
  link_expired: "Link Expired",
  completed: "Completed",
  superseded: "Superseded",
};

const PROGRESS_VARIANTS: Record<InvitationProgress, StatusBadgeVariant> = {
  completed: "success",
  otp_pending: "warning",
  pending_profile: "info",
  link_expired: "danger",
  otp_expired: "danger",
  superseded: "neutral",
};

const RESENDABLE_PROGRESS: InvitationProgress[] = ["link_expired", "pending_profile"];

export default function AgencyInvitationsTable() {
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProgress, setSelectedProgress] = useState("all");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const progress = selectedProgress === "all" ? undefined : selectedProgress;

  const { invitations, total, loading, error, refetch } = useAgencyInvitations({
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
    search: debouncedSearch || undefined,
    progress,
  });

  const { resendSubmissionLink, loading: isResending } = useResendSubmissionLink();
  const [resendTarget, setResendTarget] = useState<AgencyInvitation | null>(null);
  const [isResendOpen, setIsResendOpen] = useState(false);

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

  const activeFiltersCount = [selectedProgress !== "all", searchTerm !== ""].filter(Boolean).length;

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setSelectedProgress("all");
    setCurrentPage(1);
  };

  const handleResend = async () => {
    if (!resendTarget) return;
    try {
      await resendSubmissionLink(resendTarget.email);
      showToast("Submission link resent successfully.", "success");
      setIsResendOpen(false);
      setResendTarget(null);
      refetch();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to resend submission link. ${backendMessage}`, "error");
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
            <div className="w-full sm:w-48 flex-shrink-0">
              <FilterSelectField
                value={selectedProgress}
                onChange={(v: string) => { setSelectedProgress(v); setCurrentPage(1); }}
                options={PROGRESS_OPTIONS}
                icon={Activity}
                defaultOption="All Progress"
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
              itemCount={invitations.length}
              totalCount={total}
              itemLabel="invitations"
              loading={loading}
            />
          }
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                {[
                  { icon: User,         label: "Name",     minW: "min-w-[200px]" },
                  { icon: Mail,         label: "Email",    minW: "min-w-[200px]" },
                  { icon: Activity,     label: "Progress" },
                  { icon: CalendarDays, label: "Invited" },
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
              {isInitialLoad && <TableSkeletonRows columns={5} rows={ITEMS_PER_PAGE} />}

              {!isInitialLoad && error && (
                <TableErrorRow colSpan={5} message={error} onRetry={refetch} />
              )}

              {!isInitialLoad && !error && invitations.length === 0 && (
                <TableEmptyRow
                  colSpan={5}
                  title={activeFiltersCount > 0 ? "No invitations found" : "No invitations yet"}
                  subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "Invite your first team member to get started."}
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

              {!isInitialLoad && !error && invitations.map((invitation) => (
                <tr key={invitation.id} className="transition-colors hover:bg-slate-50/50">
                  <td className="min-w-[200px] px-6 py-4">
                    <div className="truncate text-sm font-medium text-slate-900">{invitation.name}</div>
                  </td>

                  <td className="min-w-[200px] px-6 py-4">
                    <div className="truncate text-sm text-slate-500">{invitation.email}</div>
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge variant={PROGRESS_VARIANTS[invitation.progress]}>
                      {PROGRESS_LABELS[invitation.progress] ?? invitation.progress}
                    </StatusBadge>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900">
                      <AppDate value={invitation.created_at} format="short" fallback="—" />
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    {RESENDABLE_PROGRESS.includes(invitation.progress) && (
                      <IconButton
                        onClick={() => { setResendTarget(invitation); setIsResendOpen(true); }}
                        title="Resend submission link"
                        icon={<Send className="h-4 w-4" />}
                        bgColor="bg-transparent"
                        textColor="text-slate-400"
                        borderColor="border-transparent"
                        hoverTextColor="hover:text-blue-600"
                        hoverBorderColor="hover:border-transparent"
                        className="hover:bg-blue-50"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrapper>
      </div>

      <ResendSubmissionLinkConfirmation
        isOpen={isResendOpen}
        onClose={() => { setIsResendOpen(false); setResendTarget(null); }}
        onConfirm={handleResend}
        isSending={isResending}
        invitationName={resendTarget?.name ?? ""}
        invitationEmail={resendTarget?.email ?? ""}
      />
    </>
  );
}
