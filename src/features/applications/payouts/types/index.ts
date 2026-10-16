/** The commission payout covering a single application — shown on
 *  `GET .../applications/{id}` as `partner_payout`. Intentionally a subset
 *  of the full `Payout` record (no bank_account_id/payment_method_id/
 *  receipt fields) — the backend already redacts `paid_amount` to null for
 *  a restricted agency member, same as `ApplicationCommissionItem.amount`;
 *  there's no separate client-side hide/show logic for that. */
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
