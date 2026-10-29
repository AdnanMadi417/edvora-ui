// Application workflow + in-memory application records for the mock API.
// The UI switches on stage names, status names and status codes, so the
// pipeline below mirrors the strings the components look for (e.g.
// "University Approved", "Visa Issued", WAITING_FOR_PAYMENT, COMMISSION_PAID).

import { daysAgo, daysFromNow, nowIso, pick, placeholderImage, SAMPLE_PDF_URL, table } from "../db";
import { APPLICATIONS, CURRENT_PARTNER, PROGRAMS, UNIVERSITIES } from "../seed";
import { DOCUMENT_TYPES, documentTypeByCode } from "./documentTypes";
import { universityPaymentMethods } from "./universities";

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

const PIPELINE: { code: string; name: string; statuses: StatusDef[] }[] = [
  {
    code: "APPLICATION_SUBMISSION",
    name: "Application Submission",
    statuses: [
      { code: "NEW_APPLICATION", name: "New Application", partner: "Wait for the admissions team to review the documents", manager: "Review the submitted documents" },
      { code: "CORRECTION_REQUESTED", name: "Correction Requested", partner: "Upload the requested documents", manager: "Wait for the Advisor to re-upload documents", reason: true, docs: true },
      { code: "DOCUMENTS_REUPLOADED", name: "Documents Re-uploaded", partner: "Wait for the admissions team to review", manager: "Review the re-uploaded documents" },
    ],
  },
  {
    code: "INSTITUTION_REVIEW",
    name: "Institution Review",
    statuses: [
      { code: "SUBMITTED_TO_INSTITUTION", name: "Submitted to Institution", partner: "Wait for the Institution's admission decision", manager: "Follow up with the Institution" },
      { code: "PROGRAM_CHANGE_SUGGESTED", name: "Program Change Suggested", partner: "Choose a new program for the student", manager: "Wait for the Advisor's program decision", reason: true },
      { code: "UNIVERSITY_APPROVED", name: "University Approved", partner: "Review and accept the offer letter", manager: "Set up the visa case and fee", advance: true },
      { code: "UNIVERSITY_REJECTED", name: "Rejected by Institution", partner: "No further action — consider another program", manager: "Close the application", reason: true },
    ],
  },
  {
    code: "OFFER_AND_VISA_PAYMENT",
    name: "Offer & Visa Payment",
    statuses: [
      { code: "VISA_SETUP", name: "Visa Setup", partner: "Wait for the visa fee to be confirmed", manager: "Confirm the visa fee amount" },
      { code: "WAITING_FOR_PAYMENT", name: "Waiting for Payment", partner: "Pay the visa fee and upload the receipt", manager: "Wait for the Advisor's visa payment" },
      { code: "PAYMENT_SUBMITTED", name: "Payment Submitted", partner: "Wait for payment verification", manager: "Verify the visa payment receipt" },
      { code: "PAYMENT_REJECTED", name: "Payment Rejected", partner: "Upload a corrected payment receipt", manager: "Wait for the corrected payment receipt", reason: true },
      { code: "APPLICATION_FORM_REJECTED", name: "Application Form Rejected", partner: "Upload a corrected application form", manager: "Review after re-upload", reason: true },
      { code: "HEALTH_DECLARATION_REJECTED", name: "Health Declaration Rejected", partner: "Upload a corrected health declaration", manager: "Review after re-upload", reason: true },
      { code: "PAYMENT_APPROVED", name: "Payment Approved", partner: "Wait for the EMGS submission", manager: "Submit the visa application to EMGS", advance: true },
    ],
  },
  {
    code: "VISA_PROCESSING",
    name: "Visa Processing",
    statuses: [
      { code: "EVAL_PARTNER_UPLOAD", name: "Waiting for EMGS Eval Upload", partner: "Upload the EMGS evaluation document", manager: "Wait for the EMGS evaluation upload" },
      { code: "EVAL_UNDER_REVIEW", name: "Eval Under Review", partner: "Wait for the evaluation review", manager: "Review the EMGS evaluation document" },
      { code: "EVAL_REUPLOAD_REQUIRED", name: "Eval Re-upload Required", partner: "Re-upload the EMGS evaluation document", manager: "Wait for the corrected evaluation", reason: true },
      { code: "E_VISA_PARTNER_UPLOAD", name: "Waiting for E-Visa Upload", partner: "Upload the student's e-visa", manager: "Wait for the e-visa upload" },
      { code: "E_VISA_UNDER_REVIEW", name: "E-Visa Under Review", partner: "Wait for the e-visa review", manager: "Review the uploaded e-visa" },
      { code: "VISA_DOCUMENTS_UNDER_REVIEW", name: "Visa Documents Under Review", partner: "Wait for the visa documents review", manager: "Review the visa documents" },
      { code: "VISA_ISSUED", name: "Visa Issued", partner: "Confirm the student's arrival date", manager: "Request the arrival date", advance: true },
    ],
  },
  {
    code: "ARRIVAL_AND_ENROLLMENT",
    name: "Student Arrival & Enrollment",
    statuses: [
      { code: "WAITING_PARTNER_CONFIRM_ARRIVAL_DATE", name: "Waiting for Arrival Date", partner: "Confirm the arrival date and upload the flight ticket", manager: "Wait for the arrival date" },
      { code: "ARRIVAL_CONFIRMED", name: "Arrival Confirmed", partner: "Prepare the student for arrival", manager: "Arrange airport pickup" },
      { code: "AWAITING_ARRIVAL", name: "Awaiting Arrival", partner: "Wait for the student to arrive", manager: "Confirm the student has arrived" },
      { code: "ARRIVAL_EXTRA_DOCS_UPLOAD", name: "Extra Arrival Documents Required", partner: "Upload the completed arrival form", manager: "Wait for the arrival documents", docs: true },
      { code: "EXTRA_ARRIVAL_DOCUMENTS_UNDER_REVIEW", name: "Extra Arrival Documents Under Review", partner: "Wait for the arrival documents review", manager: "Review the arrival documents" },
      { code: "STUDENT_ENROLLED", name: "Student Enrolled", partner: "Wait for commission processing", manager: "Mark the commission as ready", advance: true },
    ],
  },
  {
    code: "PARTNER_COMMISSION_INVOICING",
    name: "Partner Commission Invoicing",
    statuses: [
      { code: "COMMISSION_READY", name: "Commission Ready", partner: "Wait for the commission payout", manager: "Record the commission payout" },
      { code: "COMMISSION_PAID", name: "Commission Paid", partner: "Confirm you received the commission", manager: "Wait for the Advisor's confirmation" },
      { code: "COMMISSION_DISPUTED", name: "Commission Disputed", partner: "Wait for the dispute to be resolved", manager: "Review the commission dispute" },
      { code: "DISPUTE_RESPONSE_RECEIVED", name: "Dispute Response Received", partner: "Confirm the corrected commission", manager: "Wait for the Advisor's confirmation" },
      { code: "APPLICATION_COMPLETE", name: "Application Completed", partner: "No further action", manager: "No further action" },
    ],
  },
];

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

