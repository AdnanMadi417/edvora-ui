// One name per stage and one label per status, everywhere a person reads them:
// tags, lists, filters, the tracker, notifications, the activity feed and Home.
// Backend names and codes stay as they are (they are identifiers); this is the
// copy users see. Source: docs/unibexs-workflow-and-status-naming.md.
//
// Rules: say what is happening from the user's side; when it is the Advisor's
// turn, name the task; everything staff do is "Unibexs"; outside parties keep
// their own name (the university, EMGS); sentence case; one spelling
// (Advisor, university, program, enrollment).

import { WORKFLOW } from "./workflow.generated";

/** Backend stage code → stage name. */
export const STAGE_LABELS: Record<string, string> = {
  APPLICATION_REVIEW: "Unibexs review",
  OFFER_LETTER: "University and offer",
  VISA_PROCESSING: "Visa",
  STUDENT_ARRIVAL_ENROLLMENT: "Arrival and enrollment",
  PARTNER_COMMISSION_INVOICING: "Commission",
};

/** Backend status code → status label. */
export const STATUS_LABELS: Record<string, string> = {
  // Unibexs review
  NEW: "Waiting for Unibexs review",
  UNDER_REVIEW: "Under review by Unibexs",
  CORRECTION_REQUESTED: "Corrections requested by Unibexs",
  APPROVED: "Approved by Unibexs",
  REJECTED: "Rejected by Unibexs",
  // University and offer
  APPROVED_FROM_STAGE_1: "Unibexs preparing submission",
  SENT_TO_UNIVERSITY: "With the university",
  UNI_REQ_CORRECTIONS: "University needs documents",
  PROGRAM_CHANGE_SUGGESTED: "Program change suggested",
  UNIVERSITY_APPROVED: "Offer received",
  WAITING_FOR_PAYMENT: "Visa fee to pay",
  PAYMENT_SUBMITTED: "Payment under review by Unibexs",
  PAYMENT_APPROVED: "Payment approved by Unibexs",
  OFFER_LETTER_FORMS_APPROVED: "Offer forms approved by Unibexs",
  APPLICATION_FORM_REJECTED: "Application form to fix",
  APPLICATION_FORM_2_REJECTED: "Application form 2 to fix",
  HEALTH_DECLARATION_REJECTED: "Health declaration to fix",
  SIGNED_OFFER_LETTER_REJECTED: "Signed offer letter to fix",
  ENGLISH_FORM_REJECTED: "English form to fix",
  PAYMENT_REJECTED: "Payment receipt to fix",
  REJECTED_BY_UNIVERSITY: "Rejected by the university",
  // Visa
  VISA_DOCUMENTS_UNDER_REVIEW: "Visa documents under review by Unibexs",
  VISA_DOCUMENTS_REUPLOAD_REQUIRED: "Visa documents to fix",
  SUBMIT_TO_EMGS: "Submitted to EMGS by Unibexs",
  IMMIGRATION_REQUESTED_DOCUMENTS: "EMGS needs documents",
  EVAL_READY: "eVAL to upload",
  EVAL_PARTNER_UPLOAD: "eVAL to upload",
  EVAL_UNDER_REVIEW: "eVAL under review by Unibexs",
  EVAL_REUPLOAD_REQUIRED: "eVAL to fix",
  EVAL_APPROVED: "eVAL approved by Unibexs",
  VISA_REJECTED: "Visa rejected",
  // Arrival and enrolment
  WAITING_PARTNER_CONFIRM_ARRIVAL_DATE: "Arrival date to confirm",
  AWAITING_ARRIVAL: "Student travelling",
  E_VISA_REQUIRED: "e-Visa to upload",
  E_VISA_PARTNER_UPLOAD: "e-Visa to upload",
  E_VISA_UNDER_REVIEW: "e-Visa under review by Unibexs",
  E_VISA_REUPLOAD_REQUIRED: "e-Visa to fix",
  E_VISA_APPROVED: "e-Visa approved by Unibexs",
  ARRIVAL_CONFIRMED: "Arrived, Unibexs checking enrollment",
  ARRIVAL_EXTRA_DOCS_REQUIRED: "Arrival documents to upload",
  ARRIVAL_EXTRA_DOCS_UPLOAD: "Arrival documents to upload",
  ARRIVAL_EXTRA_DOCS_UNDER_REVIEW: "Arrival documents under review by Unibexs",
  ARRIVAL_EXTRA_DOCS_REUPLOAD: "Arrival documents to fix",
  ARRIVAL_EXTRA_DOCS_APPROVED: "Arrival documents approved by Unibexs",
  ENROLLMENT_VERIFIED: "Enrollment verified by Unibexs",
  ENROLLMENT_ISSUE: "Enrollment proof needed",
  // Commission
  AWAITING_COMMISSION: "Invoiced to the university",
  COMMISSION_READY: "Commission being paid by Unibexs",
  COMMISSION_PAID: "Commission to confirm",
  DISPUTE_ISSUE_RECEIVED: "Dispute under review by Unibexs",
  DISPUTE_RESPONSE_RECEIVED: "Dispute reply to review",
  APPLICATION_COMPLETE: "Complete",
};

