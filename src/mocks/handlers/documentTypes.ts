import { mock, httpError, reply } from "../router";
import { seedId, table, SAMPLE_PDF_URL } from "../db";

// Document types used by application forms, required-action uploads and the
// admin "Document templates" page (static templates partners download).

export interface MockDocumentType {
  id: string;
  type: string;
  code: string;
  description: string;
  is_init_app_doc: boolean;
  is_required_init_app_doc: boolean;
  is_required_for_init: boolean;
  is_required_for_current_upload?: boolean;
  has_static_template: boolean;
  static_template_file_key: string | null;
  static_template_file_url: string | null;
}

// [type, code, description, init doc, required at init, templatable, has template uploaded]
const SEED: [string, string, string, boolean, boolean, boolean, boolean][] = [
  ["Passport", "passport", "Bio-data page of a passport valid for at least 18 months.", true, true, false, false],
  ["Passport Photo", "passport_photo", "Recent colour photo, white background, 35 x 50 mm.", true, true, false, false],
  ["Academic Certificate", "academic_certificate", "Certificate of the highest qualification completed (e.g. SPM, A-Level, WAEC).", true, true, false, false],
  ["Academic Transcript", "academic_transcript", "Full transcript of results for the highest qualification.", true, true, false, false],
  ["English Proficiency Certificate", "english_proficiency", "IELTS, TOEFL, PTE or MUET results, if available.", true, false, false, false],
  ["Personal Statement", "personal_statement", "One-page statement of purpose for the chosen programme.", true, false, false, false],
  ["Application Form Template", "application_form", "The Institution's application form, completed and signed by the student.", false, false, true, true],
  ["English Form Template", "english_form", "English language declaration form required by some Institutions.", false, false, true, true],
  ["Health Declaration Form", "health_declaration_form", "EMGS Lampiran B health declaration, signed by the student.", false, false, true, true],
  ["Medical Report (EMGS)", "medical_report_emgs", "Post-arrival medical screening report from an EMGS-registered clinic.", false, false, false, false],
  ["Offer Letter", "offer_letter", "Conditional or unconditional offer letter issued by the Institution.", false, false, false, false],
  ["Signed Offer Letter", "signed_offer_letter", "Offer letter countersigned by the student to accept the place.", false, false, false, false],
  ["Visa Invoice", "visa_invoice", "Invoice for the EMGS visa processing fee (RM2,500).", false, false, true, false],
  ["Visa Payment Receipt", "visa_payment_receipt", "Proof of payment for the visa processing fee.", false, false, false, false],
  ["e-VAL / e-Visa", "e_visa", "Electronic visa approval letter issued by Immigration Malaysia.", false, false, false, false],
  ["Arrival Form Template", "arrival_form", "Arrival details form: flight number, date and airport pickup request.", false, false, true, true],
  ["Flight Ticket", "flight_ticket", "Confirmed flight itinerary to Kuala Lumpur International Airport.", false, false, false, false],
  ["Bank Statement", "bank_statement", "Last 3 months of the student's or sponsor's bank statements.", false, false, false, false],
  ["Travel Insurance", "travel_insurance", "Insurance covering the first 12 months of study in Malaysia.", false, false, false, false],
];

export const DOCUMENT_TYPES = table<MockDocumentType>(
  SEED.map(([type, code, description, init, required, templatable, uploaded], i) => ({
    id: seedId("doctype", i + 1),
    type,
    code,
    description,
    is_init_app_doc: init,
    is_required_init_app_doc: required,
    is_required_for_init: required,
    has_static_template: templatable,
    static_template_file_key: uploaded ? `document-templates/${code}.pdf` : null,
    static_template_file_url: uploaded ? SAMPLE_PDF_URL : null,
  })),
);

/** Look up a seeded document type by its code (throws if the code is unknown, so typos surface early). */
export function documentTypeByCode(code: string): MockDocumentType {
  const row = DOCUMENT_TYPES.all().find((d) => d.code === code);
  if (!row) throw new Error(`[mocks] unknown document type code "${code}"`);
  return row;
}

const truthy = (v: unknown) => v === true || v === "true" || v === "1";

mock.get("/document-types", ({ query }) => {
  let rows = DOCUMENT_TYPES.all();
  if (truthy(query.init_only)) {
    rows = rows.filter((d) => d.is_init_app_doc);
    // Nigerian/Pakistani applicants also need an English proficiency result.
    const strictEnglish = ["Nigeria", "Pakistan", "Bangladesh"].includes(String(query.nationality ?? ""));
    rows = rows.map((d) =>
      d.code === "english_proficiency" && strictEnglish ? { ...d, is_required_init_app_doc: true, is_required_for_init: true } : d,
    );
  }
  if (query.application_stage_id) {
    // Stage-specific uploads: flag the visa/arrival documents as required now.
    const current = ["visa_payment_receipt", "signed_offer_letter", "flight_ticket"];
    rows = rows.map((d) => ({ ...d, is_required_for_current_upload: current.includes(d.code) }));
  }
  return rows;
});

mock.get("/document-types/:id", ({ params }) => {
  const row = DOCUMENT_TYPES.find(params.id);
  if (!row) throw httpError(404, "Document type not found");
  return row;
});

mock.patch("/document-types/:id/static-template", ({ params, body }) => {
  const row = DOCUMENT_TYPES.find(params.id);
  if (!row) {
    return reply(404, { code: "document_type_not_found", detail: "This document type no longer exists." });
  }
  if (!row.has_static_template) {
    return reply(422, {
      code: "document_type_static_template_not_supported",
      detail: "This document type doesn't support a static template.",
    });
  }
  return DOCUMENT_TYPES.update(row.id, {
    static_template_file_key: body?.file_key ?? row.static_template_file_key,
    static_template_file_url: body?.file_url ?? SAMPLE_PDF_URL,
  });
});
