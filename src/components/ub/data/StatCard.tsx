import React, { type ReactNode } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import Tag from "components/ub/data/Tag";
import Skeleton from "components/ub/feedback/Skeleton";

export interface StatCardDelta {
  /** Signed change, e.g. 12 or -3.5. Zero renders as neutral. */
  value: number;
  /** Appended to the number. Default "%". */
  unit?: string;
  /** Which direction is good news. Default "up" (set "down" for e.g. overdue documents). */
  goodWhen?: "up" | "down";
}

export interface StatCardProps {
  label: string;
  /** 20px icon next to the label (lucide element). */
  icon?: ReactNode;
  /** Pre-formatted value, e.g. "RM4,200" or "128". */
  value: ReactNode;
  delta?: StatCardDelta;
  /** Caption after the delta, e.g. "vs last intake". */
  context?: string;
  /** Optional sparkline points, oldest first. */
  sparkline?: number[];
  /** Accessible description for the sparkline. Without it the sparkline is decorative. */
  sparklineLabel?: string;
  loading?: boolean;
  className?: string;
}

const MINUS = "−";

/** "+12%", "−3%", "0%". Uses a true minus sign. */
export function formatDelta({ value, unit = "%" }: StatCardDelta): string {
  const abs = Math.abs(value).toLocaleString("en-MY", { maximumFractionDigits: 1 });
  if (value > 0) return `+${abs}${unit}`;
  if (value < 0) return `${MINUS}${abs}${unit}`;
  return `${abs}${unit}`;
}

/** Inline SVG sparkline: no chart library, scales to its container, follows the theme via currentColor. */
function Sparkline({ points, label }: { points: number[]; label?: string }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * 100;
      const y = 30 - ((p - min) / range) * 28;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
  return (
    <svg
      viewBox="0 0 100 32"
      preserveAspectRatio="none"
      className="mt-4 h-8 w-full text-ub-chart-1"
      {...(label ? { role: "img", "aria-label": label } : { "aria-hidden": true })}
    >
      <path d={`${d} L100,32 L0,32 Z`} className="fill-current opacity-10" />
      <path d={d} fill="none" stroke="currentColor" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/** KPI card (brief §4.4) on light glass: label + icon, data-xl value, delta tag, context, sparkline. */
export default function StatCard({ label, icon, value, delta, context, sparkline, sparklineLabel, loading, className }: StatCardProps) {
  const surface = `ub-glass-light rounded-ub-lg p-4 md:p-6 text-ub-text-primary ${className ?? ""}`;

  if (loading) {
    return (
      <div className={surface} aria-busy="true">
        <span className="sr-only">Loading {label}</span>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-3 h-10 w-24" />
        <Skeleton className="mt-3 h-6 w-40" />
        {sparkline && <Skeleton className="mt-4 h-8 w-full" />}
      </div>
    );
  }

  let deltaTag: ReactNode = null;
  if (delta) {
    const dir = delta.value > 0 ? "up" : delta.value < 0 ? "down" : "neutral";
    const good = delta.goodWhen ?? "up";
    const tone = dir === "neutral" ? "neutral" : dir === good ? "positive" : "danger";
    const Icon = dir === "up" ? TrendingUp : dir === "down" ? TrendingDown : Minus;
    const words = dir === "up" ? "Up" : dir === "down" ? "Down" : "No change,";
    deltaTag = (
      <Tag tone={tone} icon={<Icon />} className="ub-tabular">
        <span className="sr-only">{words} </span>
        {formatDelta(delta)}
      </Tag>
    );
  }

  return (
    <div className={surface}>
      <p className="flex items-center gap-2 text-ub-label-md text-ub-text-secondary">
        {icon && <span aria-hidden="true" className="flex shrink-0 items-center text-ub-icon-interactive [&>svg]:h-5 [&>svg]:w-5">{icon}</span>}
        {label}
      </p>
      <p className="ub-tabular mt-2 text-ub-data-xl text-ub-text-primary">{value}</p>
      {(deltaTag || context) && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-ub-caption text-ub-text-tertiary">
          {deltaTag}
          {context && <span>{context}</span>}
        </p>
      )}
      {sparkline && <Sparkline points={sparkline} label={sparklineLabel} />}
    </div>
  );
}
