// Application workflow + in-memory application records for the mock API.
// Stages and statuses come from the backend's workflow (config/workflow.generated.ts),
// so the demo uses the same codes and names as the real API.

import { daysAgo, daysFromNow, nowIso, pick, placeholderImage, SAMPLE_PDF_URL, table } from "../db";
import { APPLICATIONS, CURRENT_PARTNER, PROGRAMS, UNIVERSITIES } from "../seed";
import { DOCUMENT_TYPES, documentTypeByCode } from "./documentTypes";
import { universityPaymentMethods } from "./universities";
import { WORKFLOW } from "config/workflow.generated";

// ---------------------------------------------------------------------------
// Stages & statuses
// ---------------------------------------------------------------------------

type StatusDef = {
  code: string;
  name: string;
  /** Next action shown to the Advisor (actor "2") and the manager/admin (actor "3"). */
  partner: string;
  manager: string;
  reason?: boolean;
  docs?: boolean;
  advance?: boolean;
};

// Built from the backend's own workflow (config/workflow.generated.ts), so the
// mock API returns the same stage codes, status codes, names and next actions.
const PIPELINE: { code: string; name: string; statuses: StatusDef[] }[] = WORKFLOW.map((stage) => ({
  code: stage.code,
  name: stage.name,
  statuses: stage.statuses.map((st) => ({
    code: st.code,
    name: st.name,
    partner: st.advisorAction ?? st.note ?? "No action needed",
    manager: st.managerAction ?? st.note ?? "No action needed",
    reason: st.requiresReason,
    docs: st.requiresDocuments,
    advance: st.advancesStage,
  })),
}));

export const STAGES = PIPELINE.map((s, i) => ({
  id: `stage_${String(i + 1).padStart(2, "0")}`,
  name: s.name,
  code: s.code,
  order_index: i + 1,
}));

let statusN = 0;
export const STATUSES = PIPELINE.flatMap((s, i) =>
  s.statuses.map((st) => ({
    id: `sts_${String(++statusN).padStart(3, "0")}`,
    stage_id: STAGES[i].id,
    stageIndex: i,
    globalIndex: statusN,
    ...st,
  })),
);
export type Status = (typeof STATUSES)[number];

export const statusByCode = (code: string) => STATUSES.find((s) => s.code === code)!;
export const statusById = (id: string) => STATUSES.find((s) => s.id === id);

/** GET /applications/stage-statuses row. */
export const toStageStatus = (s: Status) => ({
  id: s.id,
  name: s.name,
  code: s.code,
  stage_id: s.stage_id,
  is_requires_reason: !!s.reason,
  is_requires_document_selection: !!s.docs,
  is_triggers_stage_advance: !!s.advance,
});

/** The usual route through the backend workflow, for building a believable history. */
const HAPPY_PATH = [
  "NEW", "UNDER_REVIEW", "APPROVED", "APPROVED_FROM_STAGE_1", "SENT_TO_UNIVERSITY", "UNIVERSITY_APPROVED",
  "WAITING_FOR_PAYMENT", "PAYMENT_SUBMITTED", "PAYMENT_APPROVED", "OFFER_LETTER_FORMS_APPROVED",
  "VISA_DOCUMENTS_UNDER_REVIEW", "SUBMIT_TO_EMGS", "EVAL_READY", "EVAL_PARTNER_UPLOAD", "EVAL_UNDER_REVIEW", "EVAL_APPROVED",
  "WAITING_PARTNER_CONFIRM_ARRIVAL_DATE", "AWAITING_ARRIVAL", "E_VISA_REQUIRED", "E_VISA_PARTNER_UPLOAD",
  "E_VISA_UNDER_REVIEW", "E_VISA_APPROVED", "ARRIVAL_CONFIRMED", "ENROLLMENT_VERIFIED",
  "AWAITING_COMMISSION", "COMMISSION_READY", "COMMISSION_PAID", "APPLICATION_COMPLETE",
];

