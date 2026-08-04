import type { ExchangeRate } from "../types";

export const NATIVE_CURRENCY = "MYR";
export const NATIVE_SYMBOL = "RM";

/** Native currency plus every currency the program's exchange_rates cover. */
export function getCurrencyOptions(exchangeRates: ExchangeRate[]): string[] {
  return [NATIVE_CURRENCY, ...exchangeRates.map((r) => r.to_currency)];
}

/** Rate to multiply a native-currency amount by to get `currency`. 1 for the native currency itself. */
export function getRate(currency: string, exchangeRates: ExchangeRate[]): number {
  if (currency === NATIVE_CURRENCY) return 1;
  return exchangeRates.find((r) => r.to_currency === currency)?.rate ?? 1;
}

export function convertAmount(amount: number | string, currency: string, exchangeRates: ExchangeRate[]): number {
  return Number(amount) * getRate(currency, exchangeRates);
}

/** Formats a native-currency amount converted into `currency`, e.g. "USD 8,540" or "RM 34,900". */
export function formatMoney(amount: number | string, currency: string, exchangeRates: ExchangeRate[]): string {
  const converted = convertAmount(amount, currency, exchangeRates);
  const formatted = converted.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return `${currency === NATIVE_CURRENCY ? NATIVE_SYMBOL : currency} ${formatted}`;
}

/**
 * Formats an amount that carries its own currency (e.g. commission).
 * Only participates in the selected-currency conversion when it's stated in the
 * native currency (or has no currency set) — an amount already in a fixed
 * currency like USD is shown as-is, never re-converted through the native rate table.
 */
export function formatCommission(
  amount: number,
  amountCurrency: string | null | undefined,
  displayCurrency: string,
  exchangeRates: ExchangeRate[]
): string {
  const code = (amountCurrency || NATIVE_CURRENCY).toUpperCase();
  if (code === NATIVE_CURRENCY || code === NATIVE_SYMBOL) {
    return formatMoney(amount, displayCurrency, exchangeRates);
  }
  return `${code} ${amount.toLocaleString()}`;
}
