import clsx from "clsx";
import Link from "next/link";
import { Info } from "lucide-react";
import { focusRing } from "components/ub/recipes";
import { CHART_OTHER } from "config/chartPalette";
import { SEGMENT_CLASS, SEGMENT_ROW_CLASS, SEGMENT_TRACK_CLASS } from "./segments";

export interface RankedBarItem {
  key: string;
  label: string;
  value: number;
  /** Opens the list behind this row. */
  href?: string;
}

export interface RankedBarsProps {
  items: RankedBarItem[];
  /** Noun for counts, e.g. "applications". */
  unit: string;
  /** Accessible name, e.g. "Applications by country". */
  label: string;
  /** Rows shown before the rest fold into one "Others" row (default 10). */
  top?: number;
  /** Show exactly this many parts, then everything else (even one) in the Others row. Wins over `top`. */
  fold?: number;
  /** Label for the folded row; default "Others (N)". */
  restLabel?: (count: number) => string;
  /**
   * Records with no value for this dimension (e.g. field of study not
   * recorded). Kept out of the ranking and stated on top, so a big unknown
   * never reads as the biggest category.
   */
  notRecorded?: number;
  /** One colour for every row (default the first chart slot). */
  color?: string;
  /** Decimals on shares (default 1). */
  percentDigits?: number;
  formatValue?: (value: number) => string;
  className?: string;
}

const num = (value: number) => value.toLocaleString();

/**
 * Categories ranked largest first as horizontal bars on one scale: name,
 * value and share on each row, one colour, so the order is the message.
 * The tail folds into "Others"; records with no value are stated on top
 * instead of ranked. Use it for "where from", "where to", "what" breakdowns.
 */
export default function RankedBars({
  items,
  unit,
  label,
  top = 10,
  fold,
  restLabel = (n) => `Others (${n})`,
  notRecorded = 0,
  color = "var(--ub-chart-cat-1)",
  percentDigits = 1,
  formatValue = num,
  className,
}: RankedBarsProps) {
  const sorted = items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  const head =
    fold !== undefined ? (sorted.length > fold ? sorted.slice(0, fold) : sorted) : sorted.length > top ? sorted.slice(0, top - 1) : sorted;
  const rest = sorted.slice(head.length);
  const rows = rest.length
    ? [...head, { key: "__others", label: restLabel(rest.length), value: rest.reduce((s, i) => s + i.value, 0), rest: true }]
    : head;
  const recorded = sorted.reduce((s, i) => s + i.value, 0);
  const max = Math.max(1, ...rows.map((r) => r.value));
  const pct = (value: number, of: number) => `${of ? ((value / of) * 100).toFixed(percentDigits) : (0).toFixed(percentDigits)}%`;
  const all = recorded + notRecorded;

  return (
    <div className={clsx("min-w-0", className)}>
      {notRecorded > 0 && (
        <p className="mb-4 flex items-start gap-2 rounded-ub-md bg-ub-surface-subtle px-3 py-2 text-ub-body-sm text-ub-text-secondary">
          <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-ub-icon" />
          <span>
            Recorded for <span className="ub-tabular font-medium text-ub-text-primary">{pct(recorded, all)}</span> of {unit} ·{" "}
            <span className="ub-tabular">{formatValue(notRecorded)}</span> not recorded. Shares below are of the {formatValue(recorded)} recorded.
          </span>
        </p>
      )}
      <ol aria-label={`${label}, ${formatValue(recorded)} ${unit}`} className="grid grid-cols-1 gap-1">
        {rows.map((row, i) => {
          const isRest = "rest" in row;
          const share = pct(row.value, recorded);
          const name = `${isRest ? "" : `${i + 1}. `}${row.label}: ${formatValue(row.value)} ${unit}, ${share}`;
          const body = (
            <>
              <div className="flex items-baseline gap-3">
                <span className={clsx("min-w-0 flex-1 truncate text-ub-body-sm", isRest ? "text-ub-text-secondary" : "text-ub-text-primary")} title={row.label}>
                  {row.label}
                </span>
                <span className="ub-tabular shrink-0 text-ub-label-md text-ub-text-primary">{formatValue(row.value)}</span>
                <span className="ub-tabular w-14 shrink-0 text-end text-ub-caption text-ub-text-tertiary">{share}</span>
              </div>
              <div aria-hidden="true" className={clsx("mt-1.5 h-2", SEGMENT_ROW_CLASS)}>
                <span className={SEGMENT_CLASS} style={{ flexGrow: row.value, flexBasis: 0, background: isRest ? CHART_OTHER : color }} />
                {row.value < max && <span className={SEGMENT_TRACK_CLASS} style={{ flexGrow: max - row.value, flexBasis: 0 }} />}
              </div>
            </>
          );
          const href = "href" in row ? row.href : undefined;
          return (
            <li key={row.key} className="min-w-0" title={`${row.label}: ${formatValue(row.value)} (${share})`}>
              {href ? (
                <Link href={href} aria-label={name} className={clsx("-mx-2 block min-h-11 rounded-ub-md px-2 py-1.5 hover:bg-ub-surface-subtle", focusRing)}>
                  {body}
                </Link>
              ) : (
                <div className="py-1.5">
                  <span className="sr-only">{name}</span>
                  <div aria-hidden="true">{body}</div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
