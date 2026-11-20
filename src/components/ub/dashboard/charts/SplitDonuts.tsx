"use client";

import clsx from "clsx";
import { focusRing } from "components/ub/recipes";
import DonutChart from "./DonutChart";

export interface SplitDonutPart {
  /** Returned by onSelect, e.g. a filter id. */
  id: string;
  label: string;
  value: number;
  /** A CSS colour, e.g. "var(--ub-tone-success-dot)". */
  color: string;
}

export interface SplitDonutGroup {
  /** One split of the whole, e.g. "Account" (active / suspended). */
  label: string;
  parts: SplitDonutPart[];
}

export interface SplitDonutsProps {
  groups: SplitDonutGroup[];
  /** Noun for counts, e.g. "Advisors". */
  unit: string;
  /** With onSelect each legend row toggles a filter; pressing the selected one clears it. */
  selectedId?: string | null;
  onSelect?: (id: string | null) => void;
  className?: string;
}

/**
 * One whole split several ways, one small donut per split (never two splits
 * in one ring, which would count everything twice), each over a legend whose
 * rows can filter a list. The phone and tablet form of a row of filter tiles.
 */
export default function SplitDonuts({ groups, unit, selectedId = null, onSelect, className }: SplitDonutsProps) {
  return (
    <div className={clsx("grid grid-cols-2 gap-4", className)}>
      {groups.map((group) => {
        const total = group.parts.reduce((sum, p) => sum + p.value, 0);
        return (
          <section key={group.label} aria-label={group.label} className="min-w-0">
            <h3 className="mb-2 text-center text-ub-label-md text-ub-text-secondary">{group.label}</h3>
            <DonutChart
              className="max-w-[8.5rem]"
              label={`${group.label}, ${total.toLocaleString()} ${unit}`}
              centerValue={total.toLocaleString()}
              centerLabel={unit}
              segments={group.parts.map((p) => ({ key: p.id, label: p.label, value: p.value, color: p.color }))}
            />
            <ul className="mt-3 grid">
              {group.parts.map((p) => {
                const share = total ? Math.round((p.value / total) * 100) : 0;
                const selected = selectedId === p.id;
                const body = (
                  <>
                    <span aria-hidden="true" className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.color }} />
                    <span className="min-w-0 flex-1 truncate text-start text-ub-body-sm text-ub-text-primary">{p.label}</span>
                    <span className="ub-tabular shrink-0 text-ub-label-md text-ub-text-primary">{p.value.toLocaleString()}</span>
                  </>
                );
                const cls = clsx("flex min-h-11 w-full min-w-0 items-center gap-2 rounded-ub-md px-2", selected && "bg-ub-selected");
                return (
                  <li key={p.id}>
                    {onSelect ? (
                      <button
                        type="button"
                        aria-pressed={selected}
                        aria-label={`${p.label}: ${p.value.toLocaleString()} ${unit}, ${share}%`}
                        onClick={() => onSelect(selected ? null : p.id)}
                        className={clsx(cls, !selected && "hover:bg-ub-surface-subtle", focusRing)}
                      >
                        {body}
                      </button>
                    ) : (
                      <div className={cls} aria-label={`${p.label}: ${p.value.toLocaleString()} ${unit}, ${share}%`}>
                        {body}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
