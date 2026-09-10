// ── Core Entities ─────────────────────────────────────────────────────────────

// Only meaningful for master/phd programs. Requests and responses both use
// these strings (breaking change: requests used to take 1/2/3 — the backend
// now rejects the old ints with a 422).
export type CourseType = "course_work" | "research" | "mixed_mode";

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
  state_id: string;
}

export interface ProgramUniversity {
  id: string;
  name: string;
  country: string;
  is_active: boolean;
  description: string;
  logo_file_key: string;
  logo_file_url: string;
  intake_months: number[];
  university_type_id: string;
  university_type_name: string;
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

// Uppercase per backend contract — sent and received exactly as-is, no other values accepted.
export type Currency = "MYR" | "USD";

export const CURRENCY_OPTIONS: { value: Currency; label: string }[] = [
  { value: "MYR", label: "MYR" },
  { value: "USD", label: "USD" },
];

export interface YearlyFee {
  year: number;
  fee: number | string;
}

export interface ExchangeRate {
  to_currency: string;
  rate: number;
}

export interface OneTimeFee {
  description: string;
  fee: number | string;
  currency?: Currency;
}

// ── Program ───────────────────────────────────────────────────────────────────

export interface Program {
  id: string;
  name: string;

  tuition_fee: number | null;
  visa_fee_amount: number | null;
  first_year_tuition: number | null;

  // Recurring calendar months (1–12) the program takes intakes in — no year, no day.
  intake_months: number[] | null;
  next_intake_month: number | null;

  duration: number | null;

  branch: ProgramBranch;
  // Applies to every entry in yearly_fees — there is no per-year override.
  yearly_fee_currency: Currency;
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

  qualification_id: string;
  qualification_level: "bachelor" | "master" | "phd" | string;
  // Only ever set for master/phd programs — null for every other qualification.
  course_type: CourseType | null;

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
  include_inactive_universities?: boolean;
  field_of_study_id?: string;
  qualification_id?: string;
  state_id?: string;
  university_id?: string;
  search?: string;
  has_scholarship?: boolean;
  // Programs with no course_type (i.e. not master/phd) never match any value here.
  course_type?: CourseType;
  class_type?: "physical" | "online";
  sort_by?: "commission_asc" | "commission_desc" | "tuition_asc" | "tuition_desc";
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
  intake_months: number[];
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
  // Only legal when qualification_id resolves to a master/phd qualification —
  // omit entirely (or send null) for every other qualification.
  course_type?: CourseType | null;

  // Defaults to "MYR" on the backend if omitted.
  yearly_fee_currency?: Currency;
  yearly_fees?: Array<{ year: number; fee: number }>;
  // Each item's currency defaults to "MYR" on the backend if omitted.
  one_time_fees?: Array<{ description: string; fee: number; currency?: Currency }>;

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
  intake_months: number[];
  duration: number;
  english_required_score: string;
  overview: string;
  curriculum: string;
  is_on_campus: boolean;
  is_online: boolean;
  has_scholarship: boolean;
  qualification_id: string;
  // null resets to the course_work default (for a master/phd program)
  // rather than clearing — omit the key entirely to leave the existing
  // value untouched.
  course_type?: CourseType | null;

  commission_amount?: number | null;
  commission_currency?: string;
  commission_type_id?: string | null;
  commission_notes?: string | null;
  expected_commission_from?: number | null;
  expected_commission_to?: number | null;

  // Omit entirely to leave unchanged — sending null is ignored, not a reset.
  yearly_fee_currency?: Currency;
  // When provided, fully replaces the existing list (delete-then-insert): resend
  // every item's description/fee/currency, not just the changed ones.
  yearly_fees?: Array<{ year: number; fee: number }>;
  one_time_fees?: Array<{ description: string; fee: number; currency?: Currency }>;

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

  intake_months?: number[];
  english_required_score?: string;
  // All-or-nothing: rejected for the whole batch if any selected program
  // isn't master/phd. null resets every selected program to the
  // course_work default.
  course_type?: CourseType | null;

  // Applies to every selected program. Omit entirely to leave unchanged —
  // sending null is ignored, not a reset.
  yearly_fee_currency?: Currency;
  // When provided, fully replaces the existing list (delete-then-insert): resend
  // every item's description/fee/currency, not just the changed ones.
  yearly_fees?: Array<{ year: number; fee: number }>;
  one_time_fees?: Array<{ description: string; fee: number; currency?: Currency }>;

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

// POST /knowledge-hub/programs/{id}/copy — deep-copies the program into
// another branch of the SAME university. 201 returns the same wrapped shape
// as the program-detail GET ({ program, required_documents, commission,
// exchange_rates }).
export interface CopyProgramToBranchPayload {
  branch_id: string;
}

export interface UpdateDefaultVisaFeePayload {
  amount: number;
}
