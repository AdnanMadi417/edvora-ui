"use client";
import DataTable, {
  type DataTableColumn,
} from "components/ub/data/tables/DataTable";
import DataTableToolbar from "components/ub/data/tables/DataTableToolbar";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import SelectField from "components/ub/forms/selection/SelectField";
import { SlidersHorizontal } from "lucide-react";

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
import { AnimatePresence } from "framer-motion";
import {
  usePendingRegistrationOtps,
  useAdminResendRegistrationOtp,
} from "features/partners/hooks";
import type {
  RegistrationOtpProgress,
  PendingRegistrationOtp,
} from "features/partners/types";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import AppDate from "components/ub/data/formatting/AppDate";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import Button from "components/ub/core/buttons/Button";
import IconButton from "components/ub/core/buttons/IconButton";
import TablePagination from "components/ub/data/tables/TablePagination";
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
const PROGRESS_CONFIG: Record<
  RegistrationOtpProgress,
  {
    label: string;
    variant: "warning" | "danger" | "attention" | "success" | "neutral";
    icon: React.ReactNode;
    canResend: boolean;
  }
> = {
  otp_pending: {
    label: "Awaiting verification",
    variant: "warning",
    icon: <Clock className="h-3 w-3" />,
    canResend: true,
  },
  otp_expired: {
    label: "Expired",
    variant: "attention",
    icon: <Clock className="h-3 w-3" />,
    canResend: true,
  },
  max_resends_reached: {
    label: "Needs re-registration",
    variant: "danger",
    icon: <Ban className="h-3 w-3" />,
    canResend: false,
  },
  otp_attempts_exhausted: {
    label: "Locked — needs resend",
    variant: "danger",
    icon: <Lock className="h-3 w-3" />,
    canResend: true,
  },
  completed: {
    label: "Registered",
    variant: "success",
    icon: <CheckCircle2 className="h-3 w-3" />,
    canResend: false,
  },
};

// A progress value the backend added after this map was written would
// otherwise index to `undefined` and throw during render, taking down the
// whole page (both tabs) — fall back to something renderable instead.
const UNKNOWN_PROGRESS_CONFIG = {
  label: "Unknown",
  variant: "neutral" as const,
  icon: undefined,
  canResend: false,
};

