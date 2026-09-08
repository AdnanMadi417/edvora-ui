import type { ExchangeRate } from "../types";

export const NATIVE_CURRENCY = "MYR";
export const NATIVE_SYMBOL = "RM";

/** Native currency plus every currency the program's exchange_rates cover. */
export function getCurrencyOptions(exchangeRates: ExchangeRate[]): string[] {
  return [NATIVE_CURRENCY, ...exchangeRates.map((r) => r.to_currency)];
}

/** Rate to multiply a native-currency amount by to get `currency`. 1 for the native currency itself, or when no currency is selected. */
export function getRate(currency: string | null, exchangeRates: ExchangeRate[]): number {
  if (!currency || currency === NATIVE_CURRENCY) return 1;
  return exchangeRates.find((r) => r.to_currency === currency)?.rate ?? 1;
}

export function convertAmount(amount: number | string, currency: string | null, exchangeRates: ExchangeRate[]): number {
  return Number(amount) * getRate(currency, exchangeRates);
}

/**
 * Converts an amount from any `sourceCurrency` to any `displayCurrency`,
 * pivoting through the native currency (MYR) since that's the only anchor
 * the exchange-rate table has rates for (MYR -> X, never X -> Y directly).
 * Same-currency is a pass-through. A missing rate for either leg falls
 * back to no conversion for that leg (rate 1), same as getRate elsewhere,
 * rather than guessing.
 */
export function convertBetween(
  amount: number | string,
  sourceCurrency: string | null | undefined,
  displayCurrency: string | null | undefined,
  exchangeRates: ExchangeRate[]
): number {
  const from = (sourceCurrency || NATIVE_CURRENCY).toUpperCase();
  const to = (displayCurrency || NATIVE_CURRENCY).toUpperCase();
  const value = Number(amount);
  if (from === to) return value;

  const inNative = from === NATIVE_CURRENCY ? value : value / getRate(from, exchangeRates);
  return to === NATIVE_CURRENCY ? inNative : inNative * getRate(to, exchangeRates);
}

/** Formats a native-currency amount converted into `currency`, e.g. "USD 8,540" or "RM 34,900". No selection (null) shows the native amount unconverted. */
export function formatMoney(amount: number | string, currency: string | null, exchangeRates: ExchangeRate[]): string {
  const converted = convertAmount(amount, currency, exchangeRates);
  const formatted = converted.toLocaleString(undefined, { maximumFractionDigits: 0 });
  return `${!currency || currency === NATIVE_CURRENCY ? NATIVE_SYMBOL : currency} ${formatted}`;
}

/**
 * Formats an amount that carries its own currency (e.g. commission),
 * converted into the selected display currency regardless of which
 * currency it's actually stated in.
 */
export function formatCommission(
  amount: number,
  amountCurrency: string | null | undefined,
  displayCurrency: string | null,
  exchangeRates: ExchangeRate[]
): string {
  return formatFeeAmount(amount, amountCurrency, displayCurrency, exchangeRates);
}

/**
 * Formats an amount that carries its own fixed currency (e.g. a yearly fee,
 * one-time fee, or commission), converted into whatever display currency is
 * selected — a fee stated in USD still follows the currency switcher, not
 * just ones stated in the native currency.
 */
export function formatFeeAmount(
  amount: number | string,
  amountCurrency: string | null | undefined,
  displayCurrency: string | null,
  exchangeRates: ExchangeRate[]
): string {
  // No currency selected yet — show each amount as stored, unconverted,
  // rather than assuming a display currency the user hasn't picked.
  if (!displayCurrency) {
    const code = (amountCurrency || NATIVE_CURRENCY).toUpperCase();
    return `${code === NATIVE_CURRENCY ? NATIVE_SYMBOL : code} ${Number(amount).toLocaleString()}`;
  }
  const converted = convertBetween(amount, amountCurrency, displayCurrency, exchangeRates);
  const formatted = converted.toLocaleString(undefined, { maximumFractionDigits: 0 });
  const code = displayCurrency.toUpperCase();
  return `${code === NATIVE_CURRENCY ? NATIVE_SYMBOL : code} ${formatted}`;
}