/** Side branches: the status each one is reached from. */
const PREV: Record<string, string> = {
  CORRECTION_REQUESTED: "UNDER_REVIEW",
  REJECTED: "UNDER_REVIEW",
  UNI_REQ_CORRECTIONS: "SENT_TO_UNIVERSITY",
  PROGRAM_CHANGE_SUGGESTED: "SENT_TO_UNIVERSITY",
  REJECTED_BY_UNIVERSITY: "SENT_TO_UNIVERSITY",
  PAYMENT_REJECTED: "PAYMENT_SUBMITTED",
  APPLICATION_FORM_REJECTED: "PAYMENT_APPROVED",
  APPLICATION_FORM_2_REJECTED: "PAYMENT_APPROVED",
  HEALTH_DECLARATION_REJECTED: "PAYMENT_APPROVED",
  SIGNED_OFFER_LETTER_REJECTED: "PAYMENT_APPROVED",
  ENGLISH_FORM_REJECTED: "PAYMENT_APPROVED",
  VISA_DOCUMENTS_REUPLOAD_REQUIRED: "VISA_DOCUMENTS_UNDER_REVIEW",
  IMMIGRATION_REQUESTED_DOCUMENTS: "SUBMIT_TO_EMGS",
  VISA_REJECTED: "SUBMIT_TO_EMGS",
  EVAL_REUPLOAD_REQUIRED: "EVAL_UNDER_REVIEW",
  E_VISA_REUPLOAD_REQUIRED: "E_VISA_UNDER_REVIEW",
  ARRIVAL_EXTRA_DOCS_REQUIRED: "AWAITING_ARRIVAL",
  ARRIVAL_EXTRA_DOCS_UPLOAD: "ARRIVAL_EXTRA_DOCS_REQUIRED",
  ARRIVAL_EXTRA_DOCS_UNDER_REVIEW: "ARRIVAL_EXTRA_DOCS_UPLOAD",
  ARRIVAL_EXTRA_DOCS_REUPLOAD: "ARRIVAL_EXTRA_DOCS_UNDER_REVIEW",
  ARRIVAL_EXTRA_DOCS_APPROVED: "ARRIVAL_EXTRA_DOCS_UNDER_REVIEW",
  ENROLLMENT_ISSUE: "ARRIVAL_CONFIRMED",
  DISPUTE_ISSUE_RECEIVED: "COMMISSION_PAID",
  DISPUTE_RESPONSE_RECEIVED: "DISPUTE_ISSUE_RECEIVED",
};

/** Where a manager/admin can move an application from each status: the backend's
 *  own transitions, plus the next step on the usual route where it lists none. */
const NEXT: Record<string, string[]> = Object.fromEntries(
  WORKFLOW.flatMap((stage) => stage.statuses).map((st) => {
    const i = HAPPY_PATH.indexOf(st.code);
    const onward = i >= 0 && i < HAPPY_PATH.length - 1 ? [HAPPY_PATH[i + 1]] : [];
    return [st.code, st.managerNext.length ? st.managerNext : onward];
  }),
);
export const nextStatuses = (code: string) => (NEXT[code] ?? []).map(statusByCode);

export function pathTo(code: string, depth = 0): string[] {
  const i = HAPPY_PATH.indexOf(code);
  if (i >= 0) return HAPPY_PATH.slice(0, i + 1);
  if (depth > 6) return ["NEW", code];
  // Side branches: walk to the status's predecessor, preferring the happy path.
  const keys = Object.keys(NEXT).filter((k) => k !== code && NEXT[k].includes(code));
  const prev = PREV[code] ?? keys.find((k) => HAPPY_PATH.includes(k)) ?? keys[0] ?? "NEW";
  return [...pathTo(prev, depth + 1), code];
}

/** Has the application passed through `code` on its route to the current status? */
export const reached = (current: string, code: string) => pathTo(current).includes(code);

// ---------------------------------------------------------------------------
// Document types used by application uploads and correction requests
// ---------------------------------------------------------------------------

// The subset of the shared document-type catalogue (documentTypes.ts) that
// application uploads and correction requests use. Ids are the catalogue's,
// so GET /document-types and application documents agree.
const APP_DOC_CODES = [
  "passport", "academic_transcript", "academic_certificate", "passport_photo", "english_proficiency",
  "bank_statement", "arrival_form", "travel_insurance",
] as const;
export const APP_DOCUMENT_TYPES = APP_DOC_CODES.map((code) => {
  const d = documentTypeByCode(code);
  return { id: d.id, type: d.type, code: d.code, description: d.description, is_init_app_doc: d.is_init_app_doc, is_required_init_app_doc: d.is_required_init_app_doc };
});
/** Catalogue id for a document-type code, e.g. dt("passport"). */
export const dt = (code: string) => documentTypeByCode(code).id;
const docTypeById = (id: string) => DOCUMENT_TYPES.find(id);
export const docTypeRef = (id: string) => {
  const d = docTypeById(id);
  return { id, type: d?.type ?? null, code: d?.code ?? null };
};

