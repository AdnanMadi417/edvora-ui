"use client";

import ApplicationTracker, { type TrackerStep, type TrackerStepState } from "components/ub/brand/ApplicationTracker";
import SectionCard, { type SectionCardState } from "components/ub/data/cards/SectionCard";
import type { DocumentItem } from "features/applications/model/applicationView";
import DocumentRow from "./DocumentRow";

export interface VisaStepInput {
  id: string;
  label: string;
  /** The document that completes this step, when uploaded. */
  document: DocumentItem | null;
}

/**
 * Pure: visa steps from their documents. Verified → complete, uploaded → current
 * ("In review"), needs replacing → attention; the first step without a document
 * after the completed ones is current, the rest upcoming.
 */
export function visaSteps(inputs: VisaStepInput[]): TrackerStep[] {
  let activeSet = false;
  return inputs.map(({ id, label, document }) => {
    let state: TrackerStepState = "upcoming";
    let caption: string | undefined;
    if (document?.state === "verified") state = "complete";
    else if (document?.state === "needs-replacing") {
      state = "attention";
      caption = "Needs replacing";
    } else if (document) {
      state = "current";
      caption = "In review";
    } else if (!activeSet) state = "current";
    if (state === "current" || state === "attention") activeSet = true;
    return { id, label, state, caption };
  });
}

export interface VisaStatusCardProps {
  steps: VisaStepInput[];
  onDownload?: (doc: DocumentItem) => void;
  downloadingId?: string | null;
  state?: SectionCardState;
  onRetry?: () => void;
  className?: string;
}

/** Visa progress (eVAL, approval letter, e-Visa) as a vertical tracker plus the files so far. */
export default function VisaStatusCard({ steps, onDownload, downloadingId, state = "ready", onRetry, className }: VisaStatusCardProps) {
  const files = steps.map((s) => s.document).filter(Boolean) as DocumentItem[];
  return (
    <SectionCard title="Visa" state={state} loadingRows={4} errorMessage="Visa progress couldn't load." onRetry={onRetry} className={className}>
      <ApplicationTracker steps={visaSteps(steps)} orientation="vertical" label="Visa progress" />
      {files.length > 0 && (
        <ul className="mt-4 divide-y divide-ub-border border-t border-ub-border">
          {files.map((d) => (
            <DocumentRow key={d.id} document={d} onDownload={onDownload} downloading={downloadingId === d.id} readOnly />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
