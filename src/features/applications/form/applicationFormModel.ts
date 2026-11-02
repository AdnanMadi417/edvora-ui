// Pure pieces of the application form: steps, payload, document rules.
// Unit-tested in __tests__/applicationForm.test.ts.

import type { DocumentItem, DocumentType, FormDataType } from "features/applications/partner/components/form/utility-functions/types";
import { getCurrentDate } from "features/applications/partner/components/form/utility-functions/getCurrentDate";

export type ApplicationFormStepId = "student" | "documents" | "details" | "review";

/** legacyStage is the stage number validateFormData expects. */
export const APPLICATION_FORM_STEPS: Record<ApplicationFormStepId, { id: ApplicationFormStepId; label: string; description: string; legacyStage: number }> = {
  student: { id: "student", label: "Student and programme", description: "Passport details and where they're applying", legacyStage: 1 },
  documents: { id: "documents", label: "Documents", description: "What the Institution needs first", legacyStage: 2 },
  details: { id: "details", label: "More details", description: "Fields this Institution asks for", legacyStage: 3 },
  review: { id: "review", label: "Review and submit", description: "Check everything once", legacyStage: 4 },
};

/** The details step only appears when the Institution requires extra fields. */
export function visibleSteps(hasRequiredFields: boolean) {
  const all = [APPLICATION_FORM_STEPS.student, APPLICATION_FORM_STEPS.documents, APPLICATION_FORM_STEPS.details, APPLICATION_FORM_STEPS.review];
  return hasRequiredFields ? all : all.filter((s) => s.id !== "details");
}

/** Required at application start (new flag, falling back to the old one). */
export const isRequiredDocument = (d: DocumentType) => !!(d.is_required_for_init ?? d.is_required_init_app_doc);

export const uploadedFor = (docs: DocumentItem[], typeId: string) => docs.find((d) => d.document_type_id === typeId);

/** Required document types with no finished upload. */
export function missingRequiredDocuments(types: DocumentType[], docs: DocumentItem[]): DocumentType[] {
  return types.filter((t) => isRequiredDocument(t) && !docs.some((d) => d.document_type_id === t.id && d.file_url && !d.uploading));
}

/** Reads "student.emergency_contacts[0].name"-style paths. */
export function getPath(obj: unknown, path: string): any {
  return path
    .replace(/\[(\d+)\]/g, ".$1")
    .split(".")
    .reduce<any>((o, k) => (o == null ? undefined : o[k]), obj);
}

const isoDate = (v: string) => (v ? new Date(v).toISOString().split("T")[0] : undefined);

/** The create-application payload, unchanged from the previous forms. */
export function buildPayload(f: FormDataType) {
  const s = f.student;
  return {
    program_id: f.program_id || undefined,
    university_id: f.university_id || undefined,
    intake_date: f.intake_date || getCurrentDate(),
    student: {
      name: s.name || "",
      birthday: s.birthday || null,
      nationality: s.nationality || "",
      passport_number: s.passport_number || "",
      email: s.email || "",
      phone: s.phone || "",
      current_address: s.current_address || "",
      // The form type says string, but the field holds the API's boolean (true = male).
      gender: (s.gender as unknown as boolean | null) ?? null,
      emergency_contacts: s.emergency_contacts.filter((c) => c.name || c.phone).map((c) => ({ name: c.name, relation: c.relation, phone: c.phone, email: c.email })),
      english_proficiencies: s.english_proficiencies
        .filter((e) => e.test_type || e.score)
        .map((e) => ({ test_type: e.test_type || undefined, score: e.score || undefined, test_date: isoDate(e.test_date) })),
      previous_educations: s.previous_educations
        .filter((p) => p.institution_name)
        .map((p) => ({ institution_name: p.institution_name, qualification: p.qualification || undefined, start_date: isoDate(p.start_date), end_date: isoDate(p.end_date), grade: p.grade || undefined })),
    },
    documents: f.documents.filter((d) => d.file_url && !d.uploading).map((d) => ({ document_type_id: d.document_type_id, file_url: d.file_url, file_key: d.file_key })),
    is_draft: f.is_draft ?? false,
  };
}