// ---------------------------------------------------------------------------
// Application records
// ---------------------------------------------------------------------------

export type Doc = {
  id: string;
  file_key: string;
  file_url: string;
  status: string; // "1" pending, "2" approved, "3" rejected
  approve_notes: string | null;
  created_at: string;
  document_type_id: string | null;
  document_type: string;
};

export type TimelineEntry = {
  id: string;
  application_id: string;
  entry_type: string;
  actor_id: string | null;
  actor_name: string | null;
  from_stage: string | null;
  from_status: string | null;
  to_stage: string | null;
  to_status: string | null;
  reason_text: string | null;
  notes: string | null;
  detail: Record<string, unknown> | null;
  required_document_types: { id: string; type: string | null; code: string | null }[] | null;
  requested_document_types: { id: string; type: string | null; code: string | null }[] | null;
  uploaded_document_types: { id: string; type: string | null; code: string | null }[] | null;
  created_at: string;
};

export type AppRecord = {
  id: string;
  partnerId: string;
  partnerName: string;
  accountManagerName: string;
  student: any;
  programId: string;
  statusCode: string;
  lifecycle: "active" | "hold" | "cancel";
  intake_date: string;
  arrival_date: string | null;
  correction_reason: string | null;
  requested_doc_type_ids: string[];
  forms: {
    application_form: boolean;
    application_form_2: boolean;
    health_declaration: boolean;
    signed_offer_letter: boolean;
    english_form: boolean;
  };
  visa_fee_amount: number;
  /** Uploads made during the session, merged on top of the derived documents. */
  extraDocs: Doc[];
  extraPaymentDocs: Doc[];
  extraArrivalDocs: Doc[];
  overrides: Partial<Record<"offer_letter_document" | "visa_document" | "emgs_evaluation_document", Doc>>;
  commissionDocs: Record<string, Doc>;
  visaPayments: any[];
  /** Set once the seeded visa payments have been copied into visaPayments. */
  visaPaymentsSeeded?: boolean;
  visaCaseOverride: any | null;
  timeline: TimelineEntry[];
  new_notifications_count: number;
  created_at: string;
  updated_at: string;
};

const SEED_STATUSES = [
  "CORRECTION_REQUESTED", "NEW", "UNDER_REVIEW", "PROGRAM_CHANGE_SUGGESTED",
  "SENT_TO_UNIVERSITY", "UNIVERSITY_APPROVED", "WAITING_FOR_PAYMENT", "PAYMENT_SUBMITTED",
  "PAYMENT_REJECTED", "EVAL_PARTNER_UPLOAD", "EVAL_UNDER_REVIEW", "E_VISA_PARTNER_UPLOAD",
  "WAITING_PARTNER_CONFIRM_ARRIVAL_DATE", "E_VISA_UNDER_REVIEW", "EVAL_APPROVED", "ARRIVAL_EXTRA_DOCS_UPLOAD",
  "AWAITING_ARRIVAL", "ENROLLMENT_VERIFIED", "COMMISSION_PAID", "COMMISSION_READY",
  "DISPUTE_ISSUE_RECEIVED", "APPLICATION_COMPLETE", "NEW", "REJECTED_BY_UNIVERSITY",
];

const ADDRESSES = [
  "12 Adeola Odeku Street, Victoria Island, Lagos",
  "House 45, Road 11, Banani, Dhaka",
  "Flat 3B, Gulberg III, Lahore",
  "17 El-Tahrir Street, Dokki, Giza",
  "Jl. Kemang Raya No. 8, Jakarta Selatan",
  "Hadda Street, Sana'a",
  "Block 9, Riyadh District, Khartoum",
  "Ngong Road, Kilimani, Nairobi",
];
const SCHOOLS = [
  "King's College Lagos", "Notre Dame College Dhaka", "Lahore Grammar School", "Cairo American College",
  "SMA Negeri 8 Jakarta", "Sana'a International School", "Khartoum International Community School", "Alliance High School Nairobi",
];
const RELATIONS = ["Father", "Mother", "Uncle", "Elder Brother", "Sister"];
const TESTS: [string, string][] = [["IELTS", "6.5"], ["TOEFL", "88"], ["PTE Academic", "62"], ["IELTS", "6.0"], ["MUET", "Band 4"]];

