"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban, CheckCircle, ChevronLeft, Power, ShieldCheck, XCircle } from "lucide-react";

import { useStaffUserDetails, useSuspendStaffUser, useReactivateStaffUser } from "../../hooks";

import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import Button from "components/ui/buttons/Button";
import { StatusBadge } from "components/ui/badges";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

import SuspendReactivateStaffUserModal from "./SuspendReactivateStaffUserModal";

interface StaffUserDetailsProps {
  userId: string;
}

export default function StaffUserDetails({ userId }: StaffUserDetailsProps) {
  const router = useRouter();
  const { showToast } = useToast();

  const { staffUser, loading, refetch } = useStaffUserDetails(userId);
  const { suspendStaffUser, loading: isSuspending } = useSuspendStaffUser();
  const { reactivateStaffUser, loading: isReactivating } = useReactivateStaffUser();
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
  if (!staffUser) return <EmptyData />;

  const isSubmitting = isSuspending || isReactivating;

  return (
    <section className="mx-auto mt-6 max-w-5xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-card shadow-sm">
        {/* Header */}
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-light text-lg font-semibold text-slate-700">
              {staffUser.name?.slice(0, 2).toUpperCase() ?? "?"}
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold text-slate-900">{staffUser.name}</h1>
                {staffUser.is_active ? (
                  <StatusBadge variant="success" icon={<CheckCircle className="h-3 w-3" />}>Active</StatusBadge>
                ) : (
                  <StatusBadge variant="neutral" icon={<XCircle className="h-3 w-3" />}>Suspended</StatusBadge>
                )}
              </div>
              <p className="break-all text-sm text-slate-500">{staffUser.email}</p>
            </div>
          </div>

          <Button
            onClick={() => router.push("/admin/staff-users")}
            icon={<ChevronLeft className="h-4 w-4" />}
            text="Back"
            bgColor="bg-white"
            textColor="text-slate-700"
            borderColor="border-slate-200"
            hoverTextColor="hover:text-slate-900"
            hoverBorderColor="hover:border-slate-300"
          />
        </div>

        <div className="h-px w-full bg-slate-200" />

        {/* Role */}
        <div className="p-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Role
          </p>
          <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-900">{staffUser.role?.name ?? "—"}</p>
              <code className="mt-0.5 inline-block rounded bg-white px-1.5 py-0.5 text-xs text-slate-500">
                {staffUser.role?.code}
              </code>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-slate-200 bg-card px-6 py-4">
          <Button
            onClick={() => setIsSuspendOpen(true)}
            icon={staffUser.is_active ? <Ban className="h-4 w-4" /> : <Power className="h-4 w-4" />}
            text={staffUser.is_active ? "Suspend Account" : "Reactivate Account"}
            bgColor={staffUser.is_active ? "bg-red-50" : "bg-emerald-50"}
            textColor={staffUser.is_active ? "text-red-700" : "text-emerald-700"}
            borderColor={staffUser.is_active ? "border-red-600" : "border-emerald-600"}
            hoverTextColor={staffUser.is_active ? "hover:text-red-800" : "hover:text-emerald-800"}
            hoverBorderColor={staffUser.is_active ? "hover:border-red-700" : "hover:border-emerald-700"}
          />
        </div>
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
