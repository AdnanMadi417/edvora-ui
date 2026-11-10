// Application stages for the Application Details screens (brief §4.3, §6, §11.1).
//
// ⚠ PENDING CONFIRMATION (brief §11.1, a blocker): the final stage list is not
// confirmed. Labels and hues live in config/applicationStages.ts; this file
// only maps what the backend sends (stage.code, status code, lifecycle) onto
// those ids and onto the tracker steps. Components never hard-code stages:
// change the arrays below and every screen follows.

import { getStage, STUDENT_PROFILE_STEPS, type ApplicationStage, type ApplicationStageId, type TrackerStepConfig } from "config/applicationStages";

/** The steps the Application Details tracker shows (brief §6: 5-step Student profile tracker). */
export const APPLICATION_TRACKER_STEPS: readonly TrackerStepConfig[] = STUDENT_PROFILE_STEPS;

export interface StageMapping {
  /** Stage tag id in config/applicationStages.ts. */
  stageId: ApplicationStageId;
  /** Current tracker step id, or "done" when every tracker step is complete. */
  stepId: string | "done";
}

/** Backend stage.code → stage tag + tracker step. */
export const API_STAGE_MAP: Record<string, StageMapping> = {
  APPLICATION_SUBMISSION: { stageId: "documents-pending", stepId: "documents" },
  INSTITUTION_REVIEW: { stageId: "institution-review", stepId: "submitted" },
  OFFER_AND_VISA_PAYMENT: { stageId: "offer-received", stepId: "offer" },
  VISA_PROCESSING: { stageId: "visa-in-progress", stepId: "visa" },
  ARRIVAL_AND_ENROLLMENT: { stageId: "arrival-logistics", stepId: "done" },
  PARTNER_COMMISSION_INVOICING: { stageId: "enrolled", stepId: "done" },
};

/** Status codes that refine the stage tag inside a backend stage. */
export const API_STATUS_STAGE_OVERRIDES: Record<string, Partial<StageMapping>> = {
  SUBMITTED_TO_INSTITUTION: { stageId: "submitted" },
  UNIVERSITY_APPROVED: { stageId: "offer-received", stepId: "offer" },
  STUDENT_ENROLLED: { stageId: "enrolled" },
  COMMISSION_PAID: { stageId: "commission-paid" },
  APPLICATION_COMPLETE: { stageId: "commission-paid" },
};

/** Statuses where the current step needs attention: a correction, rejection or re-upload. */
export const ATTENTION_STATUS_CODES: ReadonlySet<string> = new Set([
  "CORRECTION_REQUESTED",
  "PROGRAM_CHANGE_SUGGESTED",
  "UNIVERSITY_REJECTED",
  "PAYMENT_REJECTED",
  "APPLICATION_FORM_REJECTED",
  "APPLICATION_FORM_2_REJECTED",
  "HEALTH_DECLARATION_REJECTED",
  "SIGNED_OFFER_LETTER_REJECTED",
  "ENGLISH_FORM_REJECTED",
  "EVAL_REUPLOAD_REQUIRED",
  "COMMISSION_DISPUTED",
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

/**
 * Statuses where the Advisor has to act next. The single rule behind the
 * "Action needed" tag, the pipeline flags and the Advisor Home work queue, so
 * every screen gives the same answer. Accepts a status code or name in any
 * case or spacing: the backend's names ("Correction Requested by Account
 * Manager") and its codes ("CORRECTION_REQUESTED") both match.
 */
const ADVISOR_ACTION_STATUSES: ReadonlySet<string> = new Set([
  // Backend status names
  "correction_requested_by_account_manager",
  "university_requested_corrections",
  "program_change_suggested",
  "waiting_for_payment",
  "payment_rejected",
  "waiting_partner_to_confirm_arrival_date",
  "upload_emgs_eval",
  "eval_re_upload_required",
  "upload_e_visa",
  "e_visa_re_upload_required",
  "upload_visa_stage_documents",
  "visa_documents_re_upload_required",
  "upload_extra_arrival_documents",
  "extra_arrival_documents_re_upload_required",
  "commission_ready",
  // Status codes and the display names that go with them
  "correction_requested",
  "application_form_rejected",
  "health_declaration_rejected",
  "eval_partner_upload",
  "waiting_for_emgs_eval_upload",
  "eval_reupload_required",
  "e_visa_partner_upload",
  "waiting_for_e_visa_upload",
  "waiting_partner_confirm_arrival_date",
  "waiting_for_arrival_date",
  "arrival_extra_docs_upload",
  "extra_arrival_documents_required",
  // The same statuses as the UI words them (University → Institution, Partner → Advisor)
  "institution_requested_corrections",
  "waiting_advisor_to_confirm_arrival_date",
  "immigration_requested_documents",
]);

const normalizeStatus = (value: string) => value.trim().toLowerCase().replace(/[\s-]+/g, "_");

export function isAdvisorAction(status: string | null | undefined): boolean {
  return !!status && ADVISOR_ACTION_STATUSES.has(normalizeStatus(status));
}
