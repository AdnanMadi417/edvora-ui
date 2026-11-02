// Pure mapping from the "get one application" response (ApplicationDetail,
// partly untyped) to the typed view the Application Details components take.
// No fetching and no React: data stays in the page/route, components get
// props. Unit-tested in applicationView.test.ts.

import type { FileRowState } from "components/ub/data/FileRow";
import type { ApplicationDetail } from "features/applications/shared/applicationTypes";
import type { ApplicationCommissionItem } from "features/applications/shared/commissionTypes";
import { resolveStage, type ResolvedStage } from "features/applications/stages";

/** Backend actor ids used in stage.statuses[].next_actions. */
export type ViewerActor = "2" | "3";

// ── Documents ────────────────────────────────────────────────────────────────

export type DocumentGroup = "application" | "payment" | "offer" | "visa" | "arrival" | "commission";

export interface DocumentItem {
  id: string;
  name: string;
  state: FileRowState;
  /** "In review" for uploaded files waiting on a reviewer. */
  stateLabel?: string;
  group: DocumentGroup;
  uploadedAt: string | null;
  reason: string | null;
  fileKey: string | null;
  fileUrl: string | null;
  /** Backend says this viewer may replace the file (can_manager_reupload); undefined when it doesn't say. */
  replaceable?: boolean;
}

/**
 * Pure: backend document status → FileRow state.
 * "1"/pending → Uploaded (in review) · "2"/approved → Verified · "3"/rejected → Needs replacing.
 * Uploading is client-side only (an upload in flight), so it never comes from the API.
 */
export function documentStateOf(status: unknown): { state: FileRowState; stateLabel?: string } {
  switch (String(status ?? "").toLowerCase()) {
    case "2":
    case "approved":
    case "verified":
      return { state: "verified" };
    case "3":
    case "rejected":
      return { state: "needs-replacing" };
    case "1":
    case "pending":
      return { state: "uploaded", stateLabel: "In review" };
    default:
      return { state: "uploaded" };
  }
}

