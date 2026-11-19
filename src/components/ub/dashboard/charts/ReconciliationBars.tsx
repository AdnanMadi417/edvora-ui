import clsx from "clsx";
import { CHART_PALETTE } from "config/chartPalette";
import { SEGMENT_CLASS, SEGMENT_ROW_CLASS, SEGMENT_TRACK_CLASS } from "./segments";

export interface ReconciliationPart {
  key: string;
  /** e.g. "Classified", "Not recorded". */
  label: string;
  value: number;
  /** A CSS colour; defaults to the chart palette in order. */
  color?: string;
}

export interface ReconciliationRow {
  /** e.g. "2024". */
  label: string;
  /** Parts that add up to `total`, in the order they sit on the bar. */
  parts: ReconciliationPart[];
  /** The official total. A dev warning fires when the parts don't add up to it. */
  total: number;
}

export interface ReconciliationBarsProps {
  rows: ReconciliationRow[];
  /** Noun for screen readers, e.g. "students". */
  unit: string;
  /** All bars share one scale (the largest total), so a smaller period reads as a shorter bar. */
  sharedScale?: boolean;
  formatValue?: (value: number) => string;
  /**
   * columns: periods side by side (a few years). rows: one compact line per
   * period (months), with the parts' legend once on top. Default: rows past 4 periods.
   */
  layout?: "columns" | "rows";
  className?: string;
}

const num = (value: number) => value.toLocaleString();

/**
 * Each period's total as one bar split into its parts (e.g. classified +
 * not recorded = official total), with the total on the end and each part's
 * count under it. Bars share one scale by default; the empty track is the gap
 * to the largest period. Rows sit side by side and wrap on small screens.
 */
export default function ReconciliationBars({ rows, unit, sharedScale = true, formatValue = num, layout, className }: ReconciliationBarsProps) {
  const max = Math.max(1, ...rows.map((r) => r.total));
  const colored = (row: ReconciliationRow) => row.parts.map((p, i) => ({ ...p, color: p.color ?? CHART_PALETTE[i % CHART_PALETTE.length] }));
  const check = (row: ReconciliationRow) => {
    const sum = row.parts.reduce((s, p) => s + Math.max(0, p.value), 0);
    if (process.env.NODE_ENV !== "production" && sum !== row.total)
      console.warn(`[ReconciliationBars] ${row.label}: parts add up to ${sum}, total is ${row.total}`);
  };
  const summaryOf = (row: ReconciliationRow) =>
    `${row.label}: ${formatValue(row.total)} ${unit}. ${row.parts.map((p) => `${p.label} ${formatValue(p.value)}`).join(", ")}`;
  const bar = (row: ReconciliationRow, scale: number, className: string) => (
    <div aria-hidden="true" className={clsx(SEGMENT_ROW_CLASS, className)}>
      {colored(row)
        .filter((p) => p.value > 0)
        .map((p) => (
          <span
            key={p.key}
            title={`${row.label} · ${p.label}: ${formatValue(p.value)}`}
            className={SEGMENT_CLASS}
            style={{ flexGrow: p.value, flexBasis: 0, background: p.color }}
          />
        ))}
      {/* The gap to the largest period on a shared scale. */}
      {scale > row.total && <span className={SEGMENT_TRACK_CLASS} style={{ flexGrow: scale - row.total, flexBasis: 0 }} />}
    </div>
  );

  if ((layout ?? (rows.length > 4 ? "rows" : "columns")) === "rows") {
    const legend = rows[0] ? colored(rows[0]) : [];
    const totals = legend.map((p) => ({ ...p, sum: rows.reduce((s, r) => s + (r.parts.find((x) => x.key === p.key)?.value ?? 0), 0) }));
    return (
      <div className={clsx("min-w-0", className)}>
        <p aria-hidden="true" className="mb-3 flex flex-wrap gap-x-4 gap-y-1 text-ub-caption text-ub-text-tertiary">
          {totals.map((p) => (
            <span key={p.key} className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
              {p.label} <span className="ub-tabular text-ub-text-secondary">{formatValue(p.sum)}</span>
            </span>
          ))}
        </p>
        <ul className="grid gap-1.5">
          {rows.map((row) => {
            check(row);
            return (
              <li
                key={row.label}
                aria-label={summaryOf(row)}
                title={`${row.label}: ${colored(row).map((p) => `${p.label} ${formatValue(p.value)}`).join(" · ")}`}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)_3rem] items-center gap-3"
              >
                <span aria-hidden="true" className="text-ub-caption text-ub-text-secondary">{row.label}</span>
                {bar(row, sharedScale ? max : Math.max(1, row.total), "h-2.5")}
                <span aria-hidden="true" className="ub-tabular text-end text-ub-caption text-ub-text-primary">{formatValue(row.total)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <ul className={clsx("grid gap-x-8 gap-y-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr))]", className)}>
      {rows.map((row) => {
        check(row);
        const parts = colored(row);
        const summary = summaryOf(row);
        return (
          <li key={row.label} aria-label={summary} className="min-w-0">
            <div aria-hidden="true" className="flex items-baseline justify-between gap-2">
              <span className="text-ub-label-md text-ub-text-primary">{row.label}</span>
              <span className="ub-tabular text-ub-label-md text-ub-text-primary">{formatValue(row.total)}</span>
            </div>
            {bar(row, sharedScale ? max : Math.max(1, row.total), "mt-2 h-2.5")}
            <p aria-hidden="true" className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-ub-caption text-ub-text-tertiary">
              {parts.map((p) => (
                <span key={p.key} className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: p.color }} />
                  {p.label} <span className="ub-tabular text-ub-text-secondary">{formatValue(p.value)}</span>
                </span>
              ))}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