/** Where a manager/admin can move an application from each status. */
const NEXT: Record<string, string[]> = {
  NEW_APPLICATION: ["SUBMITTED_TO_INSTITUTION", "CORRECTION_REQUESTED"],
  CORRECTION_REQUESTED: ["SUBMITTED_TO_INSTITUTION"],
  DOCUMENTS_REUPLOADED: ["SUBMITTED_TO_INSTITUTION", "CORRECTION_REQUESTED"],
  SUBMITTED_TO_INSTITUTION: ["UNIVERSITY_APPROVED", "PROGRAM_CHANGE_SUGGESTED", "UNIVERSITY_REJECTED"],
  PROGRAM_CHANGE_SUGGESTED: ["SUBMITTED_TO_INSTITUTION", "UNIVERSITY_REJECTED"],
  UNIVERSITY_APPROVED: ["VISA_SETUP"],
  UNIVERSITY_REJECTED: [],
  VISA_SETUP: ["WAITING_FOR_PAYMENT"],
  WAITING_FOR_PAYMENT: ["PAYMENT_SUBMITTED"],
  PAYMENT_SUBMITTED: ["PAYMENT_APPROVED", "PAYMENT_REJECTED", "APPLICATION_FORM_REJECTED", "HEALTH_DECLARATION_REJECTED"],
  PAYMENT_REJECTED: ["PAYMENT_SUBMITTED"],
  APPLICATION_FORM_REJECTED: ["PAYMENT_SUBMITTED"],
  HEALTH_DECLARATION_REJECTED: ["PAYMENT_SUBMITTED"],
  PAYMENT_APPROVED: ["EVAL_PARTNER_UPLOAD"],
  EVAL_PARTNER_UPLOAD: ["EVAL_UNDER_REVIEW"],
  EVAL_UNDER_REVIEW: ["E_VISA_PARTNER_UPLOAD", "EVAL_REUPLOAD_REQUIRED"],
  EVAL_REUPLOAD_REQUIRED: ["EVAL_UNDER_REVIEW"],
  E_VISA_PARTNER_UPLOAD: ["E_VISA_UNDER_REVIEW"],
  E_VISA_UNDER_REVIEW: ["VISA_DOCUMENTS_UNDER_REVIEW", "VISA_ISSUED"],
  VISA_DOCUMENTS_UNDER_REVIEW: ["VISA_ISSUED"],
  VISA_ISSUED: ["WAITING_PARTNER_CONFIRM_ARRIVAL_DATE"],
  WAITING_PARTNER_CONFIRM_ARRIVAL_DATE: ["ARRIVAL_CONFIRMED"],
  ARRIVAL_CONFIRMED: ["AWAITING_ARRIVAL"],
  AWAITING_ARRIVAL: ["STUDENT_ENROLLED", "ARRIVAL_EXTRA_DOCS_UPLOAD"],
  ARRIVAL_EXTRA_DOCS_UPLOAD: ["EXTRA_ARRIVAL_DOCUMENTS_UNDER_REVIEW"],
  EXTRA_ARRIVAL_DOCUMENTS_UNDER_REVIEW: ["STUDENT_ENROLLED", "ARRIVAL_EXTRA_DOCS_UPLOAD"],
  STUDENT_ENROLLED: ["COMMISSION_READY"],
  COMMISSION_READY: ["COMMISSION_PAID"],
  COMMISSION_PAID: ["APPLICATION_COMPLETE"],
  COMMISSION_DISPUTED: ["DISPUTE_RESPONSE_RECEIVED"],
  DISPUTE_RESPONSE_RECEIVED: ["APPLICATION_COMPLETE"],
  APPLICATION_COMPLETE: [],
};
export const nextStatuses = (code: string) => (NEXT[code] ?? []).map(statusByCode);

