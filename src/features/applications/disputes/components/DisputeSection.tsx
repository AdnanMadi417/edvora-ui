"use client";

import React, { useState } from "react";
import { CheckCircle, Wrench } from "lucide-react";

import Button from "components/ub/core/Button";
import DescriptionList from "components/ub/data/DescriptionList";
import SectionCard from "components/ub/data/SectionCard";
import Tag from "components/ub/data/Tag";
import type { Dispute } from "features/applications/shared/applicationTypes";

import ResolveNoIssue from "./ResolveNoIssue";
import ResolveDisputeCorrection from "./ResolveDisputeCorrection";

interface DisputeSectionProps {
  dispute: Dispute | null;
  partnerPayoutId?: string | null;
  /** Admin-only — account managers and partners never get resolve
   *  buttons, since those calls would 403 server-side for them anyway. */
  canManageDispute?: boolean;
  onRefetch?: () => void;
}

export default function DisputeSection({
  dispute,
  partnerPayoutId,
  canManageDispute = false,
  onRefetch,
}: DisputeSectionProps) {
  const [showResolveNoIssue, setShowResolveNoIssue] = useState(false);
  const [showResolveCorrection, setShowResolveCorrection] = useState(false);

  if (!dispute) return null;

  const isActionable = dispute.status !== "resolved";

  const STATUS = {
    open: { label: "Open", description: "Raised, not yet claimed", tone: "attention" as const },
    pending: { label: "In review", description: "Claimed, awaiting resolution", tone: "warning" as const },
    resolved: { label: "Resolved", description: "Resolved", tone: "success" as const },
  }[dispute.status];

  return (
    <SectionCard
      title="Dispute"
      description={STATUS.description}
      action={<Tag tone={STATUS.tone}>{STATUS.label}</Tag>}
      footer={
        canManageDispute && isActionable ? (
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowResolveNoIssue(true)} icon={<CheckCircle className="h-4 w-4" aria-hidden="true" />} text="Resolve: no issue" />
            {partnerPayoutId && <Button variant="secondary" size="sm" onClick={() => setShowResolveCorrection(true)} icon={<Wrench className="h-4 w-4" aria-hidden="true" />} text="Resolve with a correction" />}
          </div>
        ) : undefined
      }
    >
      <DescriptionList
        items={[
          { label: "Justification", value: <span className="whitespace-pre-wrap">{dispute.justification}</span> },
          ...(dispute.report ? [{ label: "Report", value: <span className="whitespace-pre-wrap">{dispute.report}</span> }] : []),
        ]}
      />

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
    </SectionCard>
  );
}
