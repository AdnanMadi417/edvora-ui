"use client";

import React, { useState } from "react";
import {
  RefreshCw,
  Clock,
  KeyRound,
  Ban,
  Lock,
  CheckCircle2,
  UserPlus,
  Building2,
} from "lucide-react";
import { usePendingRegistrationOtps, useAdminResendRegistrationOtp } from "features/partners/hooks";
import type { RegistrationOtpProgress, PendingRegistrationOtp } from "features/partners/types";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { useToast } from "components/context/ToastContext";
import { AppDate } from "components/ui/date";
import { StatusBadge } from "components/ui/badges";
import Button from "components/ui/buttons/Button";
import IconButton from "components/ui/buttons/IconButton";
import SearchInput from "components/form/filter/SearchInput";
import FilterSelectField from "components/form/filter/FilterSelectField";
import { TableWrapper, TableSkeletonRows, TableEmptyRow, TableErrorRow, TablePagination } from "components/ui/table";
import ResendRegistrationOtpConfirmation from "./ResendRegistrationOtpConfirmation";

const ITEMS_PER_PAGE = 20;

// Client-side cap on top of whatever the backend enforces — keeps admins
// from burning through a partner's resend budget one row-click at a time.
const MAX_RESENDS = 3;

const PROGRESS_OPTIONS: { value: RegistrationOtpProgress; label: string }[] = [
  { value: "otp_pending", label: "Awaiting verification" },
  { value: "otp_expired", label: "Expired" },
  { value: "max_resends_reached", label: "Needs re-registration" },
  { value: "otp_attempts_exhausted", label: "Locked" },
  { value: "completed", label: "Registered" },
];

const PARTNER_TYPE_OPTIONS = [
  { value: "individual", label: "Individual" },
  { value: "agency", label: "Agency" },
];

// Per the backend's documented UI treatment for each progress value — badge
// look plus whether Resend is even meaningful for that row.
const PROGRESS_CONFIG: Record<RegistrationOtpProgress, { label: string; variant: "warning" | "danger" | "attention" | "success" | "neutral"; icon: React.ReactNode; canResend: boolean }> = {
  otp_pending: { label: "Awaiting verification", variant: "warning", icon: <Clock className="h-3 w-3" />, canResend: true },
  otp_expired: { label: "Expired", variant: "attention", icon: <Clock className="h-3 w-3" />, canResend: true },
  max_resends_reached: { label: "Needs re-registration", variant: "danger", icon: <Ban className="h-3 w-3" />, canResend: false },
  otp_attempts_exhausted: { label: "Locked — needs resend", variant: "danger", icon: <Lock className="h-3 w-3" />, canResend: true },
  completed: { label: "Registered", variant: "success", icon: <CheckCircle2 className="h-3 w-3" />, canResend: false },
};

// A progress value the backend added after this map was written would
// otherwise index to `undefined` and throw during render, taking down the
// whole page (both tabs) — fall back to something renderable instead.
const UNKNOWN_PROGRESS_CONFIG = { label: "Unknown", variant: "neutral" as const, icon: undefined, canResend: false };

