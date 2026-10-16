"use client";

import React, { useState } from "react";
import { AlertTriangle, UserCheck, CheckCircle, Wrench } from "lucide-react";

import { DetailStatusBadge } from "components/ui/badges";
import { SectionIconBadge } from "components/ui/icons";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import type { Dispute } from "features/applications/shared/applicationTypes";

import { useClaimDispute } from "../hooks";
import ResolveNoIssue from "./ResolveNoIssue";
import ResolveDisputeCorrection from "./ResolveDisputeCorrection";

interface DisputeSectionProps {
  dispute: Dispute | null;
  partnerPayoutId?: string | null;
  /** Admin-only — account managers and partners never get claim/resolve
   *  buttons, since those calls would 403 server-side for them anyway. */
  canManageDispute?: boolean;
  onRefetch?: () => void;
}

const CLAIM_ERROR_MESSAGES: Record<string, string> = {
  dispute_not_found: "This dispute could not be found — it may have already been removed.",
  dispute_not_open: "This dispute has already been claimed or resolved.",
};

export default function DisputeSection({
  dispute,
  partnerPayoutId,
  canManageDispute = false,
  onRefetch,
}: DisputeSectionProps) {
  const { showToast } = useToast();
  const { claimDispute, loading: claiming } = useClaimDispute();
  const [showResolveNoIssue, setShowResolveNoIssue] = useState(false);
  const [showResolveCorrection, setShowResolveCorrection] = useState(false);

  if (!dispute) return null;

  const handleClaim = async () => {
    if (!dispute) return;
    try {
      await claimDispute(dispute.id);
      showToast("Dispute claimed.", "success");
      onRefetch?.();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);
      const msg = (code && CLAIM_ERROR_MESSAGES[code]) || parseApiError(err, "Failed to claim dispute.");
      showToast(msg, "error");
    }
  };

  const isActionable = dispute.status !== "resolved";

  return (
    <div className="space-y-4 border-t border-slate-200 p-6">
      <div className="flex items-center gap-3">
        <SectionIconBadge icon={AlertTriangle} color="red" />
        <div className="flex-1">
          <p className="text-p3 font-semibold text-slate-900">Dispute</p>
          <span className="text-sm text-slate-500">
            {dispute.status === "open" && "Raised, not yet claimed"}
            {dispute.status === "pending" && "Claimed, awaiting resolution"}
            {dispute.status === "resolved" && "Resolved"}
          </span>
        </div>
        <DetailStatusBadge variant={dispute.status === "resolved" ? "success" : "danger"}>
          {dispute.status === "open" && "Open"}
          {dispute.status === "pending" && "Pending"}
          {dispute.status === "resolved" && "Resolved"}
        </DetailStatusBadge>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Justification</p>
        <p className="mt-1">{dispute.justification}</p>
      </div>

      {dispute.report && (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <p className="font-medium text-slate-900">Report</p>
          <p className="mt-1">{dispute.report}</p>
        </div>
      )}

      {canManageDispute && isActionable && (
        <div className="flex flex-wrap justify-end gap-3">
          {dispute.status === "open" && (
            <Button
              onClick={handleClaim}
              disabled={claiming}
              icon={<UserCheck className="h-4 w-4" />}
              text={claiming ? "Claiming..." : "Claim"}
              bgColor="bg-white"
              textColor="text-blue-600"
              borderColor="border-blue-200"
              hoverTextColor="hover:text-blue-700"
              hoverBorderColor="hover:border-blue-300"
              className="hover:bg-blue-50"
            />
          )}
          <Button
            onClick={() => setShowResolveNoIssue(true)}
            icon={<CheckCircle className="h-4 w-4" />}
            text="Resolve: No Issue"
            bgColor="bg-white"
            textColor="text-green-600"
            borderColor="border-green-200"
            hoverTextColor="hover:text-green-700"
            hoverBorderColor="hover:border-green-300"
            className="hover:bg-green-50"
          />
          {partnerPayoutId && (
            <Button
              onClick={() => setShowResolveCorrection(true)}
              icon={<Wrench className="h-4 w-4" />}
              text="Resolve: Correction"
              bgColor="bg-white"
              textColor="text-red-600"
              borderColor="border-red-200"
              hoverTextColor="hover:text-red-700"
              hoverBorderColor="hover:border-red-300"
              className="hover:bg-red-50"
            />
          )}
        </div>
      )}

      <ResolveNoIssue
        isOpen={showResolveNoIssue}
        onClose={() => setShowResolveNoIssue(false)}
        disputeId={dispute.id}
        onSuccess={onRefetch}
      />

      {partnerPayoutId && (
        <ResolveDisputeCorrection
          isOpen={showResolveCorrection}
          onClose={() => setShowResolveCorrection(false)}
          disputeId={dispute.id}
          partnerPayoutId={partnerPayoutId}
          onSuccess={onRefetch}
        />
      )}
    </div>
  );
}
