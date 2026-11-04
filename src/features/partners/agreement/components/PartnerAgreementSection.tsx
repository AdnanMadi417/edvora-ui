"use client";

import React from "react";
import { FileSignature, Send, RotateCcw } from "lucide-react";

import DetailStatusBadge from "components/ub/data/badges/DetailStatusBadge";
import type { StatusBadgeVariant } from "components/ub/data/badges/StatusBadge";
import SectionIconBadge from "components/ub/icons/SectionIconBadge";
import Button from "components/ub/core/buttons/Button";
import Skeleton from "components/ub/feedback/states/Skeleton";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getApiErrorCode } from "utils/parseApiError";
import AppDate from "components/ub/data/formatting/AppDate";
import DocumentActions from "features/applications/shared/DocumentActions";

import { usePartnerAgreement, useStartPartnerAgreement } from "../hooks";
import type { AgreementStatus } from "../types";

interface PartnerAgreementSectionProps {
  partnerId: string;
  partnerName?: string;
  /** Admin and account managers can start/resend; reviewers and the
   *  partner's own profile get a read-only view (the partner doesn't
   *  self-initiate signing their own agreement). */
  canManage?: boolean;
}

const STATUS_LABEL: Record<AgreementStatus, string> = {
  sent: "Awaiting advisor signature",
  partner_signed: "Finalizing…",
  completed: "Completed",
  declined: "Declined",
  expired: "Expired",
};

const STATUS_VARIANT: Record<AgreementStatus, StatusBadgeVariant> = {
  sent: "info",
  partner_signed: "attention",
  completed: "success",
  declined: "danger",
  expired: "neutral",
};

const START_ERROR_MESSAGES: Record<string, string> = {
  agreement_already_pending: "An agreement is already in progress for this advisor.",
  forbidden_partner_access: "You don't have access to this advisor's agreement.",
  docuseal_not_configured: "Something went wrong. Please try again later.",
  docuseal_request_failed: "Something went wrong. Please try again later.",
};

export default function PartnerAgreementSection({ partnerId, partnerName, canManage = false }: PartnerAgreementSectionProps) {
  const { agreement, loading, error, refetch } = usePartnerAgreement(partnerId);
  const { startAgreement, loading: starting } = useStartPartnerAgreement();
  const { showToast } = useToast();

  const handleStart = async () => {
    try {
      await startAgreement(partnerId);
      showToast("Advisor agreement sent for signature.", "success");
      refetch();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      showToast((code && START_ERROR_MESSAGES[code]) || "Failed to send advisor agreement.", "error");
      // A 409 means one's already in flight server-side even though we
      // thought there wasn't -- refetch so the UI catches up either way.
      if (code === "agreement_already_pending") refetch();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 border-t border-slate-200 p-6">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border-t border-slate-200 p-6 text-sm text-red-600">
        {error}
      </div>
    );
  }

  const isTerminalFailure = agreement?.status === "declined" || agreement?.status === "expired";

  return (
    <div className="space-y-4 border-t border-slate-200 p-6">
      <div className="flex items-center gap-3">
        <SectionIconBadge icon={FileSignature} color="violet" />
        <div className="flex-1">
          <p className="text-p3 font-semibold text-slate-900">Advisor Agreement</p>
          {agreement && (
            <span className="text-sm text-slate-500">
              Sent <AppDate value={agreement.sent_at} format="short" />
            </span>
          )}
        </div>
        {agreement && (
          <DetailStatusBadge variant={STATUS_VARIANT[agreement.status]}>
            {STATUS_LABEL[agreement.status]}
          </DetailStatusBadge>
        )}
      </div>

      {!agreement && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-slate-500">No agreement has been sent to this advisor yet.</p>
          {canManage && (
            <Button
              onClick={handleStart}
              disabled={starting}
              icon={<Send className="h-4 w-4" />}
              text={starting ? "Sending..." : "Sign Advisor Agreement"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
            />
          )}
        </div>
      )}

      {agreement?.status === "completed" && (
        <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          <span>
            Signed <AppDate value={agreement.completed_at} format="short" />
          </span>
          <div className="flex items-center gap-2">
            <DocumentActions fileKey={agreement.file_key} label="Advisor Agreement" personName={partnerName} />
          </div>
        </div>
      )}

      {canManage && isTerminalFailure && (
        <div className="flex justify-end">
          <Button
            onClick={handleStart}
            disabled={starting}
            icon={<RotateCcw className="h-4 w-4" />}
            text={starting ? "Sending..." : "Resend"}
            bgColor="bg-white"
            textColor="text-slate-600"
            borderColor="border-slate-300"
            hoverTextColor="hover:text-slate-800"
            hoverBorderColor="hover:border-slate-400"
          />
        </div>
      )}
    </div>
  );
}
