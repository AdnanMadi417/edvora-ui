"use client";

import React, { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, CheckCircle2, ClipboardCheck, ShieldCheck, UserCog, XCircle } from "lucide-react";
import { useReviewPartner, useAssignPartnerManager } from "features/partners/hooks";
import ModalHeader from "components/ub/feedback/ModalHeader";
import StatusBadge from "components/ub/data/StatusBadge";
import Button from "components/ub/core/Button";
import ApproveRejectToggle from "components/ub/core/ApproveRejectToggle";
import SelectField from "components/ub/forms/SelectField";
import { useToast } from "components/ub/feedback/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  partnerId: string;
  partnerName: string;
  managerOptions: { label: string; value: string }[];
  currentManagerId?: string;
}

export default function ReviewPartnerPopup({
  isOpen,
  onClose,
  onSuccess,
  partnerId,
  partnerName,
  managerOptions,
  currentManagerId,
}: Props) {
  const { showToast } = useToast();
  const { reviewPartner, loading } = useReviewPartner();
  const { assignManager, loading: assigningManager } = useAssignPartnerManager();

  const [isVisible, setIsVisible] = useState(false);
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [managerFormData, setManagerFormData] = useState({ manager_id: "" });
  const [managerErrors, setManagerErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setManagerFormData({ manager_id: currentManagerId || "" });
      setManagerErrors({});
    } else {
      const t = setTimeout(() => {
        setIsVisible(false);
        setDecision(null);
        setRejectionReason("");
        setReasonError("");
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, currentManagerId]);

  const updateManagerFormData = (field: string, value: any) => {
    setManagerFormData((prev) => ({ ...prev, [field]: value }));
    setManagerErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleAssignManager = async () => {
    if (!managerFormData.manager_id) {
      setManagerErrors({ manager_id: "Please select a manager" });
      return;
    }
    try {
      await assignManager(partnerId, { manager_id: managerFormData.manager_id });
      showToast("Manager assigned successfully", "success");
      onSuccess?.();
    } catch (err: any) {
      const backendMessage = parseApiError(err, "Failed to assign manager. Please try again.");
      showToast(backendMessage, "error");
      if (err?.response?.data?.code === "manager_not_available") {
        setManagerErrors({ manager_id: backendMessage });
      }
    }
  };

  const handleSubmit = async () => {
    if (!decision) return;
    if (decision === "rejected" && !rejectionReason.trim()) {
      setReasonError("Rejection reason is required");
      return;
    }
    if (decision === "approved" && !managerFormData.manager_id) {
      setManagerErrors({ manager_id: "A manager must be assigned before approving" });
      return;
    }
    try {
      if (managerFormData.manager_id && managerFormData.manager_id !== currentManagerId) {
        await assignManager(partnerId, { manager_id: managerFormData.manager_id });
      }
      await reviewPartner(partnerId, decision, rejectionReason.trim() || undefined);
      showToast(
        decision === "approved" ? "Advisor approved successfully" : "Advisor rejected successfully",
        "success",
      );
      onClose();
      onSuccess?.();
    } catch (err: unknown) {
      showToast(parseApiError(err, "Failed to submit review"), "error");
    }
  };

  if (!isVisible) return null;

  const managerBusy = loading || assigningManager;
  const managerIsUnchanged = managerFormData.manager_id !== "" && managerFormData.manager_id === currentManagerId;
  const managerIsPending = managerFormData.manager_id !== "" && managerFormData.manager_id !== currentManagerId;
  const managerIsMissing = !managerFormData.manager_id;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white text-sm shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Review Advisor"
            description={`Review registration for ${partnerName}`}
            icon={ShieldCheck}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            iconBorder="border-amber-300"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="flex flex-col gap-4 px-6 py-6">
            {/* Account Manager */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                    <UserCog className="h-4 w-4 text-slate-500" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Account Manager</p>
                    <p className="text-xs text-slate-500">Required before this partner can be approved</p>
                  </div>
                </div>

                {managerIsMissing ? (
                  <StatusBadge variant="warning" icon={<AlertTriangle className="h-3 w-3" />} className="shrink-0">
                    Not assigned
                  </StatusBadge>
                ) : managerIsPending ? (
                  <StatusBadge variant="info" className="shrink-0">
                    Pending change
                  </StatusBadge>
                ) : (
                  <StatusBadge variant="success" icon={<CheckCircle2 className="h-3 w-3" />} className="shrink-0">
                    Assigned
                  </StatusBadge>
                )}
              </div>

              <div className="grid gap-2">
                <div className="flex-1">
                  <SelectField
                    label="Manager"
                    field="manager_id"
                    options={managerOptions}
                    formData={managerFormData}
                    errors={managerErrors}
                    updateFormData={updateManagerFormData}
                    disabled={managerBusy}
                  />
                </div>
                <Button
                  icon={<UserCog className="h-4 w-4" />}
                  text={assigningManager ? "Assigning..." : "Assign"}
                  onClick={handleAssignManager}
                  disabled={managerBusy || managerIsMissing || managerIsUnchanged}
                  bgColor="bg-slate-50"
                  textColor="text-slate-700"
                  borderColor="border-slate-400"
                  hoverTextColor="hover:text-slate-900"
                  hoverBorderColor="hover:border-slate-500"
                  className="mb-4 whitespace-nowrap"
                />
              </div>

              {managerIsPending && (
                <p className="-mt-2 text-xs text-blue-600">
                  Will be assigned automatically when you submit your decision.
                </p>
              )}
            </div>

            {/* Decision */}
            <div className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50">
                  <ClipboardCheck className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">Decision</p>
                  <p className="text-xs text-slate-500">Approve or reject this registration</p>
                </div>
              </div>

              <ApproveRejectToggle
                value={decision}
                onChange={(v) => { setDecision(v); if (v === "approved") setReasonError(""); }}
                disabled={managerBusy}
              />

              {decision === "approved" && managerIsMissing && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0" /> Assign a manager above before approving.
                </p>
              )}

              {/* Rejection reason */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${decision === "rejected" ? "mt-4 max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-slate-900">
                    Rejection Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => { setRejectionReason(e.target.value); setReasonError(""); }}
                    placeholder="Explain why this registration is being rejected..."
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                  {reasonError && <p className="mt-1 text-xs text-red-600">{reasonError}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-gray-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              text="Cancel"
              onClick={onClose}
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out sm:w-auto ${decision ? "max-w-full opacity-100 sm:max-w-[200px]" : "max-w-0 opacity-0"}`}>
              {decision === "approved" ? (
                <Button
                  icon={<CheckCircle className="h-5 w-5" />}
                  text={loading ? "Approving..." : "Approve Advisor"}
                  onClick={handleSubmit}
                  disabled={managerBusy}
                  bgColor="bg-emerald-50"
                  textColor="text-emerald-700"
                  borderColor="border-emerald-600"
                  hoverTextColor="hover:text-emerald-800"
                  hoverBorderColor="hover:border-emerald-700"
                  className="w-full whitespace-nowrap sm:w-auto"
                />
              ) : (
                <Button
                  icon={<XCircle className="h-5 w-5" />}
                  text={loading ? "Rejecting..." : "Reject Advisor"}
                  onClick={handleSubmit}
                  disabled={managerBusy}
                  bgColor="bg-red-50"
                  textColor="text-red-700"
                  borderColor="border-red-600"
                  hoverTextColor="hover:text-red-800"
                  hoverBorderColor="hover:border-red-700"
                  className="w-full whitespace-nowrap sm:w-auto"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
