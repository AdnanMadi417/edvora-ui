// ── University Types ──────────────────────────────────────────────────────────

export interface ApplicationRequiredField {
  id: string;
  field_key: string;
  field_name: string;
  is_required: boolean;
}

export interface SubmissionField {
  id: string;
  field_key: string;
  field_name: string;
}

export interface UniversityType {
  id: string;
  name: string;
  description?: string;
  required_fields: ApplicationRequiredField[];
}

export interface UniversityTypeDetails {
  id: string;
  name: string;
  description?: string;
  required_fields: ApplicationRequiredField[];
}

export interface CreateUniversityTypePayload {
  name: string;
  description?: string;
  required_fields?: { application_submission_field_id: string; is_required: boolean }[];
}

export interface UpdateUniversityTypePayload {
  name: string;
  description?: string;
  required_fields: { id: string; is_required: boolean }[];
}

export interface AssignUniversityTypePayload {
  university_type_id: string | null;
}

export interface UniversityTypeResponse {
  id: string;
  name: string;
  university_type_id: string | null;
  university_type_name: string | null;
}

// ── Universities with required fields (config view) ──────────────────────────

export interface UniversityWithRequiredFields {
  id: string;
  name: string;
  university_type_id?: string;
  university_type_name?: string;
  required_fields: ApplicationRequiredField[];
}
