// ── Core Entities ─────────────────────────────────────────────────────────────

export interface FieldOfStudy {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
}

export interface ProgramBranch {
  id: string;
  name: string;
  location: string;
  state: string;
  state_id?: string;
}

export interface ProgramUniversity {
  id: string;
  name: string;
  country: string;
  is_active: boolean;
  description?: string | null;
  state?: string | null;
  intake_months?: string[] | null;
  logo_file_key?: string;
  logo_file_url?: string;
}

export interface Scholarship {
  id: string;
  type: string;
  coverage_percent: number;
  max_amount: number;
  name: string;
  description: string;
  conditions: string[];
}

export interface Commission {
  amount: number | null;
  currency?: string | null;
  type: string | null;
  notes: string | null;
  expected_commission_from: string;
  expected_commission_to: string;
}

export interface YearlyFee {
  year: number;
  fee: number | string;
}

export interface OneTimeFee {
  description: string;
  fee: number | string;
}

// ── Program ───────────────────────────────────────────────────────────────────

export interface Program {
  id: string;
  name: string;

  tuition_fee: number | null;
  first_year_tuition: number | null;

  intake_dates: string[] | null;
  next_intake: string | null;

  duration: number | null;

  branch: ProgramBranch;
  yearly_fees: YearlyFee[];
  one_time_fees: OneTimeFee[];

  english_required_score: number | null;

  overview: string | null;
  curriculum: string | null;

  is_on_campus: boolean;
  is_online: boolean;
  class_type?: "physical" | "online" | string;

  has_scholarship: boolean;
  scholarships: Scholarship[];

  commission: Commission | null;
  commission_amount?: number | null;
  commission_currency?: string | null;

  qualification_level: "bachelor" | "master" | "phd" | string;

  field_of_study: FieldOfStudy;
  university: ProgramUniversity;

  required_documents?: {
    id: string;
    type: string;
    code: string;
    description: string;
    is_init_app_doc: string;
    is_required_init_app_doc: boolean;
    is_required_for_init: boolean;
  }[];
}

export interface GetProgramsParams {
  field_of_study_id?: string;
  qualification_id?: string;
  qualification_level?: string;
  state_id?: string;
  university_id?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

// ── State ─────────────────────────────────────────────────────────────────────

export interface StateOption {
  id: string;
  name: string;
}

// ── Payloads ──────────────────────────────────────────────────────────────────

export interface CreateProgramPayload {
  uni_id: string;
  branch_id: string;
  field_of_study_id: string;
  name: string;
  tuition_fee: number;
  intake_dates: string[];
  duration: number;
  english_required_score: string;
  overview: string;
  curriculum: string;
  is_on_campus: boolean;
  is_online: boolean;
  has_scholarship: boolean;

  commission_amount: number;
  commission_currency?: string;
  commission_type_id: string;
  commission_notes: string;
  expected_commission_from: number | null;
  expected_commission_to: number | null;

  qualification_id: string;

  yearly_fees?: Array<{ year: number; fee: number }>;
  one_time_fees?: Array<{ description: string; fee: number }>;

  scholarships?: Array<{
    type?: number | null;
    coverage_percent: number;
    max_amount: number;
    name: string;
    description: string;
    conditions: string[];
  }>;
}

export interface UpdateProgramPayload {
  uni_id: string;
  branch_id: string;
  field_of_study_id: string;
  name: string;
  tuition_fee: number;
  intake_dates: string[];
  duration: number;
  english_required_score: string;
  overview: string;
  curriculum: string;
  is_on_campus: boolean;
  is_online: boolean;
  has_scholarship: boolean;
  qualification_id: string;

  commission_amount?: number | null;
  commission_currency?: string;
  commission_type_id?: string | null;
  commission_notes?: string | null;
  expected_commission_from?: number | null;
  expected_commission_to?: number | null;

  yearly_fees?: Array<{ year: number; fee: number }>;
  one_time_fees?: Array<{ description: string; fee: number }>;

  scholarships?: Array<{
    type?: number | null;
    coverage_percent: number;
    max_amount: number;
    name: string;
    description: string;
    conditions: string[];
  }>;
}

export interface BatchUpdateProgramPayload {
  program_ids: string[];

  commission_amount?: number;
  commission_currency?: string;
  commission_type_id?: string;
  commission_notes?: string;
  expected_commission_from?: number;
  expected_commission_to?: number;

  tuition_fee?: number;
  visa_fee_amount?: number;

  intake_dates?: string[];
  english_required_score?: string;

  yearly_fees?: Array<{ year: number; fee: number }>;
  one_time_fees?: Array<{ description: string; fee: number }>;

  scholarships?: Array<{
    type?: number | null;
    coverage_percent: number;
    max_amount: number;
    currency?: string;
    name: string;
    description: string;
    conditions: string[];
  }>;

  branch_id?: string | null;
}

export interface UpdateDefaultVisaFeePayload {
  amount: number;
}
