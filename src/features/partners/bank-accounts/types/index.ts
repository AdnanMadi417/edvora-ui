// Partner bank accounts — GET/POST /partners/{partner_id}/bank-accounts,
// PATCH .../{account_id} — a partner's payout account. At most one ACTIVE
// row per partner (not per currency): treat the list response as "0 or 1",
// not a multi-row table. Update always creates a new row and retires the
// old one (same account_id lineage), so "Edit" and "Replace" are the same
// action from the UI's side.

export interface PartnerBankAccount {
  id: string;
  partner_id: string;
  /** Set when the account uses a curated Banks-list entry — XOR with the
   *  intl_bank_* fields below. */
  bank_id: string | null;
  intl_bank_name: string | null;
  /** ISO 3166-1 alpha-2, e.g. "ZW" — set only alongside intl_bank_name. */
  intl_bank_country: string | null;
  intl_bank_swift: string | null;
  account_holder_name: string;
  account_number: string;
  iban: string | null;
  /** "RM" or "USD" (case-insensitive on write); fixed for the account's
   *  lineage — can't be changed via PATCH. */
  currency: string;
  beneficiary_address: string | null;
  beneficiary_phone: string | null;
  beneficiary_id_number: string | null;
  bank_branch_address: string | null;
  bank_branch_code: string | null;
  intermediary_bank_name: string | null;
  intermediary_bank_swift: string | null;
  is_active: boolean;
  recorded_by_user_id: string;
  recorded_by_name: string;
  recorded_by_email: string;
  created_at: string;
}

export interface CreatePartnerBankAccountPayload {
  bank_id?: string;
  /** Explicitly null these (don't just omit them) when submitting a
   *  bank_id — PATCH treats an omitted field as "leave unchanged", so an
   *  account that was previously manually-entered still has these set on
   *  the existing row; omitting them here would make the backend see
   *  "both bank_id and intl_bank_name present" after the merge and reject
   *  it with bank_selection_invalid. */
  intl_bank_name?: string | null;
  intl_bank_country?: string | null;
  intl_bank_swift?: string | null;
  account_holder_name: string;
  account_number: string;
  iban?: string;
  currency: string;
  beneficiary_address?: string;
  beneficiary_phone?: string;
  beneficiary_id_number?: string;
  bank_branch_address?: string;
  bank_branch_code?: string;
  intermediary_bank_name?: string;
  intermediary_bank_swift?: string;
}

/** Same shape as create, minus currency (fixed for the account's lineage).
 *  True partial update — only send the fields being changed. */
export type UpdatePartnerBankAccountPayload = Partial<Omit<CreatePartnerBankAccountPayload, "currency">>;