const CORRECTION_REASONS: Record<string, string> = {
  CORRECTION_REQUESTED: "The academic transcript is not certified. Please upload a certified true copy.",
  PROGRAM_CHANGE_SUGGESTED: "The Institution recommends the Foundation programme first, as the applicant's results are below the direct-entry requirement.",
  PAYMENT_REJECTED: "The payment receipt amount does not match the visa fee. Please upload the full bank transfer slip.",
  UNIVERSITY_REJECTED: "The applicant does not meet the minimum entry requirements for this programme.",
};

/** Program detail object the detail views read (program.university.name, etc.). */
export function programDetail(programId: string) {
  const p = PROGRAMS.find((x) => x.id === programId) ?? PROGRAMS[0];
  const u = UNIVERSITIES.find((x) => x.id === p.university_id)!;
  const isPg = p.level === "Master" || p.level === "PhD";
  return {
    id: p.id,
    name: p.name,
    qualification_level: p.level === "PhD" ? "Doctoral Degree (PhD)" : p.level === "Master" ? "Master's Degree" : p.level === "Bachelor" ? "Bachelor's Degree" : p.level,
    course_type: isPg ? (p.level === "PhD" ? "research" : "course_work") : null,
    duration_months: p.duration_months,
    tuition_fee: p.tuition_fee,
    currency: "RM",
    university: { id: u.id, name: u.name, country: u.country, city: u.city, logo_url: u.logo_url },
  };
}

function studentDetail(i: number) {
  const s = APPLICATIONS[i].student;
  const [test, score] = pick(TESTS, i);
  return {
    id: s.id,
    name: s.name,
    birthday: s.date_of_birth,
    nationality: s.nationality,
    passport_number: s.passport_number,
    email: s.email,
    phone: s.phone,
    current_address: pick(ADDRESSES, i),
    gender: s.gender === "male",
    photo_file_key: `students/photos/${s.id}.png`,
    photo_url: s.photo_url,
    emergency_contacts: [
      {
        id: `ec_${s.id}`,
        name: `${pick(["Ibrahim", "Fatima", "Abdul", "Grace", "Hassan"], i)} ${s.last_name}`,
        relation: pick(RELATIONS, i),
        phone: `+${230 + i} 80 ${4100000 + i * 977}`,
        email: `family.${s.last_name.toLowerCase()}@mail.com`,
      },
    ],
    english_proficiencies: [{ id: `ep_${s.id}`, test_type: test, score, test_date: `2026-0${(i % 8) + 1}-15` }],
    previous_educations: [
      {
        id: `pe_${s.id}`,
        institution_name: pick(SCHOOLS, i),
        qualification: pick(["High School Diploma", "A-Levels", "WAEC SSCE", "HSC", "Bachelor's Degree"], i),
        start_date: `${2018 + (i % 4)}-09-01`,
        end_date: `${2021 + (i % 4)}-06-30`,
        grade: pick(["3.6 / 4.0", "A A B", "82%", "GPA 5.00", "First Class"], i),
      },
    ],
  };
}

export const applications = table<AppRecord>(
  APPLICATIONS.map((a, i) => {
    const statusCode = SEED_STATUSES[i];
    const created = a.created_at;
    return {
      id: a.id,
      partnerId: a.partner.id,
      partnerName: a.partner.name,
      accountManagerName: a.account_manager.name,
      student: studentDetail(i),
      programId: a.program.id,
      statusCode,
      lifecycle: i === 22 || i === 8 ? "hold" : i === 23 ? "cancel" : "active",
      intake_date: pick(["2027-01-01", "2027-05-01", "2026-09-01"], i),
      arrival_date: reached(statusCode, "ARRIVAL_CONFIRMED") ? daysAgo(20 - (i % 10)) : statusCode === "AWAITING_ARRIVAL" ? daysFromNow(6) : null,
      correction_reason: CORRECTION_REASONS[statusCode] ?? null,
      requested_doc_type_ids: statusCode === "CORRECTION_REQUESTED" ? [dt("academic_transcript")] : statusCode === "ARRIVAL_EXTRA_DOCS_UPLOAD" ? [dt("arrival_form"), dt("travel_insurance")] : [],
      forms: {
        application_form: true,
        application_form_2: i % 4 === 0,
        health_declaration: i % 2 === 0,
        signed_offer_letter: i % 3 === 0,
        english_form: i % 5 === 0,
      },
      visa_fee_amount: 2450 + (i % 4) * 150,
      extraDocs: [],
      extraPaymentDocs: [],
      extraArrivalDocs: [],
      overrides: {},
      commissionDocs: {},
      visaPayments: [],
      visaCaseOverride: null,
      timeline: [],
      new_notifications_count: i % 4 === 0 ? (i % 3) + 1 : 0,
      created_at: created,
      updated_at: a.updated_at,
    };
  }),
);

