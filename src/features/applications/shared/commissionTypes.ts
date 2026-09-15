// Shared across the three role-specific ApplicationCommission.tsx components
// (partner/account-manager/admin) — one canonical shape instead of each
// reading `application.commissions` through an untyped `any`.
//
// Mirrors the backend's CommissionOut (application_details.py) exactly:
// id/status/amount/created_at were already sent; currency, commission_type_id,
// commission_type, notes, expected_commission_from/to are new additions.
export interface ApplicationCommissionItem {
  id: string;
  /** "pending" | "approved" | "released" | "paid" per the backend, but not
   *  a closed enum here — an unrecognized value should still render (as
   *  its raw text), not disappear. */
  status: string;
  /** Still redacted to null for a restricted agency member on the partner
   *  endpoint — that's existing backend behavior, unrelated to this type. */
  amount: number | null;
  /** Defaults to "RM" on the backend when unset — never actually null,
   *  per the API contract, but code defensively anyway. */
  currency: string;
  commission_type_id: string | null;
  /** e.g. "Percentage", "One time per year". */
  commission_type: string | null;
  notes: string | null;
  /** Day-count window, not a date — same convention as the program-level
   *  Commission.expected_commission_from/to already shown elsewhere. */
  expected_commission_from: number | null;
  expected_commission_to: number | null;
  created_at: string;
}

/** No currency switcher in this section — shown exactly as the API sends
 *  it, not converted. */
export function formatCommissionAmount(amount: number, currency: string): string {
  return `${currency} ${amount.toLocaleString()}`;
}

/** expected_commission_from/to is a day-count window, not a date — same
 *  convention as the program-level Commission fields, but the wording
 *  doesn't assert "after enrollment" the way that one does, since this
 *  field's anchor point in the application-level payment workflow hasn't
 *  been confirmed. */
export function formatCommissionTimeline(
  from: number | null,
  to: number | null
): string | null {
  if (from == null && to == null) return null;
  if (from != null && to != null) return `Expected within ${from}–${to} days`;
  if (from != null) return `Expected from ${from} days`;
  return `Expected within ${to} days`;
}