/** Statuses the system moves on from at once; they share the label of where they land,
 *  so filters leave them out (nothing ever waits in them). */
export const PASS_THROUGH_STATUS_CODES: ReadonlySet<string> = new Set([
  "EVAL_READY",
  "E_VISA_REQUIRED",
  "ARRIVAL_EXTRA_DOCS_REQUIRED",
]);

/** Status options for a filter: one per label, pass-through statuses left out. */
export function statusFilterOptions<T extends { id: string; name: string; code?: string | null }>(statuses: T[]): { label: string; value: string }[] {
  return statuses
    .filter((s) => !PASS_THROUGH_STATUS_CODES.has(STATUS_BY_KEY.get(key(s.code ?? s.name)) ?? ""))
    .map((s) => ({ label: statusLabel(s.code ?? s.name), value: s.id }));
}

/** Lower-case words joined by underscores, so names and codes compare equal ("Offer Letter" ~ OFFER_LETTER). */
const key = (value: string) => value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");

const STAGE_BY_KEY = new Map<string, string>();
const STATUS_BY_KEY = new Map<string, string>();
for (const stage of WORKFLOW) {
  STAGE_BY_KEY.set(key(stage.code), stage.code);
  STAGE_BY_KEY.set(key(stage.name), stage.code);
  for (const status of stage.statuses) {
    STATUS_BY_KEY.set(key(status.code), status.code);
    STATUS_BY_KEY.set(key(status.name), status.code);
  }
}

/** Stage name for a backend stage code or name; unknown values come back unchanged. */
export function stageLabel(codeOrName: string | null | undefined): string {
  if (!codeOrName) return "";
  const code = STAGE_BY_KEY.get(key(codeOrName));
  return (code && STAGE_LABELS[code]) || codeOrName;
}

/** Status label for a backend status code or name; unknown values come back unchanged. */
export function statusLabel(codeOrName: string | null | undefined): string {
  if (!codeOrName) return "";
  const code = STATUS_BY_KEY.get(key(codeOrName));
  return (code && STATUS_LABELS[code]) || codeOrName;
}

// Backend names inside sentences ("moved the application to Correction Requested by
// Account Manager"), longest first so a shorter name never matches inside a longer one.
const NAME_SWAPS: [RegExp, string][] = (() => {
  const pairs: [string, string][] = [];
  for (const stage of WORKFLOW) {
    pairs.push([stage.name, STAGE_LABELS[stage.code] ?? stage.name]);
    for (const status of stage.statuses) pairs.push([status.name, STATUS_LABELS[status.code] ?? status.name]);
  }
  return pairs
    .filter(([name, label]) => name && name !== label)
    .sort((a, b) => b[0].length - a[0].length)
    .map(([name, label]) => [new RegExp(`(?<![\\w-])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\w-])`, "g"), label]);
})();

/** Free text (notification titles and bodies, Home items) with backend stage and status names swapped for their labels. */
export function relabelText(text: string | null | undefined): string {
  if (!text) return text ?? "";
  return NAME_SWAPS.reduce((out, [pattern, label]) => out.replace(pattern, label), text);
}
