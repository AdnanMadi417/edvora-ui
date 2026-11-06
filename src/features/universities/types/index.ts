// ── University ────────────────────────────────────────────────────────────────

export interface University {
  id: string;
  name: string;
  country: string;
  is_active: boolean;
  description: string;
  logo_file_key: string;
  logo_file_url: string;
  university_type_id: string;
  university_type_name: string;
  intake_months: number[];
  /** true = public university, false = private. */
  is_public: boolean;
  has_language_center: boolean;
  /** Data-entry/admin only — never sent to the partner-facing endpoints. */
  is_hidden: boolean;
}

export interface UniversityDetails {
  id: string;
  name: string;
  country: string;
  is_active: boolean;
  logo_file_key: string;
  logo_file_url: string;
  description?: string;
  university_type_id: string;
  university_type_name: string;
  intake_months?: number[];
  is_public: boolean;
  has_language_center: boolean;
  is_hidden: boolean;
}

export interface UniversityResponse {
  university: UniversityDetails;
  branches: Branch[];
}

// PUT /knowledge-hub/universities/{id} is a partial update — sending only
// this leaves every other field untouched.
export interface SetUniversityHiddenPayload {
  is_hidden: boolean;
}

export interface CreateUniversityPayload {
  name: string;
  country: string;
  is_active: boolean;
  logo_file_key: string;
  logo_file_url: string;
  university_type_id: string;
  description: string;
  intake_months: number[];
  branches: CreateBranchPayload[];
  /** Optional — all default to false if omitted. */
  is_public?: boolean;
  has_language_center?: boolean;
  is_hidden?: boolean;
}

export interface UpdateUniversityPayload {
  name: string;
  country: string;
  is_active: boolean;
  description?: string;
  logo_file_key: string;
  logo_file_url: string;
  intake_months?: number[];
  university_type_id: string;
  branches: UpdateBranchPayload[];
  /** Optional, partial-update semantics — omit to leave unchanged. Don't
   *  send `false` just to "reset" it: false is a real value that applies. */
  is_public?: boolean;
  has_language_center?: boolean;
  is_hidden?: boolean;
}

// ── Branch ────────────────────────────────────────────────────────────────────

export interface Branch {
  id: string;
  name: string;
  location: string;
  state_id: string;
  state: string;
}

export interface CreateBranchPayload {
  name: string;
  location: string;
  state_id: string;
}

export interface UpdateBranchPayload {
  id?: string;
  name: string;
  location: string;
  state_id: string;
}

// ── Payment Methods ───────────────────────────────────────────────────────────

export interface UniversityPaymentMethod {
  id: string;
  university_id: string;
  payment_method_id: string;
  payment_method_name: string;
  instructions?: string;
  currency?: string;
  is_active: boolean;
}

export interface AssignPaymentMethodPayload {
  payment_method_id: string;
  instructions?: string;
  currency?: string;
  is_active?: boolean;
}

export interface UpdatePaymentMethodPayload {
  payment_method_id: string;
  instructions?: string;
  currency?: string;
  is_active?: boolean;
}

// Compatibility exports; configuration types are owned by the sub-feature.
export * from "../configuration/types";
