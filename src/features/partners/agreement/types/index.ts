// Partner agreement e-signature — GET/POST /partners/{partner_id}/agreement.
// DocuSeal emails the signing link directly to the partner; there's no
// in-app "sign now" link to surface (backend would need to start returning
// the submitter URL for that to exist).

export type AgreementStatus = "sent" | "partner_signed" | "completed" | "declined" | "expired";

export interface PartnerAgreement {
  id: string;
  status: AgreementStatus;
  docuseal_submission_id?: string;
  sent_at: string;
  partner_signed_at: string | null;
  completed_at: string | null;
  file_key: string | null;
  file_url: string | null;
}
