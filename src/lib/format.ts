// Display formats from the brief (§8): one place for how numbers, money,
// dates and times read across the Unibexs System.
//   Date      12 Jun 2026 (relative under 7 days: "2 hours ago")
//   Time      2:30 pm
//   Currency  RM4,200 (no space), SGD 3,000
//   Numbers   3,500

import { parseDate, formatRelative } from "components/ub/data/formatting/appDateUtils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Currencies written as a prefix with no space (brief: "RM4,200"). Others get a space: "SGD 3,000". */
const ATTACHED_PREFIX = new Set(["RM", "MYR"]);

export interface NumberFormatOptions {
  /** Fixed decimals. Default: 0 when the value is whole, else 2. */
  decimals?: number;
}

/** 3500 → "3,500". Western numerals in every locale (brief §11.7). */
export function formatNumber(value: number, { decimals }: NumberFormatOptions = {}): string {
  const places = decimals ?? (Number.isInteger(value) ? 0 : 2);
  return value.toLocaleString("en-US", { minimumFractionDigits: places, maximumFractionDigits: places });
}

export interface CurrencyFormatOptions extends NumberFormatOptions {
  /** "RM" (default), "MYR", "SGD", "USD"… */
  currency?: string;
  /** Show "+" for positive values, e.g. for deltas. */
  signed?: boolean;
}

/** 4200 → "RM4,200"; 3000 SGD → "SGD 3,000"; -150 → "-RM150". */
export function formatCurrency(value: number, { currency = "RM", decimals, signed = false }: CurrencyFormatOptions = {}): string {
  const code = currency === "MYR" ? "RM" : currency;
  const amount = formatNumber(Math.abs(value), { decimals });
  const prefix = ATTACHED_PREFIX.has(code) ? code : `${code} `;
  const sign = value < 0 ? "-" : signed && value > 0 ? "+" : "";
  return `${sign}${prefix}${amount}`;
}

/** 0.124 → "12.4%" (pass a fraction) — or set `isFraction: false` for 12.4 → "12.4%". */
export function formatPercent(value: number, { decimals, isFraction = true }: NumberFormatOptions & { isFraction?: boolean } = {}): string {
  return `${formatNumber(isFraction ? value * 100 : value, { decimals: decimals ?? 1 })}%`;
}

/** "12 Jun 2026". Returns the fallback for empty or invalid input. */
export function formatDisplayDate(value: string | Date | null | undefined, fallback = "—"): string {
  const date = parseDate(value);
  if (!date) return fallback;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

/** "2:30 pm". */
export function formatTime(value: string | Date | null | undefined, fallback = "—"): string {
  const date = parseDate(value);
  if (!date) return fallback;
  const h = date.getHours();
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h % 12 || 12}:${m} ${h < 12 ? "am" : "pm"}`;
}

/** Relative under 7 days ("2 hours ago", "Yesterday"), otherwise "12 Jun 2026" (brief §8). */
export function formatSmartDate(value: string | Date | null | undefined, now: Date = new Date(), fallback = "—"): string {
  const date = parseDate(value);
  if (!date) return fallback;
  const days = Math.abs(now.getTime() - date.getTime()) / 86_400_000;
  return days < 7 ? formatRelative(date, "en-GB") : formatDisplayDate(date, fallback);
}