/** Pure: "commission_invoice" → "Commission invoice"; display names pass through unchanged. */
export function documentName(raw: string | null | undefined): string {
  if (!raw) return "Document";
  if (!/_/.test(raw)) return raw;
  const words = raw.replace(/_/g, " ").trim().toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

function toDocument(raw: any, group: DocumentGroup): DocumentItem | null {
  if (!raw) return null;
  const { state, stateLabel } = documentStateOf(raw.status);
  return {
    id: String(raw.id ?? raw.file_key ?? raw.document_type),
    name: documentName(raw.document_type ?? raw.name),
    state,
    stateLabel,
    group,
    uploadedAt: raw.created_at ?? null,
    reason: state === "needs-replacing" ? raw.approve_notes ?? null : null,
    fileKey: raw.file_key ?? null,
    fileUrl: raw.file_url ?? null,
    replaceable: typeof raw.can_manager_reupload === "boolean" ? raw.can_manager_reupload : undefined,
  };
}

const list = (raws: unknown, group: DocumentGroup) => (Array.isArray(raws) ? raws.map((r) => toDocument(r, group)).filter(Boolean) as DocumentItem[] : []);

/** Templates the Unibexs System sends to the Advisor, not files the student provides. */
export const isTemplate = (d: DocumentItem) => /template|invoice/i.test(d.name);

// ── Commission ───────────────────────────────────────────────────────────────

/** Brief §6: Expected / Invoiced / Paid, plus Disputed while a dispute is open. */
export type CommissionState = "expected" | "invoiced" | "paid" | "disputed";

export const COMMISSION_STATES: Record<CommissionState, { label: string; tone: "neutral" | "info" | "success" | "attention" }> = {
  expected: { label: "Expected", tone: "neutral" },
  invoiced: { label: "Invoiced", tone: "info" },
  paid: { label: "Paid", tone: "success" },
  disputed: { label: "Disputed", tone: "attention" },
};

/** Pure: backend commission status (pending | approved | released | paid) → brief state. */
export function commissionStateOf(status: string | null | undefined, disputeOpen = false): CommissionState {
  if (disputeOpen) return "disputed";
  switch ((status ?? "").toLowerCase()) {
    case "paid":
      return "paid";
    case "approved":
    case "released":
      return "invoiced";
    default:
      return "expected";
  }
}

export interface CommissionView {
  state: CommissionState;
  amount: number | null;
  currency: string;
  type: string | null;
  expectedFrom: number | null;
  expectedTo: number | null;
  notes: string | null;
}

// ── Application ──────────────────────────────────────────────────────────────

export interface ApplicationView {
  id: string;
  /** Human reference (UBX-…) when the API provides one; otherwise null. */
  reference: string | null;
  lifecycle: string;
  student: {
    name: string;
    photoUrl: string | null;
    email: string | null;
    phone: string | null;
    nationality: string | null;
    passportNumber: string | null;
    birthday: string | null;
    gender: string | null;
    address: string | null;
    englishTests: { id: string; test: string; score: string; date: string | null }[];
    education: { id: string; institution: string; qualification: string; grade: string | null; endDate: string | null }[];
    emergencyContacts: { id: string; name: string; relation: string | null; phone: string | null }[];
  };
  programme: string | null;
  institution: string | null;
  qualificationLevel: string | null;
  intake: string | null;
  durationMonths: number | null;
  tuition: { amount: number; currency: string } | null;
  advisorName: string | null;
  submittedAt: string | null;
  updatedAt: string | null;
  arrivalDate: string | null;
  stage: {
    /** Backend names, shown when the code isn't in stages.ts. */
    apiName: string | null;
    statusName: string | null;
    statusCode: string | null;
    resolved: ResolvedStage | null;
  };
  /** The viewer's next action from the backend, e.g. "Upload the requested documents". */
  nextStep: string | null;
  documents: DocumentItem[];
  offerLetter: DocumentItem | null;
  visa: { evaluation: DocumentItem | null; visaLetter: DocumentItem | null; eVisaRequired: boolean };
  commission: CommissionView | null;
  /** Commission invoices/receipts plus the payout receipt (always shown as verified: it's finance's proof). */
  commissionDocuments: DocumentItem[];
}

const str = (v: unknown): string | null => (typeof v === "string" && v.trim() ? v : null);

/** Pure: maps the detail response for one viewer (Advisor "2" or admin/manager "3"). */
export function toApplicationView(a: ApplicationDetail & Record<string, any>, viewer: ViewerActor): ApplicationView {
  const s = a.student ?? {};
  const p = a.program ?? {};
  const status = a.stage?.statuses?.[0];
  const statusCode = str(a.status_code) ?? str(status?.code);
  const next = (status?.next_actions ?? []).find((n: any) => String(n.actor) === viewer);
  const commissions: ApplicationCommissionItem[] = a.commissions ?? [];
  const c = commissions[0];
  const disputeOpen = !!a.dispute && a.dispute.status !== "resolved";
  const tuitionAmount = Number(p.tuition_fee);

  return {
    id: a.id,
    reference: str(a.reference) ?? str(a.reference_id),
    lifecycle: a.lifecycle_status,
    student: {
      name: s.name ?? "Student",
      photoUrl: a.student_photo_file_url ?? s.photo_url ?? null,
      email: str(s.email),
      phone: str(s.phone),
      nationality: str(s.nationality),
      passportNumber: str(s.passport_number),
      birthday: str(s.birthday),
      gender: s.gender === true ? "Male" : s.gender === false ? "Female" : str(s.gender),
      address: str(s.current_address),
      englishTests: (s.english_proficiencies ?? []).map((e: any) => ({ id: String(e.id), test: e.test_type, score: String(e.score ?? ""), date: e.test_date ?? null })),
      education: (s.previous_educations ?? []).map((e: any) => ({ id: String(e.id), institution: e.institution_name, qualification: e.qualification, grade: e.grade ?? null, endDate: e.end_date ?? null })),
      emergencyContacts: (s.emergency_contacts ?? []).map((e: any) => ({ id: String(e.id), name: e.name, relation: e.relation ?? null, phone: e.phone ?? null })),
    },
    programme: str(p.name),
    institution: str(p.university?.name),
    qualificationLevel: str(p.qualification_level),
    intake: str(a.intake_date),
    durationMonths: typeof p.duration_months === "number" ? p.duration_months : null,
    tuition: Number.isFinite(tuitionAmount) && tuitionAmount > 0 ? { amount: tuitionAmount, currency: (p.currency ?? p.fee_currency ?? "RM").toUpperCase() } : null,
    advisorName: str(a.partner?.name),
    submittedAt: str(a.created_at),
    updatedAt: str(a.updated_at),
    arrivalDate: str(a.arrival_date),
    stage: {
      apiName: str(a.stage?.name),
      statusName: str(status?.name),
      statusCode,
      resolved: resolveStage({ stageCode: a.stage?.code, statusCode, lifecycle: a.lifecycle_status }),
    },
    nextStep: str(next?.name),
    documents: [...list(a.documents, "application"), ...list(a.payment_documents, "payment"), ...list(a.arrival_documents, "arrival")],
    offerLetter: toDocument(a.offer_letter_document, "offer"),
    visa: {
      evaluation: toDocument(a.emgs_evaluation_document, "visa"),
      visaLetter: toDocument(a.visa_document, "visa"),
      eVisaRequired: !!a.is_e_visa_required,
    },
    commission: c
      ? {
          state: commissionStateOf(c.status, disputeOpen),
          amount: c.amount,
          currency: (c.currency || "RM").toUpperCase(),
          type: c.commission_type,
          expectedFrom: c.expected_commission_from,
          expectedTo: c.expected_commission_to,
          notes: c.notes,
        }
      : null,
    commissionDocuments: [
      ...list(Object.values(a.commission_documents ?? {}).filter(Boolean), "commission"),
      ...(a.partner_payout?.receipt_file_key
        ? [toDocument({ id: `${a.partner_payout.id}-receipt`, file_key: a.partner_payout.receipt_file_key, document_type: "Payout receipt", status: "2", created_at: a.partner_payout.created_at }, "commission")!]
        : []),
    ],
  };
}