/** The usual route to a status, for building a believable history. */
const HAPPY_PATH = [
  "NEW_APPLICATION", "SUBMITTED_TO_INSTITUTION", "UNIVERSITY_APPROVED", "VISA_SETUP", "WAITING_FOR_PAYMENT",
  "PAYMENT_SUBMITTED", "PAYMENT_APPROVED", "EVAL_PARTNER_UPLOAD", "EVAL_UNDER_REVIEW", "E_VISA_PARTNER_UPLOAD",
  "E_VISA_UNDER_REVIEW", "VISA_ISSUED", "WAITING_PARTNER_CONFIRM_ARRIVAL_DATE", "ARRIVAL_CONFIRMED", "AWAITING_ARRIVAL",
  "STUDENT_ENROLLED", "COMMISSION_READY", "COMMISSION_PAID", "APPLICATION_COMPLETE",
];

/** Predecessors for statuses the Advisor (not the manager) moves into. */
const PREV: Record<string, string> = {
  DOCUMENTS_REUPLOADED: "CORRECTION_REQUESTED",
  COMMISSION_DISPUTED: "COMMISSION_PAID",
  DISPUTE_RESPONSE_RECEIVED: "COMMISSION_DISPUTED",
};

export function pathTo(code: string, depth = 0): string[] {
  const i = HAPPY_PATH.indexOf(code);
  if (i >= 0) return HAPPY_PATH.slice(0, i + 1);
  if (depth > 6) return ["NEW_APPLICATION", code];
  // Side branches: walk to the status's predecessor, preferring the happy path.
  const keys = Object.keys(NEXT).filter((k) => k !== code && NEXT[k].includes(code));
  const prev = PREV[code] ?? keys.find((k) => HAPPY_PATH.includes(k)) ?? keys[0] ?? "NEW_APPLICATION";
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
  visaCaseOverride: any | null;
  timeline: TimelineEntry[];
  new_notifications_count: number;
  created_at: string;
  updated_at: string;
};