// ---------------------------------------------------------------------------
// Derived pieces of the detail response
// ---------------------------------------------------------------------------

const fileKey = (appId: string, name: string) => `applications/${appId}/${name}.pdf`;

const doc = (app: AppRecord, name: string, type: string, status: string, created: string, typeId: string | null = null, notes: string | null = null): Doc => ({
  id: `${app.id}_${name}`,
  file_key: fileKey(app.id, name),
  file_url: SAMPLE_PDF_URL,
  status,
  approve_notes: notes,
  created_at: created,
  document_type_id: typeId,
  document_type: type,
});

/** Day offset of a status along the application's route (for timestamps). */
export function stepDate(app: AppRecord, code: string) {
  const route = pathTo(app.statusCode);
  const idx = Math.max(0, route.indexOf(code));
  const start = (Date.parse(daysAgo(0)) - Date.parse(app.created_at)) / 86400000;
  const per = start / Math.max(route.length, 1);
  return daysAgo(Math.max(0, start - idx * per));
}

export function documentsFor(app: AppRecord): Doc[] {
  const s = app.statusCode;
  const fresh = s === "NEW";
  const base: Doc[] = [
    doc(app, "passport", "Passport", fresh ? "1" : "2", app.created_at, dt("passport")),
    doc(app, "academic_transcript", "Academic Transcript", s === "CORRECTION_REQUESTED" ? "3" : fresh ? "1" : "2", app.created_at, dt("academic_transcript"), s === "CORRECTION_REQUESTED" ? "Not certified — please upload a certified true copy." : null),
    doc(app, "academic_certificate", "Academic Certificate", fresh ? "1" : "2", app.created_at, dt("academic_certificate")),
    doc(app, "passport_photo", "Passport Photo", fresh ? "1" : "2", app.created_at, dt("passport_photo")),
    doc(app, "english_certificate", "English Proficiency Certificate", fresh ? "1" : "2", app.created_at, dt("english_proficiency")),
  ];
  if (s === "UNDER_REVIEW") {
    base.push(doc(app, "academic_transcript_v2", "Academic Transcript", "1", stepDate(app, s), dt("academic_transcript")));
  }
  if (reached(s, "UNIVERSITY_APPROVED") && s !== "REJECTED_BY_UNIVERSITY") {
    const at = stepDate(app, "UNIVERSITY_APPROVED");
    base.push(doc(app, "application_form_template", "Application Form Template", "2", at, dt("application_form")));
    if (app.forms.application_form_2) base.push(doc(app, "application_form_2_template", "Application Form 2 Template", "2", at));
    if (app.forms.english_form) base.push(doc(app, "english_form_template", "English Form Template", "2", at, dt("english_form")));
  }
  if (reached(s, "WAITING_FOR_PAYMENT")) {
    base.push(doc(app, "visa_invoice", "Visa Invoice", "2", stepDate(app, "WAITING_FOR_PAYMENT"), dt("visa_invoice")));
  }
  return [...base, ...app.extraDocs];
}

export function paymentDocumentsFor(app: AppRecord): Doc[] {
  const s = app.statusCode;
  if (!reached(s, "PAYMENT_SUBMITTED")) return app.extraPaymentDocs;
  const status = s === "PAYMENT_SUBMITTED" ? "1" : s === "PAYMENT_REJECTED" ? "3" : "2";
  const at = stepDate(app, "PAYMENT_SUBMITTED");
  const docs = [
    doc(app, "visa_payment_receipt", "Visa Payment Receipt", status, at, dt("visa_payment_receipt"), s === "PAYMENT_REJECTED" ? CORRECTION_REASONS.PAYMENT_REJECTED : null),
    doc(app, "application_form", "Application Form", s === "PAYMENT_SUBMITTED" ? "1" : "2", at, dt("application_form")),
  ];
  if (app.forms.health_declaration) docs.push(doc(app, "health_declaration_form", "Health Declaration Form", s === "PAYMENT_SUBMITTED" ? "1" : "2", at, dt("health_declaration_form")));
  return [...docs, ...app.extraPaymentDocs];
}

