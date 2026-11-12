// Application stages for the Application Details screens (brief §4.3, §6, §11.1).
//
// ⚠ PENDING CONFIRMATION (brief §11.1, a blocker): the final stage list is not
// confirmed. Labels and hues live in config/applicationStages.ts; this file
// only maps what the backend sends (stage.code, status code, lifecycle) onto
// those ids and onto the tracker steps. Components never hard-code stages:
// change the arrays below and every screen follows.

import { WORKFLOW } from "config/workflow.generated";
import { APPLICATION_PAGE_STEPS, getStage, type ApplicationStage, type ApplicationStageId, type TrackerStepConfig } from "config/applicationStages";

/** The steps the Application Details tracker shows: through Arrival and Commission,
 *  so the tracker doesn't read "complete" while the student is still arriving. */
export const APPLICATION_TRACKER_STEPS: readonly TrackerStepConfig[] = APPLICATION_PAGE_STEPS;

export interface StageMapping {
  /** Stage tag id in config/applicationStages.ts. */
  stageId: ApplicationStageId;
  /** Current tracker step id, or "done" when every tracker step is complete. */
  stepId: string | "done";
}

/** Backend stage code → stage tag + tracker step (codes from config/workflow.generated.ts). */
export const API_STAGE_MAP: Record<string, StageMapping> = {
  APPLICATION_REVIEW: { stageId: "documents-pending", stepId: "documents" },
  OFFER_LETTER: { stageId: "submitted", stepId: "submitted" },
  VISA_PROCESSING: { stageId: "visa-in-progress", stepId: "visa" },
  STUDENT_ARRIVAL_ENROLLMENT: { stageId: "arrival-logistics", stepId: "arrival" },
  PARTNER_COMMISSION_INVOICING: { stageId: "enrolled", stepId: "commission" },
};

// The backend's Offer Letter stage covers both the Institution's review and the
// offer itself, so the tracker step comes from the status inside it.
const OFFER: Partial<StageMapping> = { stageId: "offer-received", stepId: "offer" };
const AT_INSTITUTION: Partial<StageMapping> = { stageId: "institution-review", stepId: "submitted" };

/** Status codes that refine the stage tag or tracker step inside a backend stage. */
export const API_STATUS_STAGE_OVERRIDES: Record<string, Partial<StageMapping>> = {
  APPROVED: { stageId: "submitted", stepId: "submitted" },
  SENT_TO_UNIVERSITY: AT_INSTITUTION,
  UNI_REQ_CORRECTIONS: AT_INSTITUTION,
  PROGRAM_CHANGE_SUGGESTED: AT_INSTITUTION,
  REJECTED_BY_UNIVERSITY: AT_INSTITUTION,
  UNIVERSITY_APPROVED: OFFER,
  WAITING_FOR_PAYMENT: OFFER,
  PAYMENT_SUBMITTED: OFFER,
  PAYMENT_REJECTED: OFFER,
  PAYMENT_APPROVED: OFFER,
  OFFER_LETTER_FORMS_APPROVED: OFFER,
  APPLICATION_FORM_REJECTED: OFFER,
  APPLICATION_FORM_2_REJECTED: OFFER,
  HEALTH_DECLARATION_REJECTED: OFFER,
  SIGNED_OFFER_LETTER_REJECTED: OFFER,
  ENGLISH_FORM_REJECTED: OFFER,
  ENROLLMENT_VERIFIED: { stageId: "enrolled" },
  // Paid, but the Advisor still confirms receipt, so Commission stays the current step.
  COMMISSION_PAID: { stageId: "commission-paid" },
  APPLICATION_COMPLETE: { stageId: "commission-paid", stepId: "done" },
};

/** Statuses where the current step needs attention: a correction, rejection or re-upload. */
export const ATTENTION_STATUS_CODES: ReadonlySet<string> = new Set([
  "CORRECTION_REQUESTED",
  "REJECTED",
  "UNI_REQ_CORRECTIONS",
  "PROGRAM_CHANGE_SUGGESTED",
  "REJECTED_BY_UNIVERSITY",
  "PAYMENT_REJECTED",
  "APPLICATION_FORM_REJECTED",
  "APPLICATION_FORM_2_REJECTED",
  "HEALTH_DECLARATION_REJECTED",
  "SIGNED_OFFER_LETTER_REJECTED",
  "ENGLISH_FORM_REJECTED",
  "VISA_DOCUMENTS_REUPLOAD_REQUIRED",
  "IMMIGRATION_REQUESTED_DOCUMENTS",
  "EVAL_REUPLOAD_REQUIRED",
  "VISA_REJECTED",
  "E_VISA_REUPLOAD_REQUIRED",
  "ARRIVAL_EXTRA_DOCS_REUPLOAD",
  "ENROLLMENT_ISSUE",
  "DISPUTE_ISSUE_RECEIVED",
]);

