import { HTMLAttributes } from "react";
import clsx from "clsx";
import { formatCurrency, formatNumber, type CurrencyFormatOptions } from "lib/format";

export interface AmountProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  value: number;
  /** "RM" (default), "SGD", "USD"… */
  currency?: CurrencyFormatOptions["currency"];
  decimals?: number;
  /** Show "+" on positive values and color the sign: success for gains, danger for losses. */
  signed?: boolean;
}

/** Money in the brief's format (RM4,200 · SGD 3,000), always with tabular numerals. */
export default function Amount({ value, currency = "RM", decimals, signed, className, ...rest }: AmountProps) {
  return (
    <span
      className={clsx("ub-tabular whitespace-nowrap", signed && value > 0 && "text-ub-tone-success-text", signed && value < 0 && "text-ub-tone-danger-text", className)}
      {...rest}
    >
      {formatCurrency(value, { currency, decimals, signed })}
    </span>
  );
}

export interface NumeralProps extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  value: number;
  decimals?: number;
  /** Text after the number, e.g. "%" or " students". */
  suffix?: string;
}

/** Counts and KPIs: "3,500" with tabular numerals. */
export function Numeral({ value, decimals, suffix, className, ...rest }: NumeralProps) {
  return (
    <span className={clsx("ub-tabular whitespace-nowrap", className)} {...rest}>
      {formatNumber(value, { decimals })}
      {suffix}
    </span>
  );
}
