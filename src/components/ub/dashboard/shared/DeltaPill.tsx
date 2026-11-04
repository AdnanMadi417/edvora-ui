import clsx from "clsx";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

export interface DeltaPillProps {
  /** Signed change, e.g. 12 or -4.5. */
  value: number;
  /** Default "%". Use "" for counts ("+3"). */
  unit?: string;
  /** Whether a rise is good (applications) or bad (days in stage). Default "up". */
  goodWhen?: "up" | "down";
  /** Period it compares to, read by screen readers: "vs last month". */
  comparedTo?: string;
  /** On a highlighted (brand) card. */
  onBrand?: boolean;
  className?: string;
}

/** Pure: "+12%", "−4.5%", "0%" (real minus sign). */
export function formatDelta(value: number, unit = "%"): string {
  const n = Math.abs(value).toLocaleString("en-MY", { maximumFractionDigits: 1 });
  return `${value > 0 ? "+" : value < 0 ? "−" : ""}${n}${unit}`;
}

/** Pure: success when the change is the good direction, danger when bad, neutral at zero. */
export function deltaTone(value: number, goodWhen: "up" | "down" = "up"): "success" | "danger" | "neutral" {
  if (value === 0) return "neutral";
  return (value > 0) === (goodWhen === "up") ? "success" : "danger";
}

const TONE = {
  success: "border-ub-delta-up-border bg-ub-delta-up-bg text-ub-delta-up-text",
  danger: "border-ub-tone-danger-border bg-ub-tone-danger-bg text-ub-tone-danger-text",
  neutral: "border-ub-tone-neutral-border bg-ub-tone-neutral-bg text-ub-tone-neutral-text",
};

/** Change pill (+12%): arrow + signed value, coloured by whether the change is good. Never colour alone. */
export default function DeltaPill({ value, unit = "%", goodWhen = "up", comparedTo, onBrand = false, className }: DeltaPillProps) {
  const tone = deltaTone(value, goodWhen);
  const Icon = value > 0 ? ArrowUpRight : value < 0 ? ArrowDownRight : Minus;
  return (
    <span className={clsx("ub-tabular inline-flex h-6 shrink-0 items-center gap-1 rounded-ub-full border px-2 text-ub-label-sm", onBrand ? "border-transparent bg-ub-action-primary-pressed text-ub-action-primary-text" : TONE[tone], className)}>
      <Icon className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden="true" />
      <span aria-hidden="true">{formatDelta(value, unit)}</span>
      <span className="sr-only">
        {value === 0 ? "No change" : `${value > 0 ? "Up" : "Down"} ${formatDelta(Math.abs(value), unit).replace(/^\+/, "")}`}
        {comparedTo ? ` ${comparedTo}` : ""}
      </span>
    </span>
  );
}
