"use client";

import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import React, { useState } from "react";
import {
  Ban,
  CheckCircle,
  Power,
  ShieldCheck,
  XCircle,
  Mail,
  UserRound,
} from "lucide-react";

import {
  useStaffUserDetails,
  useSuspendStaffUser,
  useReactivateStaffUser,
} from "../../hooks";

import Loading from "components/ub/feedback/states/Loading";
import EmptyData from "components/ub/feedback/states/EmptyTableData";
import Button from "components/ub/core/buttons/Button";
import Alert from "components/ub/feedback/notifications/Alert";
import DescriptionList from "components/ub/data/display/DescriptionList";
import StatusBadge from "components/ub/data/badges/StatusBadge";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

import SuspendReactivateStaffUserModal from "./SuspendReactivateStaffUserModal";

interface StaffUserDetailsProps {
  userId: string;
}

export default function StaffUserDetails({ userId }: StaffUserDetailsProps) {
  const { showToast } = useToast();

  const { staffUser, loading, error, refetch } = useStaffUserDetails(userId);
  const { suspendStaffUser, loading: isSuspending } = useSuspendStaffUser();
  const { reactivateStaffUser, loading: isReactivating } =
    useReactivateStaffUser();
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);

  const handleToggleActive = async () => {
    if (!staffUser) return;
    try {
      if (staffUser.is_active) {
        await suspendStaffUser(staffUser.id);
        showToast("Staff user suspended successfully.", "success");
      } else {
        await reactivateStaffUser(staffUser.id);
        showToast("Staff user reactivated successfully.", "success");
      }
      setIsSuspendOpen(false);
      refetch();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to update staff user. ${backendMessage}`, "error");
    }
  };

  if (loading && !staffUser) return <Loading text="Loading staff user..." />;
  if (error)
    return (
      <div className="mt-5">
        <Alert
          tone="danger"
          title="Couldn’t load staff details"
          action={{ label: "Try again", onClick: refetch }}
        >
          {error}
        </Alert>
      </div>
    );
  if (!staffUser) return <EmptyData />;

  const isSubmitting = isSuspending || isReactivating;

  return (
    <section className="mx-auto mt-5 min-w-0 space-y-5">
      <header className="overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
        <div className="h-2 bg-ub-tone-brand-bg" />
        <div className="flex flex-col gap-5 p-4 sm:p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-ub-lg bg-ub-tone-brand-bg text-ub-heading-lg text-ub-tone-brand-text">
              {staffUser.name
                ?.split(/\s+/)
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0])
                .join("")
                .toUpperCase() || "?"}
            </span>
            <div className="min-w-0 space-y-2">
              <Breadcrumbs items={[{ label: "Staff users", href: "/admin/staff-users" }, { label: staffUser.name || "Staff user" }]} />
              <h1 className="break-words text-ub-heading-lg">
                {staffUser.name}
              </h1>
              <div className="flex flex-wrap gap-2">
                <StatusBadge
                  variant="info"
                  icon={<ShieldCheck className="h-3 w-3" />}
                >
                  {staffUser.role?.name ?? "No role assigned"}
                </StatusBadge>
                <StatusBadge
                  variant={staffUser.is_active ? "success" : "neutral"}
                  icon={
                    staffUser.is_active ? (
                      <CheckCircle className="h-3 w-3" />
                    ) : (
                      <XCircle className="h-3 w-3" />
                    )
                  }
                >
                  {staffUser.is_active ? "Active" : "Suspended"}
                </StatusBadge>
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="grid min-w-0 gap-5 lg:grid-cols-3">
        <section className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface lg:col-span-2">
          <div className="flex items-center gap-3 border-b border-ub-border p-4 sm:p-6">
            <UserRound className="h-5 w-5 text-ub-icon-interactive" />
            <h2 className="text-ub-heading-sm">Account details</h2>
          </div>
          <div className="p-4 sm:p-6">
            <DescriptionList
              className="[&_dd]:break-words"
              items={[
                {
                  label: "Email address",
                  value: (
                    <span className="flex min-w-0 items-start gap-2">
                      <Mail className="mt-1 h-4 w-4 shrink-0 text-ub-text-tertiary" />
                      <span className="break-all">
                        {staffUser.email || "—"}
                      </span>
                    </span>
                  ),
                },
                { label: "Assigned role", value: staffUser.role?.name },
              ]}
              divided
            />
          </div>
        </section>
        <section className="min-w-0 overflow-hidden rounded-ub-xl border border-ub-border bg-ub-surface">
          <div className="flex items-center gap-3 border-b border-ub-border p-4 sm:p-6">
            <ShieldCheck className="h-5 w-5 text-ub-icon-interactive" />
            <h2 className="text-ub-heading-sm">Account access</h2>
          </div>
          <div className="space-y-5 p-4 sm:p-6">
            <Alert
              tone={staffUser.is_active ? "info" : "warning"}
              title={
                staffUser.is_active ? "Access enabled" : "Access suspended"
              }
            >
              {staffUser.is_active
                ? "This staff member can sign in with their assigned role."
                : "This staff member cannot sign in until their account is reactivated."}
            </Alert>
            <Button
              onClick={() => setIsSuspendOpen(true)}
              icon={
                staffUser.is_active ? (
                  <Ban className="h-4 w-4" />
                ) : (
                  <Power className="h-4 w-4" />
                )
              }
              text={
                staffUser.is_active ? "Suspend Account" : "Reactivate Account"
              }
              variant="secondary"
              className="w-full"
              disabled={isSubmitting}
            />
          </div>
        </section>
      </div>

      <SuspendReactivateStaffUserModal
        isOpen={isSuspendOpen}
        onClose={() => setIsSuspendOpen(false)}
        onConfirm={handleToggleActive}
        isSubmitting={isSubmitting}
        staffUserName={staffUser.name}
        isActive={staffUser.is_active}
      />
    </section>
  );
}