/** lifecycle_status values that end the application. */
export const CLOSED_LIFECYCLES: Record<string, ApplicationStageId> = {
  cancel: "withdrawn",
  cancelled: "withdrawn",
  withdrawn: "withdrawn",
};

export interface ResolvedStage extends StageMapping {
  stage: ApplicationStage | undefined;
  attention: boolean;
}

/**
 * Pure: resolves the stage tag and tracker position for an application.
 * Unknown codes return undefined `stage` so callers can show the backend's own name.
 */
export function resolveStage(input: { stageCode?: string | null; statusCode?: string | null; lifecycle?: string | null }): ResolvedStage | null {
  const { stageCode, statusCode, lifecycle } = input;
  const closed = lifecycle ? CLOSED_LIFECYCLES[lifecycle] : undefined;
  const base = stageCode ? API_STAGE_MAP[stageCode] : undefined;
  if (!base && !closed) return null;
  const override = statusCode ? API_STATUS_STAGE_OVERRIDES[statusCode] : undefined;
  const mapping: StageMapping = { stageId: base?.stageId ?? "withdrawn", stepId: base?.stepId ?? "done", ...override };
  if (closed) mapping.stageId = closed;
  return { ...mapping, stage: getStage(mapping.stageId), attention: !!statusCode && ATTENTION_STATUS_CODES.has(statusCode) };
}

/** Lower-case words joined by underscores, so names and codes compare equal ("Offer Letter" ~ OFFER_LETTER). */
const key = (value: string) => value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

/** Backend stage code for a stage object; the detail response sends only the name. */
export function stageCodeOf(stage: { code?: string | null; name?: string | null } | null | undefined): string | undefined {
  if (!stage) return undefined;
  if (stage.code) return stage.code;
  const name = stage.name ? key(stage.name) : "";
  return WORKFLOW.find((s) => key(s.name) === name || key(s.code) === name)?.code;
}

/** Backend status code for a status object, looked up by name when the code is missing. */
export function statusCodeOf(status: { code?: string | null; name?: string | null } | null | undefined): string | undefined {
  if (!status) return undefined;
  if (status.code) return status.code;
  const name = status.name ? key(status.name) : "";
  for (const stage of WORKFLOW) {
    const match = stage.statuses.find((s) => key(s.name) === name || key(s.code) === name);
    if (match) return match.code;
  }
  return undefined;
}

/**
 * Statuses where the Advisor has to act next. The single rule behind the
 * "Action needed" tag, the pipeline flags and the Advisor Home work queue, so
 * every screen gives the same answer. Accepts a status code or name in any
 * case or spacing: the backend's names ("Correction Requested by Account
 * Manager") and its codes ("CORRECTION_REQUESTED") both match.
 */
// From the backend's allowed_actor (config/workflow.generated.ts): each Advisor
// status by code and by name, plus the name as the UI words it
// (University → Institution, Partner → Advisor).
const ADVISOR_ACTION_STATUSES: ReadonlySet<string> = new Set(
  WORKFLOW.flatMap((stage) => stage.statuses)
    .filter((status) => status.actor === "advisor")
    .flatMap((status) => {
      const name = key(status.name);
      return [key(status.code), name, name.replace(/university/g, "institution").replace(/partner/g, "advisor")];
    })
);


export function isAdvisorAction(status: string | null | undefined): boolean {
  return !!status && ADVISOR_ACTION_STATUSES.has(key(status));
}

// Staff (account manager, data entry, admin) statuses from the same allowed_actor,
// except Application Complete, where nobody has anything left to do.
const STAFF_ACTION_STATUSES: ReadonlySet<string> = new Set(
  WORKFLOW.flatMap((stage) => stage.statuses)
    .filter((status) => status.actor && status.actor !== "advisor" && status.code !== "APPLICATION_COMPLETE")
    .flatMap((status) => [key(status.code), key(status.name)])
);

/** Statuses where staff act next: the staff counterpart of isAdvisorAction, by code or name. */
export function isStaffAction(status: string | null | undefined): boolean {
  return !!status && STAFF_ACTION_STATUSES.has(key(status));
}