export function arrivalDocumentsFor(app: AppRecord): Doc[] {
  const s = app.statusCode;
  const docs: Doc[] = [];
  if (reached(s, "ARRIVAL_CONFIRMED")) {
    docs.push(doc(app, "flight_ticket", "Flight Ticket", "2", stepDate(app, "ARRIVAL_CONFIRMED"), dt("flight_ticket")));
  }
  if (reached(s, "E_VISA_UNDER_REVIEW")) {
    docs.push(doc(app, "e_visa", "E-Visa", "2", stepDate(app, "E_VISA_UNDER_REVIEW"), dt("e_visa")));
  }
  if (reached(s, "ARRIVAL_EXTRA_DOCS_UPLOAD")) {
    docs.push(doc(app, "arrival_form_template", "Arrival Form Template", "2", stepDate(app, "AWAITING_ARRIVAL"), dt("arrival_form")));
  }
  return [...docs, ...app.extraArrivalDocs];
}

export function offerLetterFor(app: AppRecord): Doc | null {
  if (app.overrides.offer_letter_document) return app.overrides.offer_letter_document;
  if (!reached(app.statusCode, "UNIVERSITY_APPROVED")) return null;
  return doc(app, "offer_letter", "Offer Letter", "2", stepDate(app, "UNIVERSITY_APPROVED"), dt("offer_letter"));
}

export function emgsFor(app: AppRecord): Doc | null {
  if (app.overrides.emgs_evaluation_document) return app.overrides.emgs_evaluation_document;
  const s = app.statusCode;
  if (!reached(s, "EVAL_UNDER_REVIEW")) return null;
  return doc(app, "emgs_evaluation", "EMGS Evaluation Document", s === "EVAL_UNDER_REVIEW" ? "1" : "2", stepDate(app, "EVAL_UNDER_REVIEW"));
}

export function visaDocFor(app: AppRecord): Doc | null {
  if (app.overrides.visa_document) return app.overrides.visa_document;
  if (!reached(app.statusCode, "EVAL_APPROVED")) return null;
  return doc(app, "visa_approval_letter", "Visa Approval Letter", "2", stepDate(app, "EVAL_APPROVED"));
}

// ---------------------------------------------------------------------------
// Visa case + visa payments. The single source of truth: GET/PATCH
// visa-case and GET/POST visa-payments (applications.ts) all go through
// these, and a case only exists once the application reaches Visa Setup.
// ---------------------------------------------------------------------------

/** Has the application reached the visa stage (Visa Setup or later)? */
export const hasVisaStage = (app: AppRecord) => reached(app.statusCode, "UNIVERSITY_APPROVED");

/** The first active payment method the application's Institution accepts (universities.ts). */
export function defaultUniversityPaymentMethodId(app: AppRecord) {
  const universityId = programDetail(app.programId).university.id;
  const m = universityPaymentMethods.all().find((x) => x.university_id === universityId && x.is_active);
  return m?.id ?? null;
}

export function visaCaseFor(app: AppRecord) {
  if (app.visaCaseOverride) return app.visaCaseOverride;
  if (!hasVisaStage(app)) return null;
  const at = stepDate(app, "UNIVERSITY_APPROVED");
  return {
    id: `visa_${app.id}`,
    application_id: app.id,
    visa_fee_amount: app.visa_fee_amount.toFixed(2),
    visa_reference_number: `EMGS-${app.id.slice(-3)}-${2026}`,
    notes: "Includes EMGS processing fee, medical screening and insurance for the first year.",
    created_at: at,
    updated_at: at,
  };
}

