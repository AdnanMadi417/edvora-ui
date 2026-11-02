// Pure: which single next action the Advisor sees as the Primary button
// (brief §4.1: one Primary per view). Same conditions the page used before,
// in priority order; the statuses are mutually exclusive in practice.

export type PartnerActionKey =
  | "reupload-form"
  | "required-docs"
  | "arrival-form"
  | "program-decision"
  | "visa-payment"
  | "accept-offer"
  | "confirm-arrival"
  | "evisa"
  | "payment-proof"
  | "emgs";

export interface PartnerActionInput {
  statusCode: string | null | undefined;
  /** Agency admin viewing a member's application: read only. */
  readOnly: boolean;
  /** The actions payload has loaded. */
  hasActions: boolean;
  /** actions.document_types includes one required for the current upload. */
  hasRequiredDocs: boolean;
  /** actions.document_types is non-empty. */
  hasDocumentTypes: boolean;
  hasOfferLetter: boolean;
  /** statusCode is one of REJECTED_FORM_CONFIG's keys. */
  isRejectedForm: boolean;
}

export const VISA_PAYMENT_CODES = new Set(["WAITING_FOR_PAYMENT", "PAYMENT_REJECTED"]);

export function partnerNextAction(i: PartnerActionInput): PartnerActionKey | null {
  if (i.readOnly) return null;
  const s = i.statusCode ?? "";
  if (i.isRejectedForm) return "reupload-form";
  if (i.hasActions) {
    if (s === "ARRIVAL_EXTRA_DOCS_UPLOAD") return "arrival-form";
    if (i.hasRequiredDocs) return "required-docs";
    if (s === "PROGRAM_CHANGE_SUGGESTED") return "program-decision";
  }
  if (VISA_PAYMENT_CODES.has(s)) return "visa-payment";
  if (s === "UNIVERSITY_APPROVED" && i.hasOfferLetter) return "accept-offer";
  if (s === "WAITING_PARTNER_CONFIRM_ARRIVAL_DATE") return "confirm-arrival";
  if (!i.hasRequiredDocs && s === "E_VISA_PARTNER_UPLOAD") return "evisa";
  if (s === "AWAITING_ARRIVAL" && !i.hasDocumentTypes) return "payment-proof";
  if (!i.hasRequiredDocs && (s === "EVAL_PARTNER_UPLOAD" || s === "EVAL_REUPLOAD_REQUIRED")) return "emgs";
  return null;
}
