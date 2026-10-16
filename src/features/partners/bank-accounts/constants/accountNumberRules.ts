/**
 * Expected account-number digit length per curated (Malaysian) bank, keyed
 * by the bank's `code` (e.g. "MBB0228" for Maybank) — not a fixed
 * one-size-fits-all rule. Ranges, not single lengths, since real-world
 * account lengths vary within a bank over time (legacy vs. current
 * formats); a range is safer than a single exact figure that could reject
 * a genuinely valid number.
 *
 * These are best-effort figures from general public banking references,
 * NOT pulled from an authoritative per-bank spec — if a specific length
 * turns out to be wrong for a bank actually in use, tighten/widen its
 * entry here rather than changing the validation logic itself.
 */
export const ACCOUNT_NUMBER_LENGTH_BY_BANK_CODE: Record<string, { min: number; max: number }> = {
  MBB0228: { min: 12, max: 12 }, // Maybank
  CIBB0227: { min: 10, max: 14 }, // CIMB Bank
  PBB0233: { min: 10, max: 10 }, // Public Bank
  RHB0218: { min: 10, max: 14 }, // RHB Bank
  HLB0224: { min: 11, max: 11 }, // Hong Leong Bank
  ARBK0203: { min: 13, max: 13 }, // AmBank
  BIMB0340: { min: 12, max: 14 }, // Bank Islam Malaysia
  BKRM0602: { min: 12, max: 14 }, // Bank Kerjasama Rakyat
  BMMB0341: { min: 11, max: 14 }, // Bank Muamalat Malaysia
  BSN0601: { min: 11, max: 12 }, // Bank Simpanan Nasional
  HBMB0122: { min: 9, max: 12 }, // HSBC Bank Malaysia
  MBSB0216: { min: 11, max: 15 }, // MBSB Bank
  OCBC0229: { min: 9, max: 12 }, // OCBC Bank Malaysia
  PHBM0134: { min: 10, max: 13 }, // Affin Bank
  SCBL0215: { min: 10, max: 12 }, // Standard Chartered Malaysia
  UOVB0226: { min: 10, max: 13 }, // United Overseas Bank Malaysia
};

/** Used when the selected bank's code isn't in the table above (e.g. a
 *  newly-added curated bank, or a manually-entered international one) —
 *  wide enough to not block a legitimate number, tight enough to catch
 *  obvious typos (way too short/long). */
export const DEFAULT_ACCOUNT_NUMBER_LENGTH = { min: 6, max: 20 };

export function validateAccountNumber(accountNumber: string, bankCode?: string | null): string | null {
  const trimmed = accountNumber.trim();
  if (!trimmed) return "Account number is required";
  if (!/^\d+$/.test(trimmed)) return "Account number must contain digits only";

  const rule = (bankCode && ACCOUNT_NUMBER_LENGTH_BY_BANK_CODE[bankCode]) || DEFAULT_ACCOUNT_NUMBER_LENGTH;
  if (trimmed.length < rule.min || trimmed.length > rule.max) {
    return rule.min === rule.max
      ? `Must be exactly ${rule.min} digits for this bank`
      : `Must be ${rule.min}–${rule.max} digits for this bank`;
  }
  return null;
}

/**
 * Validates IBAN format + check digits via the standard ISO 7064 MOD 97-10
 * algorithm — the authoritative way to verify an IBAN, since it catches
 * transposed/mistyped digits regardless of country, without needing a
 * hardcoded per-country length table (IBAN lengths vary 15-34 chars across
 * ~70 countries). Optional field: returns null (no error) when empty.
 */
export function validateIban(iban: string): string | null {
  const trimmed = iban.trim().toUpperCase().replace(/\s+/g, "");
  if (!trimmed) return null;

  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(trimmed)) {
    return "Enter a valid IBAN (2-letter country code, 2 check digits, then account identifier)";
  }

  // Move the first 4 characters to the end, convert letters to numbers
  // (A=10 ... Z=35), then check the whole number mod 97 === 1.
  const rearranged = trimmed.slice(4) + trimmed.slice(0, 4);
  const numeric = rearranged.replace(/[A-Z]/g, (ch) => String(ch.charCodeAt(0) - 55));

  let remainder = 0;
  for (const digit of numeric) {
    remainder = (remainder * 10 + Number(digit)) % 97;
  }

  return remainder === 1 ? null : "This IBAN's check digits don't match — please re-check it";
}
