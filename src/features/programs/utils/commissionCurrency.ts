/** Code the API stores when a program has no explicit commission currency. */
export const DEFAULT_COMMISSION_CURRENCY = "RM";

/**
 * Upper-cases a stored commission currency so it matches the CURRENCY select
 * options however it was written. Rows predating UBX-395 hold a mix of "RM"
 * (backend default / migration backfill) and "rm"/"usd" (older frontend
 * builds); a controlled <select> seeded with an unmatched value silently
 * shows its first option, which is how "RM" programs appeared as USD in the
 * edit form. "MYR" (the fee-currency spelling of ringgit) folds into "RM";
 * empty/null falls back to the default. Unknown codes pass through unchanged
 * so the select can surface them rather than hide them.
 */
export function normalizeCommissionCurrency(value: string | null | undefined): string {
  const code = (value ?? "").trim().toUpperCase();
  if (!code) return DEFAULT_COMMISSION_CURRENCY;
  return code === "MYR" ? DEFAULT_COMMISSION_CURRENCY : code;
}
