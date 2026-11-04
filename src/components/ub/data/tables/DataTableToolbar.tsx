"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import clsx from "clsx";
import { Columns3, Rows3, Rows4, Search } from "lucide-react";
import Checkbox from "components/ub/forms/choices/Checkbox";
import { buttonBase, buttonSizes, buttonVariants, focusRingInset, popover, searchField } from "components/ub/recipes";
import type { DataTableDensity } from "components/ub/data/tables/DataTable";

export interface DataTableToolbarProps {
  /** Search field; omit to hide it. */
  search?: { value: string; onChange: (value: string) => void; placeholder?: string; label?: string };
  /** Filter controls or chips, shown after search. */
  filters?: ReactNode;
  /** Comfortable (56) / compact (44) switch. */
  density?: { value: DataTableDensity; onChange: (value: DataTableDensity) => void };
  /** Columns menu: which columns show. `locked` keys can't be hidden (e.g. the name). */
  columns?: { options: { key: string; label: string; locked?: boolean }[]; hidden: string[]; onChange: (hidden: string[]) => void };
  /** "248 applications", shown politely so screen readers hear filter results. */
  resultLabel?: ReactNode;
  /** End-side actions, e.g. Export or the page's Primary. */
  actions?: ReactNode;
  className?: string;
}

const DENSITIES: { key: DataTableDensity; label: string; icon: typeof Rows3 }[] = [
  { key: "comfortable", label: "Comfortable rows", icon: Rows3 },
  { key: "compact", label: "Compact rows", icon: Rows4 },
];

/** Comfortable / compact as an icon radio group (a setting, not tabs): arrows move and select. */
function DensitySwitch({ value, onChange }: NonNullable<DataTableToolbarProps["density"]>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div role="radiogroup" aria-label="Row density" className="inline-flex gap-1 rounded-ub-full border border-ub-border bg-ub-surface-subtle p-1">
      {DENSITIES.map(({ key, label, icon: Icon }, i) => {
        const checked = value === key;
        return (
          <button
            key={key}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={label}
            title={label}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(key)}
            onKeyDown={(e) => {
              if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) return;
              e.preventDefault();
              const next = (i + 1) % DENSITIES.length;
              onChange(DENSITIES[next].key);
              refs.current[next]?.focus();
            }}
            className={clsx(
              "grid h-7 w-7 place-items-center rounded-ub-full border transition-colors duration-ub-fast motion-reduce:transition-none",
              focusRingInset,
              checked ? "border-ub-border bg-ub-surface-raised text-ub-text-primary shadow-ub-xs" : "border-transparent text-ub-text-secondary hover:bg-ub-action-ghost-hover",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}

function ColumnsMenu({ options, hidden, onChange }: NonNullable<DataTableToolbarProps["columns"]>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shown = options.length - hidden.length;
  return (
    <div ref={ref} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={clsx(buttonBase, buttonSizes.sm, buttonVariants.secondary)}
      >
        <Columns3 className="h-4 w-4" aria-hidden="true" />
        Columns
        <span className="ub-tabular text-ub-text-tertiary">
          {shown}/{options.length}
        </span>
      </button>
      {open && (
        <div id={panelId} role="group" aria-label="Show columns" className={clsx(popover, "absolute end-0 top-full z-30 mt-2 w-60 p-3")}>
          <p className="mb-2 text-ub-label-sm text-ub-text-tertiary">Show columns</p>
          <div className="grid gap-1">
            {options.map((o) => (
              <Checkbox
                key={o.key}
                label={o.label}
                checked={!hidden.includes(o.key)}
                disabled={o.locked}
                onChange={(checked) => onChange(checked ? hidden.filter((k) => k !== o.key) : [...hidden, o.key])}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Controls above a DataTable (brief §4.6, §6 Tracker): search, filters, a
 * result count, density, column visibility and page actions. Wraps on small
 * screens; every control is optional.
 */
export default function DataTableToolbar({ search, filters, density, columns, resultLabel, actions, className }: DataTableToolbarProps) {
  return (
    <div className={clsx("mb-3 grid gap-3", className)}>
      <div className="flex flex-wrap items-center gap-3">
        {search && (
          <div className="relative min-w-0 flex-1 basis-60">
            <Search aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ub-text-tertiary" />
            <input
              type="search"
              value={search.value}
              onChange={(e) => search.onChange(e.target.value)}
              placeholder={search.placeholder ?? "Search"}
              aria-label={search.label ?? search.placeholder ?? "Search"}
              className={searchField}
            />
          </div>
        )}
        {filters}
        <div className="ms-auto flex flex-wrap items-center gap-2">
          {/* Rows are stacked cards below 768px, where density has no effect. */}
          {density && (
            <div className="hidden md:block">
              <DensitySwitch {...density} />
            </div>
          )}
          {columns && <ColumnsMenu {...columns} />}
          {actions}
        </div>
      </div>
      {resultLabel && (
        <p className="ub-tabular text-ub-body-sm text-ub-text-secondary" aria-live="polite">
          {resultLabel}
        </p>
      )}
    </div>
  );
}
