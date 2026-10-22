"use client";

import React, { useId, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { StatusBadge } from "components/ui/badges";

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
  searchPlaceholder = "Search by name or email...",
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
    "text-xs font-medium text-blue-700 hover:text-blue-800 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:text-slate-400";

  return (
    <div className={`rounded-md border border-slate-200 bg-white ${className ?? ""}`}>
      <div className="flex flex-col gap-2 border-b border-slate-200 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            aria-label={`Search ${groupLabel}`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 disabled:bg-slate-50"
          />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="text-xs text-slate-500" aria-live="polite">
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
        <p className="px-3 py-6 text-center text-sm text-slate-500">No {itemNoun} to choose from.</p>
      ) : filtered.length === 0 ? (
        <p className="px-3 py-6 text-center text-sm text-slate-500">
          No {itemNoun} match{search.trim() ? ` "${search.trim()}"` : ""}.
        </p>
      ) : (
        <ul role="group" aria-label={groupLabel} className="max-h-80 divide-y divide-slate-100 overflow-y-auto">
          {filtered.map((item) => {
            const inputId = `${baseId}-${item.id}`;
            const labelId = `${inputId}-label`;
            const checked = selected.has(item.id);
            return (
              <li key={item.id}>
                <label
                  htmlFor={inputId}
                  className={`flex cursor-pointer items-start gap-3 px-3 py-2 text-sm hover:bg-slate-50 ${checked ? "bg-blue-50/60" : ""}`}
                >
                  <input
                    id={inputId}
                    type="checkbox"
                    aria-labelledby={labelId}
                    checked={checked}
                    onChange={() => toggle(item.id)}
                    disabled={disabled}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span id={labelId} className="truncate font-medium text-slate-900">
                        {item.label}
                      </span>
                      {item.badge && <StatusBadge variant="neutral">{item.badge}</StatusBadge>}
                    </span>
                    {item.sublabel && <span className="block truncate text-xs text-slate-500">{item.sublabel}</span>}
                    {item.hint && <span className="block text-xs text-slate-400">{item.hint}</span>}
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
