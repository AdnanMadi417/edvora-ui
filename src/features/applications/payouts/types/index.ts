/** The commission payout covering a single application — shown on
 *  `GET .../applications/{id}` as `partner_payout`. Intentionally a subset
 *  of the full `Payout` record (no bank_account_id/payment_method_id) — the
 *  backend already redacts `paid_amount` to null for a restricted agency
 *  member, same as `ApplicationCommissionItem.amount`; there's no separate
 *  client-side hide/show logic for that. */
export interface PartnerPayout {
  id: string;
  bank_reference: string;
  paid_at: string;
  currency: string;
  paid_amount: number | null;
  source_amount: number | null;
  source_currency: string;
  voided_at: string | null;
  void_reason: string | null;
  created_at: string;
  receipt_file_key: string | null;
  receipt_file_url: string | null;
}

export interface PayoutItem {
  application_id: string;
  application_commission_id: string;
  paid_amount: number;
  source_amount: number;
  source_currency: string;
}

/** A full payout record — one application (1 item) or a bulk "Finance
 *  Queue" payout (N items) — same shape either way. */
export interface Payout {
  id: string;
  partner_id: string;
  bank_account_id: string;
  payment_method_id: string;
  recorded_by_user_id: string;
  bank_reference: string;
  receipt_file_key: string | null;
  receipt_file_url: string | null;
  paid_at: string;
  currency: string;
  voided_at: string | null;
  void_reason: string | null;
  voided_by_user_id: string | null;
  created_at: string;
  items: PayoutItem[];
}

export interface PayoutLine {
  application_id: string;
  paid_amount: string;
}

/** Void always replaces — there is no "just undo it" mode. `new_lines` must
 *  cover exactly the same set of applications as the payout being voided. */
export interface VoidPayoutPayload {
  void_reason: string;
  new_bank_account_id: string;
  new_payment_method_id: string;
  new_bank_reference: string;
  new_paid_at: string;
  new_currency: string;
  new_lines: PayoutLine[];
  new_receipt_file_key: string;
  new_receipt_file_url: string;
}

export interface RecordBulkPayoutPayload {
  bank_account_id: string;
  payment_method_id: string;
  bank_reference: string;
  paid_at: string;
  currency: string;
  receipt_file_key: string;
  receipt_file_url: string;
  lines: PayoutLine[];
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string | null;
}

export type WaitingOn = "us" | "university" | "nobody" | "disputed";

/** A row in the admin Finance Queue — one per `ApplicationCommission`. Three
 *  independent amounts: `commission_*` is the agreed figure (fixed at
 *  application creation), `received_*` is what the university actually sent
 *  (null until a pay-in is recorded), `paid_*` is what we actually
 *  transferred to the partner (null until a payout is recorded). Both are
 *  independent of `waiting_on` — a settled or disputed row can still show
 *  them. */
export interface CommissionQueueItem {
  application_commission_id: string;
  application_id: string;
  reference: string;
  student_name: string;
  partner_id: string;
  partner_name: string | null;
  university_name: string;
  program_name: string;
  commission_amount: number | null;
  commission_currency: string;
  received_amount: number | null;
  received_currency: string | null;
  paid_amount: number | null;
  paid_currency: string | null;
  waiting_on: WaitingOn;
  days_waiting: number | null;
  typical_days_from: number | null;
  typical_days_to: number | null;
  last_fact_type: "pay_in" | "arrival" | "payout" | "dispute" | null;
  last_fact_date: string | null;
  last_fact_reference: string | null;
}

export interface CommissionQueueResponse {
  items: CommissionQueueItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface PayoutStatementApplication {
  application_id: string;
  student_name: string;
}

export interface AgreedTotal {
  currency: string;
  amount: number;
}

/** One row per payout (covering 1+ applications) on a partner's admin
 *  Statement tab — the admin counterpart of the partner self-service
 *  Statement, shaped around payouts rather than commissions. `can_void`
 *  already accounts for role (always false for an account manager) and
 *  the void endpoint's own guards — use it directly, never re-derive it. */
export interface PayoutStatementItem {
  payout_id: string;
  bank_reference: string;
  payment_method_name: string;
  paid_at: string;
  currency: string;
  applications: PayoutStatementApplication[];
  amount_sent: number;
  agreed_totals: AgreedTotal[];
  recorded_by_name: string;
  voided_at: string | null;
  void_reason: string | null;
  voided_by_name: string | null;
  receipt_file_url: string | null;
  /** Signed for download via storage — readable by anyone who can see the
   *  statement, unlike GET /admin/payouts/{id} (FINANCE only). */
  receipt_file_key: string | null;
  can_void: boolean;
}

export interface PayoutStatementResponse {
  items: PayoutStatementItem[];
  total: number;
  page: number;
  page_size: number;
}
