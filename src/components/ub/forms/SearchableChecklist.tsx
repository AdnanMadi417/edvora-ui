"use client";

import React, { useId, useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import StatusBadge from "components/ub/data/StatusBadge";
import { checkbox, focusRing, searchField } from "components/ub/recipes";

export interface SearchableChecklistItem {
  id: string;
  label: string;
  /** Secondary line under the label; searched too (e.g. an email). */
  sublabel?: string | null;
  /** Short tag next to the label (e.g. "Company"). */
  badge?: string | null;
  /** Muted explanatory line under the sublabel. */
  hint?: string | null;
}

interface SearchableChecklistProps {
  items: SearchableChecklistItem[];
  /** Ticked ids. Owned by the caller; the search term is internal. */
  selected: ReadonlySet<string>;
  onChange: (next: Set<string>) => void;
  /** Plural noun for the counter and empty states, e.g. "advisors". */
  itemNoun?: string;
  /** Accessible name of the checkbox group; the search box is "Search <label>". */
  label?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

function normalize(value: string | null | undefined) {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Controlled checklist with a search box (UBX-468). Filtering is
 * case-insensitive on label and sublabel and never touches the selection:
 * ticks made before a search survive it, and "Select all shown" only adds
 * the rows currently visible. Built for the transfer/share picker but
 * nothing in it is partner-specific.
 */
export default function SearchableChecklist({
  items,
  selected,
  onChange,
  itemNoun = "items",
  label,
  searchPlaceholder = "Search by name or email",
  disabled = false,
  className,
}: SearchableChecklistProps) {
  const [search, setSearch] = useState("");
  const baseId = useId();
  const query = normalize(search);

  const filtered = useMemo(
    () =>
      query
        ? items.filter((item) => normalize(item.label).includes(query) || normalize(item.sublabel).includes(query))
        : items,
    [items, query]
  );
  const allShownSelected = filtered.length > 0 && filtered.every((item) => selected.has(item.id));
  const groupLabel = label ?? itemNoun;

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(next);
  };
  const selectShown = () => {
    const next = new Set(selected);
    filtered.forEach((item) => next.add(item.id));
    onChange(next);
  };
  const clear = () => onChange(new Set());

  const linkButton =
    `rounded-ub-sm text-ub-label-sm text-ub-text-link hover:underline disabled:cursor-not-allowed disabled:text-ub-text-disabled disabled:no-underline ${focusRing}`;

  return (
    <div className={`overflow-hidden rounded-ub-lg border border-ub-border bg-ub-surface ${className ?? ""}`}>
      <div className="flex flex-col gap-2 border-b border-ub-border px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search aria-hidden="true" className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ub-text-tertiary" />
          <input
            type="search"
            aria-label={`Search ${groupLabel}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className={`${searchField} disabled:cursor-not-allowed disabled:bg-ub-disabled`}
          />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="ub-tabular text-ub-caption text-ub-text-tertiary" aria-live="polite">
            {selected.size} of {items.length} selected
          </span>
          <button
            type="button"
            onClick={selectShown}
            disabled={disabled || filtered.length === 0 || allShownSelected}
            className={linkButton}
          >
            Select all shown
          </button>
          <button type="button" onClick={clear} disabled={disabled || selected.size === 0} className={linkButton}>
            Clear
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="px-3 py-6 text-center text-ub-body-sm text-ub-text-tertiary">No {itemNoun} to choose from.</p>
      ) : filtered.length === 0 ? (
        <p className="px-3 py-6 text-center text-ub-body-sm text-ub-text-tertiary">
          No {itemNoun} match{search.trim() ? ` "${search.trim()}"` : ""}.
        </p>
      ) : (
        <ul role="group" aria-label={groupLabel} className="max-h-80 divide-y divide-ub-border overflow-y-auto">
          {filtered.map((item) => {
            const inputId = `${baseId}-${item.id}`;
            const labelId = `${inputId}-label`;
            const checked = selected.has(item.id);
            return (
              <li key={item.id}>
                <label
                  htmlFor={inputId}
                  className={`flex cursor-pointer items-start gap-3 px-3 py-2.5 text-ub-body-sm transition-colors duration-ub-fast ease-ub-standard ${checked ? "bg-ub-selected" : "hover:bg-ub-surface-subtle"}`}
                >
                  <span className="relative mt-px inline-flex shrink-0">
                    <input
                      id={inputId}
                      type="checkbox"
                      aria-labelledby={labelId}
                      checked={checked}
                      onChange={() => toggle(item.id)}
                      disabled={disabled}
                      className={`peer ${checkbox}`}
                    />
                    <Check
                      aria-hidden="true"
                      strokeWidth={3}
                      className="pointer-events-none absolute inset-0 m-auto hidden h-3.5 w-3.5 text-ub-action-primary-text peer-checked:block"
                    />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span id={labelId} className="truncate font-medium text-ub-text-primary">
                        {item.label}
                      </span>
                      {item.badge && <StatusBadge variant="neutral">{item.badge}</StatusBadge>}
                    </span>
                    {item.sublabel && <span className="block truncate text-ub-caption text-ub-text-tertiary">{item.sublabel}</span>}
                    {item.hint && <span className="block text-ub-caption text-ub-text-tertiary">{item.hint}</span>}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