const SEED_STATUSES = [
  "CORRECTION_REQUESTED", "NEW_APPLICATION", "DOCUMENTS_REUPLOADED", "PROGRAM_CHANGE_SUGGESTED",
  "SUBMITTED_TO_INSTITUTION", "UNIVERSITY_APPROVED", "WAITING_FOR_PAYMENT", "PAYMENT_SUBMITTED",
  "PAYMENT_REJECTED", "EVAL_PARTNER_UPLOAD", "EVAL_UNDER_REVIEW", "E_VISA_PARTNER_UPLOAD",
  "WAITING_PARTNER_CONFIRM_ARRIVAL_DATE", "E_VISA_UNDER_REVIEW", "VISA_ISSUED", "ARRIVAL_EXTRA_DOCS_UPLOAD",
  "AWAITING_ARRIVAL", "STUDENT_ENROLLED", "COMMISSION_PAID", "COMMISSION_READY",
  "COMMISSION_DISPUTED", "APPLICATION_COMPLETE", "NEW_APPLICATION", "UNIVERSITY_REJECTED",
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
function stepDate(app: AppRecord, code: string) {
  const route = pathTo(app.statusCode);
  const idx = Math.max(0, route.indexOf(code));
  const start = (Date.parse(daysAgo(0)) - Date.parse(app.created_at)) / 86400000;
  const per = start / Math.max(route.length, 1);
  return daysAgo(Math.max(0, start - idx * per));
}

export function documentsFor(app: AppRecord): Doc[] {
  const s = app.statusCode;
  const fresh = s === "NEW_APPLICATION";
  const base: Doc[] = [
    doc(app, "passport", "Passport", fresh ? "1" : "2", app.created_at, dt("passport")),
    doc(app, "academic_transcript", "Academic Transcript", s === "CORRECTION_REQUESTED" ? "3" : fresh ? "1" : "2", app.created_at, dt("academic_transcript"), s === "CORRECTION_REQUESTED" ? "Not certified — please upload a certified true copy." : null),
    doc(app, "academic_certificate", "Academic Certificate", fresh ? "1" : "2", app.created_at, dt("academic_certificate")),
    doc(app, "passport_photo", "Passport Photo", fresh ? "1" : "2", app.created_at, dt("passport_photo")),
    doc(app, "english_certificate", "English Proficiency Certificate", fresh ? "1" : "2", app.created_at, dt("english_proficiency")),
  ];
  if (s === "DOCUMENTS_REUPLOADED") {
    base.push(doc(app, "academic_transcript_v2", "Academic Transcript", "1", stepDate(app, s), dt("academic_transcript")));
  }
  if (reached(s, "UNIVERSITY_APPROVED") && s !== "UNIVERSITY_REJECTED") {
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
  if (reached(s, "VISA_ISSUED")) {
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
  if (!reached(app.statusCode, "VISA_ISSUED")) return null;
  return doc(app, "visa_approval_letter", "Visa Approval Letter", "2", stepDate(app, "VISA_ISSUED"));
}

// ---------------------------------------------------------------------------
// Visa case + visa payments. The single source of truth: GET/PATCH
// visa-case and GET/POST visa-payments (applications.ts) all go through
// these, and a case only exists once the application reaches Visa Setup.
// ---------------------------------------------------------------------------

/** Has the application reached the visa stage (Visa Setup or later)? */
export const hasVisaStage = (app: AppRecord) => reached(app.statusCode, "VISA_SETUP");

/** The first active payment method the application's Institution accepts (universities.ts). */
export function defaultUniversityPaymentMethodId(app: AppRecord) {
  const universityId = programDetail(app.programId).university.id;
  const m = universityPaymentMethods.all().find((x) => x.university_id === universityId && x.is_active);
  return m?.id ?? null;
}

export function visaCaseFor(app: AppRecord) {
  if (app.visaCaseOverride) return app.visaCaseOverride;
  if (!hasVisaStage(app)) return null;
  const at = stepDate(app, "VISA_SETUP");
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

export function visaPaymentsFor(app: AppRecord) {
  const s = app.statusCode;
  const seeded = [];
  if (!visaCaseFor(app)) return [];
  if (reached(s, "PAYMENT_SUBMITTED")) {
    const at = stepDate(app, "PAYMENT_SUBMITTED");
    const status = s === "PAYMENT_SUBMITTED" ? "pending" : s === "PAYMENT_REJECTED" ? "rejected" : "approved";
    seeded.push({
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
    });
  }
  return [...app.visaPayments, ...seeded];
}

export function commissionsFor(app: AppRecord) {
  const s = app.statusCode;
  const p = PROGRAMS.find((x) => x.id === app.programId) ?? PROGRAMS[0];
  const status = reached(s, "COMMISSION_PAID")
    ? "paid"
    : s === "COMMISSION_READY"
      ? "released"
      : reached(s, "STUDENT_ENROLLED")
        ? "approved"
        : "pending";
  return [
    {
      id: `com_${app.id}`,
      status,
      amount: Math.round(p.tuition_fee * 0.15),
      currency: "RM",
      commission_type_id: "ctype_001",
      commission_type: "Percentage",
      notes: "15% of first-year tuition fee, payable after enrollment is confirmed.",
      expected_commission_from: 30,
      expected_commission_to: 60,
      created_at: app.created_at,
    },
  ];
}

const inCommissionStage = (app: AppRecord) => statusByCode(app.statusCode).stageIndex === 5;
const isPaid = (app: AppRecord) => ["COMMISSION_PAID", "COMMISSION_DISPUTED", "DISPUTE_RESPONSE_RECEIVED", "APPLICATION_COMPLETE"].includes(app.statusCode);

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

export function payInFor(app: AppRecord) {
  if (!inCommissionStage(app)) return null;
  const amount = Math.round((PROGRAMS.find((x) => x.id === app.programId) ?? PROGRAMS[0]).tuition_fee * 0.25);
  return {
    id: `payin_${app.id}`,
    payment_date: stepDate(app, "COMMISSION_READY").slice(0, 10),
    amount,
    currency: "RM",
    payment_reference: `INST-REM-${app.id.slice(-3)}2026`,
    voided_at: null,
    void_reason: null,
    created_at: stepDate(app, "COMMISSION_READY"),
  };
}

export function payoutFor(app: AppRecord) {
  if (!isPaid(app)) return null;
  const amount = commissionsFor(app)[0].amount;
  return {
    id: `payout_${app.id}`,
    bank_reference: `MBB-TRF-${app.id.slice(-3)}7781`,
    paid_at: stepDate(app, "COMMISSION_PAID"),
    currency: "RM",
    paid_amount: amount,
    source_amount: amount,
    source_currency: "RM",
    voided_at: null,
    void_reason: null,
    created_at: stepDate(app, "COMMISSION_PAID"),
    receipt_file_key: fileKey(app.id, "payout_receipt"),
    receipt_file_url: SAMPLE_PDF_URL,
  };
}

export function disputeFor(app: AppRecord) {
  if (app.statusCode !== "COMMISSION_DISPUTED" && app.statusCode !== "DISPUTE_RESPONSE_RECEIVED") return null;
  const resolved = app.statusCode === "DISPUTE_RESPONSE_RECEIVED";
  return {
    id: `dsp_${app.id}`,
    status: resolved ? "resolved" : "open",
    justification: "The payout covers 10% of tuition, but the agreement for this Institution is 15% of first-year tuition.",
    report: resolved ? "Rate confirmed at 15%. The difference has been paid in a corrected payout." : null,
    reported_by_user_id: `usr_${app.partnerId}`,
    resolved_by_user_id: resolved ? "usr_admin_001" : null,
    old_partner_payout_id: resolved ? `payout_${app.id}_old` : null,
    new_partner_payout_id: resolved ? `payout_${app.id}` : null,
    created_at: daysAgo(3),
    updated_at: daysAgo(resolved ? 1 : 3),
  };
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
    if (code === "VISA_SETUP") {
      entries.push({ ...base("visa_case_updated", at, MANAGER_ACTOR(app)), detail: { visa_fee_amount: app.visa_fee_amount } });
    }
    if (code === "EVAL_UNDER_REVIEW") {
      entries.push({ ...base("document_upload", at, partnerActor), detail: { document_type_code: "emgs_evaluation_document" } });
    }
    if (code === "ARRIVAL_CONFIRMED") {
      entries.push({ ...base("arrival_date_updated", at, partnerActor), detail: { arrival_date: app.arrival_date } });
    }
  });
  if (app.statusCode === "COMMISSION_DISPUTED") {
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
export function transition(app: AppRecord, code: string, opts: { reason?: string; notes?: string; docIds?: string[]; actor?: { id: string; name: string } } = {}) {
  const from = statusByCode(app.statusCode);
  const to = statusByCode(code);
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