/** The payment the seed history implies for the application's current status. */
function seededVisaPayments(app: AppRecord) {
  const s = app.statusCode;
  if (!reached(s, "PAYMENT_SUBMITTED")) return [];
  const at = stepDate(app, "PAYMENT_SUBMITTED");
  const status = s === "PAYMENT_SUBMITTED" ? "pending" : s === "PAYMENT_REJECTED" ? "rejected" : "approved";
  return [
    {
      id: `vp_${app.id}`,
      visa_case_id: `visa_${app.id}`,
      university_payment_method_id: defaultUniversityPaymentMethodId(app) ?? "",
      amount: app.visa_fee_amount.toFixed(2),
      currency: "RM",
      payment_reference: `MBB${app.id.slice(-3)}88${app.visa_fee_amount}`,
      status,
      submitted_at: at,
      reviewed_at: status === "pending" ? undefined : at,
      review_notes: status === "rejected" ? CORRECTION_REASONS.PAYMENT_REJECTED : status === "approved" ? "Payment verified against bank statement." : undefined,
      created_at: at,
      updated_at: at,
      documents: [{ id: `vpd_${app.id}`, file_key: fileKey(app.id, "visa_payment_receipt"), file_url: SAMPLE_PDF_URL }],
    },
  ];
}

/**
 * Visa payments, newest first. The seeded history is materialised onto the
 * record the first time it is needed, so later status changes review these
 * rows (see transition) instead of re-deriving them.
 */
export function visaPaymentsFor(app: AppRecord) {
  if (!app.visaPaymentsSeeded && visaCaseFor(app)) {
    app.visaPaymentsSeeded = true;
    app.visaPayments = [...app.visaPayments, ...seededVisaPayments(app)];
  }
  return app.visaPayments;
}

// Commission amounts, pay-ins, payouts and disputes are owned by finance.ts
// (seeded from these statuses); only the commission documents live here.
const inCommissionStage = (app: AppRecord) => statusByCode(app.statusCode).stageIndex === STAGES.findIndex((st) => st.code === "PARTNER_COMMISSION_INVOICING");
const isPaid = (app: AppRecord) => ["COMMISSION_PAID", "DISPUTE_ISSUE_RECEIVED", "DISPUTE_RESPONSE_RECEIVED", "APPLICATION_COMPLETE"].includes(app.statusCode);

