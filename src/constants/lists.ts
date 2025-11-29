
// Document Types
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

// User Roles
export const USER_ROLES = [
  { key: "admin", label: "Admin", labelKey: "roles.admin" },
  { key: "account_manager", label: "Account Manager", labelKey: "roles.account_manager" },
  { key: "reviewer", label: "Reviewer", labelKey: "roles.reviewer" },
  { key: "partner", label: "Partner", labelKey: "roles.partner" },
  { key: "applicant", label: "Applicant", labelKey: "roles.applicant" },
];

// Application Stages
export const STAGE_OPTIONS = [
  { key: "all", label: "All Stages", labelKey: "stage.all" },
  { key: "application_review", label: "Application Review", labelKey: "stage.application_review" },
  { key: "offer_letter", label: "Offer Letter", labelKey: "stage.offer_letter" },
  { key: "visa_processing", label: "Visa Processing", labelKey: "stage.visa_processing" },
  { key: "student_arrival", label: "Student Arrival", labelKey: "stage.student_arrival" },
  { key: "commission_payment", label: "Commission Payment", labelKey: "stage.commission_payment" },
];

// QUALIFICATION OPTIONS
export const QUALIFICATION_OPTIONS = [
  { label: "SPM / O-Level", value: "SPM / O-Level" },
  { label: "STPM / A-Level", value: "STPM / A-Level" },
  { label: "Diploma", value: "Diploma" },
  { label: "Bachelor's Degree", value: "Bachelor's Degree" },
  { label: "Master's Degree", value: "Master's Degree" },
  { label: "PhD", value: "PhD" },
];

export const ENGLISH_TEST_OPTIONS = [
  { label: "None / Not Taken", value: "none" },
  { label: "IELTS", value: "IELTS" },
  { label: "TOEFL", value: "TOEFL" },
  { label: "PTE", value: "PTE" },
  { label: "Duolingo", value: "Duolingo" },
  { label: "Cambridge English", value: "Cambridge English" },
  { label: "TOEIC", value: "TOEIC" },
  { label: "OET", value: "OET" },
  { label: "CEFR", value: "CEFR" },
  { label: "EmSAT English", value: "EmSAT" },
  { label: "Qiyas English", value: "Qiyas" },
];

export default {
  DOCUMENT_TYPES,
  USER_ROLES,
  STAGE_OPTIONS,
};