export default function PendingRegistrationOtpsTable() {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [progressFilter, setProgressFilter] = useState<string>("all");
  const [partnerTypeFilter, setPartnerTypeFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] =
    useState<PendingRegistrationOtp | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const { items, total, loading, error, refetch } = usePendingRegistrationOtps({
    search: debouncedSearch || undefined,
    progress:
      progressFilter !== "all"
        ? (progressFilter as RegistrationOtpProgress)
        : undefined,
    partner_type:
      partnerTypeFilter !== "all"
        ? (partnerTypeFilter as "individual" | "agency")
        : undefined,
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
      showToast(
        res?.message || "Verification code resent successfully",
        "success"
      );
      refetch();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      if (code === "otp_recently_sent") {
        showToast(
          "A code was just sent — please wait a minute before resending.",
          "error"
        );
      } else if (code === "otp_max_resends" || code === "max_resends_reached") {
        showToast(
          "Resend budget spent — the advisor needs to fill out the registration form again.",
          "error"
        );
        refetch();
      } else if (code === "email_already_registered") {
        showToast("This advisor has already completed registration.", "error");
        refetch();
      } else if (code === "otp_email_failed") {
        showToast("Failed to send the email — please try again.", "error");
      } else {
        showToast(
          parseApiError(err, "Failed to resend verification code"),
          "error"
        );
      }
    } finally {
      setResendingEmail(null);
      setConfirmTarget(null);
    }
  };

  const columns: DataTableColumn<PendingRegistrationOtp>[] = [
    {
      key: "Registrant",
      header: "Registrant",
      cell: (row) => {
        const config = PROGRESS_CONFIG[row.progress] ?? UNKNOWN_PROGRESS_CONFIG;
        const isResending = resendingEmail === row.email;
        const resendsLeft = Math.max(0, MAX_RESENDS - row.resend_count);
        const canResend = config.canResend && resendsLeft > 0;
        return (
          <>
            {" "}
            <div className="truncate text-sm font-medium text-ub-text-primary">
              {row.full_name || "—"}
            </div>
            <div className="truncate text-xs text-ub-text-secondary">{row.email}</div>
            {row.company_name && (
              <div className="truncate text-xs text-ub-text-secondary">
                {row.company_name}
              </div>
            )}
          </>
        );
      },
    },
    {
      key: "Type",
      header: "Type",
      cell: (row) => {
        const config = PROGRESS_CONFIG[row.progress] ?? UNKNOWN_PROGRESS_CONFIG;
        const isResending = resendingEmail === row.email;
        const resendsLeft = Math.max(0, MAX_RESENDS - row.resend_count);
        const canResend = config.canResend && resendsLeft > 0;
        return (
          <>
            {" "}
            <span className="text-sm capitalize text-ub-text-secondary">
              {row.partner_type || "—"}
            </span>
          </>
        );
      },
    },
    {
      key: "Status",
      header: "Status",
      cell: (row) => {
        const config = PROGRESS_CONFIG[row.progress] ?? UNKNOWN_PROGRESS_CONFIG;
        const isResending = resendingEmail === row.email;
        const resendsLeft = Math.max(0, MAX_RESENDS - row.resend_count);
        const canResend = config.canResend && resendsLeft > 0;
        return (
          <>
            {" "}
            <StatusBadge variant={config.variant} icon={config.icon}>
              {config.label}
            </StatusBadge>
          </>
        );
      },
    },
    {
      key: "Requested",
      header: "Requested",
      cell: (row) => {
        const config = PROGRESS_CONFIG[row.progress] ?? UNKNOWN_PROGRESS_CONFIG;
        const isResending = resendingEmail === row.email;
        const resendsLeft = Math.max(0, MAX_RESENDS - row.resend_count);
        const canResend = config.canResend && resendsLeft > 0;
        return (
          <>
            {" "}
            <AppDate value={row.created_at} format="datetime" fallback="—" />
          </>
        );
      },
    },
    {
      key: "Expires",
      header: "Expires",
      cell: (row) => {
        const config = PROGRESS_CONFIG[row.progress] ?? UNKNOWN_PROGRESS_CONFIG;
        const isResending = resendingEmail === row.email;
        const resendsLeft = Math.max(0, MAX_RESENDS - row.resend_count);
        const canResend = config.canResend && resendsLeft > 0;
        return (
          <>
            {" "}
            {row.progress === "completed" ? (
              <span className="text-sm text-ub-text-tertiary">—</span>
            ) : (
              <AppDate value={row.expires_at} format="datetime" fallback="—" />
            )}
          </>
        );
      },
    },
    {
      key: "Actions",
      header: "Actions",
      cell: (row) => {
        const config = PROGRESS_CONFIG[row.progress] ?? UNKNOWN_PROGRESS_CONFIG;
        const isResending = resendingEmail === row.email;
        const resendsLeft = Math.max(0, MAX_RESENDS - row.resend_count);
        const canResend = config.canResend && resendsLeft > 0;
        return (
          <>
            {" "}
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
              icon={
                <KeyRound
                  className={`h-4 w-4 ${isResending ? "animate-pulse" : ""}`}
                />
              }
              bgColor="bg-transparent"
              textColor="text-ub-text-tertiary"
              borderColor="border-transparent"
              hoverTextColor="hover:text-ub-text-link"
              hoverBorderColor="hover:border-transparent"
              className="hover:bg-ub-tone-brand-bg"
            />
          </>
        );
      },
    },
  ];
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState({ progress: "all", type: "all" });
  return (
    <div className="text-p2">
      <div className="border-b border-ub-border p-4 sm:p-6">
        <DataTableToolbar
          className="!mb-0"
          search={{
            value: searchTerm,
            onChange: setSearchTerm,
            placeholder: "Search by email, name, or company...",
          }}
          filters={
            <Button
              variant="secondary"
              text="Registration filters"
              icon={<SlidersHorizontal className="h-4 w-4" />}
              onClick={() => {
                setDraft({ progress: progressFilter, type: partnerTypeFilter });
                setFiltersOpen(true);
              }}
            />
          }
          actions={
            <div className="flex items-center gap-3">
              {activeFiltersCount > 0 && (
                <Button
                  text="Clear"
                  variant="tertiary"
                  onClick={clearFilters}
                />
              )}
              <p
                role="status"
                className="whitespace-nowrap text-ub-label-sm text-ub-text-secondary"
              >
                {total} registrations
              </p>
            </div>
          }
        />
      </div>
      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title="Filter registrations"
        description="Choose verification progress and advisor type."
        footer={
          <>
            <Button
              variant="secondary"
              text="Clear filters"
              onClick={() => {
                setDraft({ progress: "all", type: "all" });
                setProgressFilter("all");
                setPartnerTypeFilter("all");
                setCurrentPage(1);
                setFiltersOpen(false);
              }}
            />
            <Button
              variant="primary"
              text="Apply filters"
              onClick={() => {
                setProgressFilter(draft.progress);
                setPartnerTypeFilter(draft.type);
                setCurrentPage(1);
                setFiltersOpen(false);
              }}
            />
          </>
        }
      >
        <div className="space-y-6">
          <SelectField
            label="Verification progress"
            field="progress"
            formData={draft}
            errors={{}}
            updateFormData={(field, value) =>
              setDraft((prev) => ({ ...prev, [field]: String(value) }))
            }
            options={[
              { value: "all", label: "All statuses" },
              ...PROGRESS_OPTIONS,
            ]}
          />
          <SelectField
            label="Advisor type"
            field="type"
            formData={draft}
            errors={{}}
            updateFormData={(field, value) =>
              setDraft((prev) => ({ ...prev, [field]: String(value) }))
            }
            options={[
              { value: "all", label: "All types" },
              ...PARTNER_TYPE_OPTIONS,
            ]}
          />
        </div>
      </Drawer>
      <div className="min-w-0 p-3 sm:p-6">
        <DataTable
          columns={columns}
          rows={items}
          getRowId={(row) => row.email}
          caption="Pending advisor registrations"
          loading={loading}
          error={error}
          onRetry={refetch}
          getRowClassName={() => "md:[&>td]:py-4"}
          empty={{
            title: "No registrations found",
            description: "Try another search or adjust your filters.",
          }}
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
        />
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
