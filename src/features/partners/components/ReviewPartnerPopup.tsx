"use client";

import React, { useEffect, useState } from "react";
import { CheckCircle, ShieldCheck, XCircle } from "lucide-react";
import { useReviewPartner } from "../hooks";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import ApproveRejectToggle from "components/ui/buttons/ApproveRejectToggle";
import { useToast } from "components/context/ToastContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  partnerId: string;
  partnerName: string;
}

export default function ReviewPartnerPopup({ isOpen, onClose, onSuccess, partnerId, partnerName }: Props) {
  const { showToast } = useToast();
  const { reviewPartner, loading } = useReviewPartner();

  const [isVisible, setIsVisible] = useState(false);
  const [decision, setDecision] = useState<"approved" | "rejected" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const t = setTimeout(() => {
        setIsVisible(false);
        setDecision(null);
        setRejectionReason("");
        setReasonError("");
      }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!decision) return;
    if (decision === "rejected" && !rejectionReason.trim()) {
      setReasonError("Rejection reason is required");
      return;
    }
    try {
      await reviewPartner(partnerId, decision, rejectionReason.trim() || undefined);
      showToast(
        decision === "approved" ? "Partner approved successfully" : "Partner rejected successfully",
        "success",
      );
      onClose();
      onSuccess?.();
    } catch (err: any) {
      const data = err?.response?.data;
      const msg =
        (typeof data?.message === "string" ? data.message : null) ||
        (typeof data?.detail === "string" ? data.detail : null) ||
        "Failed to submit review";
      showToast(msg, "error");
    }
  };

  if (!isVisible) return null;

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
            title="Review Partner"
            description={`Review registration for ${partnerName}`}
            icon={ShieldCheck}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            iconBorder="border-amber-300"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="space-y-4 px-4 py-5">
            {/* Info banner */}
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <p className="leading-relaxed text-slate-900">
                Choose whether to <strong>approve</strong> or <strong>reject</strong> this partner's registration.
                Rejection requires a reason that will be shared with the partner.
              </p>
            </div>

            {/* Decision toggle */}
            <ApproveRejectToggle
              value={decision}
              onChange={(v) => { setDecision(v); if (v === "approved") setReasonError(""); }}
              disabled={loading}
              companyName={partnerName}
            />

            {/* Rejection reason */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${decision === "rejected" ? "max-h-48 opacity-100" : "max-h-0 opacity-0"}`}>
              <div>
                <label className="mb-1.5 block font-medium text-slate-900">
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

          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              text="Cancel"
              onClick={onClose}
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${decision ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"}`}>
              {decision === "approved" ? (
                <Button
                  icon={<CheckCircle className="h-5 w-5" />}
                  text={loading ? "Approving..." : "Approve Partner"}
                  onClick={handleSubmit}
                  disabled={loading}
                  bgColor="bg-emerald-50"
                  textColor="text-emerald-700"
                  borderColor="border-emerald-600"
                  hoverTextColor="hover:text-emerald-800"
                  hoverBorderColor="hover:border-emerald-700"
                  className="whitespace-nowrap"
                />
              ) : (
                <Button
                  icon={<XCircle className="h-5 w-5" />}
                  text={loading ? "Rejecting..." : "Reject Partner"}
                  onClick={handleSubmit}
                  disabled={loading}
                  bgColor="bg-red-50"
                  textColor="text-red-700"
                  borderColor="border-red-600"
                  hoverTextColor="hover:text-red-800"
                  hoverBorderColor="hover:border-red-700"
                  className="whitespace-nowrap"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