export default function PendingRegistrationOtpsTable() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [progressFilter, setProgressFilter] = useState<string>("all");
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<PendingRegistrationOtp | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { items, total, loading, error, refetch } = usePendingRegistrationOtps({
    search: debouncedSearch || undefined,
    progress: progressFilter !== "all" ? (progressFilter as RegistrationOtpProgress) : undefined,
    partner_type: partnerTypeFilter !== "all" ? (partnerTypeFilter as "individual" | "agency") : undefined,
    page: currentPage,
    page_size: ITEMS_PER_PAGE,
  });

  const { resendRegistrationOtp } = useAdminResendRegistrationOtp();

  const activeFiltersCount =
    (debouncedSearch !== "" ? 1 : 0) +
    (progressFilter !== "all" ? 1 : 0) +
    (partnerTypeFilter !== "all" ? 1 : 0);

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setProgressFilter("all");
    setPartnerTypeFilter("all");
    setCurrentPage(1);
  };

  const handleResend = async (row: PendingRegistrationOtp) => {
    setResendingEmail(row.email);
    try {
      const res = await resendRegistrationOtp(row.email);
      showToast(res?.message || "Verification code resent successfully", "success");
      refetch();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      if (code === "otp_recently_sent") {
        showToast("A code was just sent — please wait a minute before resending.", "error");
      } else if (code === "otp_max_resends" || code === "max_resends_reached") {
        showToast("Resend budget spent — the partner needs to fill out the registration form again.", "error");
        refetch();
      } else if (code === "email_already_registered") {
        showToast("This partner has already completed registration.", "error");
        refetch();
      } else if (code === "otp_email_failed") {
        showToast("Failed to send the email — please try again.", "error");
      } else {
        showToast(parseApiError(err, "Failed to resend verification code"), "error");
      }
    } finally {
      setResendingEmail(null);
      setConfirmTarget(null);
    }
  };

  return (
    <div className="text-p2">
      {/* Search + filters */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search by email, name, or company..."
            className="sm:w-64 sm:flex-none"
          />
          {loading && (
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-slate-400" aria-label="Updating results" />
          )}

          <div className="flex-1 sm:flex-none sm:w-56">
            <FilterSelectField
              value={progressFilter}
              onChange={(v: string) => { setProgressFilter(v); setCurrentPage(1); }}
              options={PROGRESS_OPTIONS}
              icon={KeyRound}
              defaultOption="All Statuses"
            />
          </div>

          <div className="flex-1 sm:flex-none sm:w-40">
            <FilterSelectField
              value={partnerTypeFilter}
              onChange={(v: string) => { setPartnerTypeFilter(v); setCurrentPage(1); }}
              options={PARTNER_TYPE_OPTIONS}
              icon={Building2}
              defaultOption="All Types"
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

      <div className="p-6">
        <TableWrapper
          footer={
            <TablePagination
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              itemCount={items.length}
              totalCount={total}
              itemLabel="pending registrations"
              loading={loading}
            />
          }
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="min-w-[220px] px-6 py-4 text-start text-sm font-semibold text-slate-900">Registrant</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">Type</th>
                <th className="min-w-[180px] px-6 py-4 text-start text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">Requested</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">Expires</th>
                <th className="px-6 py-4 text-start text-sm font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading && <TableSkeletonRows columns={6} rows={ITEMS_PER_PAGE} />}

              {!loading && error && (
                <TableErrorRow colSpan={6} message={error} onRetry={refetch} />
              )}

              {!loading && !error && items.length === 0 && (
                <TableEmptyRow
                  colSpan={6}
                  title="No pending registrations found"
                  subtitle={activeFiltersCount > 0 ? "Try adjusting your filters." : "No one is currently mid-registration."}
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

              {!loading && !error && items.map((row) => {
                const config = PROGRESS_CONFIG[row.progress] ?? UNKNOWN_PROGRESS_CONFIG;
                const isResending = resendingEmail === row.email;
                const resendsLeft = Math.max(0, MAX_RESENDS - row.resend_count);
                const canResend = config.canResend && resendsLeft > 0;
                return (
                  <tr key={row.email} className="transition-colors hover:bg-slate-50">
                    <td className="min-w-[220px] max-w-[300px] px-6 py-4">
                      <div className="truncate text-sm font-medium text-slate-900">{row.full_name || "—"}</div>
                      <div className="truncate text-xs text-slate-500">{row.email}</div>
                      {row.company_name && (
                        <div className="truncate text-xs text-slate-500">{row.company_name}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm capitalize text-slate-700">{row.partner_type || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge variant={config.variant} icon={config.icon}>{config.label}</StatusBadge>
                    </td>
                    <td className="px-6 py-4">
                      <AppDate value={row.created_at} format="short" fallback="—" />
                    </td>
                    <td className="px-6 py-4">
                      {row.progress === "completed" ? (
                        <span className="text-sm text-slate-400">—</span>
                      ) : (
                        <AppDate value={row.expires_at} format="short" fallback="—" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <IconButton
                        onClick={() => setConfirmTarget(row)}
                        disabled={!canResend || isResending}
                        title={
                          isResending
                            ? "Sending..."
                            : canResend
                              ? `Resend verification code (${resendsLeft} left)`
                              : "Resend limit reached"
                        }
                        icon={<KeyRound className={`h-4 w-4 ${isResending ? "animate-pulse" : ""}`} />}
                        bgColor="bg-transparent"
                        textColor="text-slate-400"
                        borderColor="border-transparent"
                        hoverTextColor="hover:text-blue-600"
                        hoverBorderColor="hover:border-transparent"
                        className="hover:bg-blue-50"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrapper>
      </div>

      {confirmTarget && (
        <ResendRegistrationOtpConfirmation
          isOpen={!!confirmTarget}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => handleResend(confirmTarget)}
          isSubmitting={resendingEmail === confirmTarget.email}
          email={confirmTarget.email}
          resendsLeft={Math.max(0, MAX_RESENDS - confirmTarget.resend_count)}
        />
      )}
    </div>
  );
}
