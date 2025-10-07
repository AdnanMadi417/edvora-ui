export const DOCUMENT_TYPES = [
  { key: "passport_copy", label: "Passport Copy", labelKey: "documents.passport_copy" },
  { key: "academic_transcripts", label: "Academic Transcripts", labelKey: "documents.academic_transcripts" },
  { key: "english_proficiency_test", label: "English Proficiency Test", labelKey: "documents.english_proficiency_test" },
  { key: "financial_documents", label: "Financial Documents", labelKey: "documents.financial_documents" },
  { key: "personal_statement", label: "Personal Statement", labelKey: "documents.personal_statement" },
  { key: "recommendation_letters", label: "Recommendation Letters", labelKey: "documents.recommendation_letters" },
  { key: "bank_statements", label: "Bank Statements", labelKey: "documents.bank_statements" },
  { key: "medical_certificate", label: "Medical Certificate", labelKey: "documents.medical_certificate" },
  { key: "police_clearance_certificate", label: "Police Clearance Certificate", labelKey: "documents.police_clearance_certificate" },
  { key: "other", label: "Other", labelKey: "documents.other" },
];

export const USER_ROLES = [
  { key: "admin", label: "Admin", labelKey: "roles.admin" },
  { key: "account_manager", label: "Account Manager", labelKey: "roles.account_manager" },
  { key: "reviewer", label: "Reviewer", labelKey: "roles.reviewer" },
  { key: "partner", label: "Partner", labelKey: "roles.partner" },
  { key: "applicant", label: "Applicant", labelKey: "roles.applicant" },
];

export const GENDER_OPTIONS = [
  { key: "male", label: "Male", labelKey: "gender.male" },
  { key: "female", label: "Female", labelKey: "gender.female" },
];



export default {
  DOCUMENT_TYPES,
  USER_ROLES,
  GENDER_OPTIONS,
};