export function commissionDocumentsFor(app: AppRecord) {
  const docs: Record<string, Doc> = {};
  if (inCommissionStage(app)) {
    docs.commission_invoice = doc(app, "commission_invoice", "commission_invoice", "2", stepDate(app, "COMMISSION_READY"));
  }
  if (isPaid(app)) {
    docs.commission_payment_document = doc(app, "commission_payment", "commission_payment_document", "2", stepDate(app, "COMMISSION_PAID"));
  }
  return { ...docs, ...app.commissionDocs };
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

const MANAGER_ACTOR = (app: AppRecord) => ({ id: "usr_am", name: app.accountManagerName });
let timelineCounter = 0;

export function seedTimeline(app: AppRecord): TimelineEntry[] {
  const route = pathTo(app.statusCode);
  const entries: TimelineEntry[] = [];
  const base = (type: string, at: string, actor: { id: string; name: string }): TimelineEntry => ({
    id: `tl_${app.id}_${entries.length + 1}`,
    application_id: app.id,
    entry_type: type,
    actor_id: actor.id,
    actor_name: actor.name,
    from_stage: null,
    from_status: null,
    to_stage: null,
    to_status: null,
    reason_text: null,
    notes: null,
    detail: null,
    required_document_types: null,
    requested_document_types: null,
    uploaded_document_types: null,
    created_at: at,
  });
  const partnerActor = { id: `usr_${app.partnerId}`, name: app.partnerName };

  entries.push({
    ...base("document_upload", app.created_at, partnerActor),
    detail: { bulk: true },
    requested_document_types: APP_DOCUMENT_TYPES.slice(0, 5).map((d) => docTypeRef(d.id)),
    uploaded_document_types: APP_DOCUMENT_TYPES.slice(0, 5).map((d) => docTypeRef(d.id)),
  });

  route.forEach((code, i) => {
    const st = statusByCode(code);
    const prev = i > 0 ? statusByCode(route[i - 1]) : null;
    const at = stepDate(app, code);
    entries.push({
      ...base("status_transition", at, i === 0 ? partnerActor : MANAGER_ACTOR(app)),
      from_stage: prev ? STAGES[prev.stageIndex].name : null,
      from_status: prev?.name ?? null,
      to_stage: STAGES[st.stageIndex].name,
      to_status: st.name,
      reason_text: CORRECTION_REASONS[code] ?? null,
      notes: code === "UNIVERSITY_APPROVED" ? "Offer letter received from the Institution." : null,
      required_document_types: code === app.statusCode && app.requested_doc_type_ids.length ? app.requested_doc_type_ids.map(docTypeRef) : null,
    });
    if (code === "PAYMENT_SUBMITTED") {
      entries.push({ ...base("visa_payment_created", at, partnerActor), detail: { amount: app.visa_fee_amount, currency: "RM" } });
    }
    if (code === "UNIVERSITY_APPROVED") {
      entries.push({ ...base("visa_case_updated", at, MANAGER_ACTOR(app)), detail: { visa_fee_amount: app.visa_fee_amount } });
    }
    if (code === "EVAL_UNDER_REVIEW") {
      entries.push({ ...base("document_upload", at, partnerActor), detail: { document_type_code: "emgs_evaluation_document" } });
    }
    if (code === "ARRIVAL_CONFIRMED") {
      entries.push({ ...base("arrival_date_updated", at, partnerActor), detail: { arrival_date: app.arrival_date } });
    }
  });
  if (app.statusCode === "DISPUTE_ISSUE_RECEIVED") {
    entries.push({ ...base("commission_disputed", daysAgo(3), partnerActor), detail: {} });
  }
  if (app.lifecycle !== "active") {
    entries.push({ ...base("lifecycle_status_changed", daysAgo(2), MANAGER_ACTOR(app)), detail: { status: app.lifecycle } });
  }
  return entries.reverse();
}

export function addTimeline(app: AppRecord, entry: Partial<TimelineEntry> & { entry_type: string }, actor?: { id: string; name: string }) {
  if (!app.timeline.length) app.timeline = seedTimeline(app);
  const who = actor ?? MANAGER_ACTOR(app);
  app.timeline.unshift({
    id: `tl_new_${++timelineCounter}`,
    application_id: app.id,
    actor_id: who.id,
    actor_name: who.name,
    from_stage: null,
    from_status: null,
    to_stage: null,
    to_status: null,
    reason_text: null,
    notes: null,
    detail: null,
    required_document_types: null,
    requested_document_types: null,
    uploaded_document_types: null,
    created_at: nowIso(),
    ...entry,
  });
}

export const partnerActorOf = (app: AppRecord) => ({ id: `usr_${app.partnerId}`, name: app.partnerName });

/** Move to a new status, recording the transition. */
/** Payment review outcomes a status change implies for the latest pending visa payment. */
const PAYMENT_REVIEW: Record<string, "approved" | "rejected"> = { PAYMENT_APPROVED: "approved", PAYMENT_REJECTED: "rejected" };

export function transition(app: AppRecord, code: string, opts: { reason?: string; notes?: string; docIds?: string[]; actor?: { id: string; name: string } } = {}) {
  const from = statusByCode(app.statusCode);
  const to = statusByCode(code);
  const review = PAYMENT_REVIEW[code];
  if (review) {
    const pending = visaPaymentsFor(app).find((p) => p.status === "pending");
    if (pending) {
      Object.assign(pending, {
        status: review,
        reviewed_at: nowIso(),
        review_notes: review === "rejected" ? opts.reason || "Payment rejected." : "Payment verified against bank statement.",
        updated_at: nowIso(),
      });
    }
  }
  addTimeline(
    app,
    {
      entry_type: "status_transition",
      from_stage: STAGES[from.stageIndex].name,
      from_status: from.name,
      to_stage: STAGES[to.stageIndex].name,
      to_status: to.name,
      reason_text: opts.reason || null,
      notes: opts.notes || null,
      required_document_types: opts.docIds?.length ? opts.docIds.map(docTypeRef) : null,
    },
    opts.actor,
  );
  app.statusCode = code;
  app.updated_at = nowIso();
  if (to.reason || to.docs) {
    app.correction_reason = opts.reason || app.correction_reason;
    app.requested_doc_type_ids = opts.docIds ?? [];
  } else {
    app.requested_doc_type_ids = [];
  }
}

export const uploadedDoc = (app: AppRecord, type: string, body: any, typeId: string | null = null): Doc => ({
  id: `${app.id}_up_${++timelineCounter}`,
  file_key: body?.file_key || fileKey(app.id, `upload_${timelineCounter}`),
  file_url: SAMPLE_PDF_URL,
  status: "1",
  approve_notes: null,
  created_at: nowIso(),
  document_type_id: typeId,
  document_type: type,
});

export const partnerOwner = CURRENT_PARTNER;
export const studentPhoto = (app: AppRecord) => app.student.photo_url ?? placeholderImage(app.student.name);
