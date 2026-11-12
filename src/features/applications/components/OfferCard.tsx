"use client";

import { FileCheck2 } from "lucide-react";
import Amount from "components/ub/core/typography/Amount";
import DaysTag from "components/ub/data/badges/DaysTag";
import KeyValueGrid from "components/ub/data/display/KeyValueGrid";
import SectionCard, { type SectionCardState } from "components/ub/data/cards/SectionCard";
import StatusTag from "components/ub/dashboard/shared/StatusTag";
import type { TagTone } from "components/ub/recipes";
import type { DocumentItem } from "features/applications/model/applicationView";
import DocumentRow from "./DocumentRow";

export type OfferStatus = "awaiting" | "received" | "declined";

export const OFFER_STATUS: Record<OfferStatus, { label: string; tone: TagTone }> = {
  awaiting: { label: "Awaiting decision", tone: "neutral" },
  received: { label: "Offer received", tone: "success" },
  declined: { label: "Not offered", tone: "danger" },
};

/** Pure: offer status from the backend status code and whether an offer letter exists. */
export function offerStatusOf(statusCode: string | null | undefined, hasOfferLetter: boolean): OfferStatus {
  if (statusCode === "REJECTED_BY_UNIVERSITY") return "declined";
  return hasOfferLetter ? "received" : "awaiting";
}

export interface OfferCardProps {
  status: OfferStatus;
  offerLetter?: DocumentItem | null;
  /** Offer conditions, one per line. Hidden when the API has none. */
  conditions?: string[];
  /** Days until the offer expires. Hidden when the API doesn't provide it. */
  expiresInDays?: number | null;
  /** Visa fee from the visa case, once set up. */
  visaFee?: { amount: number; currency: string } | null;
  visaFeeNote?: string | null;
  onDownload?: (doc: DocumentItem) => void;
  downloadingId?: string | null;
  state?: SectionCardState;
  onRetry?: () => void;
  className?: string;
}

/** Offer card (brief §6): status, conditions, expiry as a Days tag, offer letter download and the visa fee. */
export default function OfferCard({ status, offerLetter, conditions = [], expiresInDays, visaFee, visaFeeNote, onDownload, downloadingId, state = "ready", onRetry, className }: OfferCardProps) {
  const s = OFFER_STATUS[status];
  const resolved = state === "ready" && status === "awaiting" && !offerLetter ? "empty" : state;
  return (
    <SectionCard
      title="Offer"
      action={<StatusTag status={s.label} label={s.label} tone={s.tone} size="md" />}
      state={resolved}
      empty={{ icon: FileCheck2, title: s.label, description: "The offer letter appears here once the Institution decides." }}
      errorMessage="The offer couldn't load."
      onRetry={onRetry}
      className={className}
    >
      <div className="grid gap-4">
        {typeof expiresInDays === "number" && (
          <p className="flex items-center gap-2 text-ub-body-sm text-ub-text-secondary">
            Offer expiry <DaysTag mode="deadline" days={expiresInDays} />
          </p>
        )}
        {conditions.length > 0 && (
          <div>
            <h4 className="text-ub-label-sm text-ub-text-tertiary">Conditions</h4>
            <ul className="mt-2 list-disc space-y-1 ps-5 text-ub-body-sm text-ub-text-primary">
              {conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}
        {offerLetter && (
          <ul className="-my-4">
            <DocumentRow document={offerLetter} onDownload={onDownload} downloading={downloadingId === offerLetter.id} readOnly />
          </ul>
        )}
        {visaFee && (
          <KeyValueGrid
            columns={1}
            items={[{ label: "Visa fee", value: <Amount value={visaFee.amount} currency={visaFee.currency} />, hint: visaFeeNote ?? undefined }]}
          />
        )}
      </div>
    </SectionCard>
  );
}
