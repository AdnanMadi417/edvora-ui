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
  created_at: string;
  updated_at: string;
}

export interface CreatePartnerBankAccountPayload {
  bank_id?: string;
  intl_bank_name?: string;
  intl_bank_country?: string;
  intl_bank_swift?: string;
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
