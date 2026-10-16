/** The university's inbound pay-in for an application's commission —
 *  `GET .../applications/{id}` always returns the single most recently
 *  created row, voided or not; check `voided_at` before treating
 *  amount/currency as money actually received. */
export interface UniversityPayIn {
  id: string;
  payment_date: string;
  amount: number;
  currency: string;
  payment_reference: string;
  voided_at: string | null;
  void_reason: string | null;
  created_at: string;
}

export interface VoidPayInPayload {
  void_reason: string;
  new_payment_date?: string;
  new_amount?: string;
  new_currency?: string;
  new_payment_reference?: string;
}
