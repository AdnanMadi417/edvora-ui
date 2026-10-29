"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X, RotateCcw, EyeOff, Languages, Building2 } from "lucide-react";
import { MdOutlineCategory } from "react-icons/md";
import FilterSelectField from "components/ub/forms/FilterSelectField";
import SearchInput from "components/ub/forms/SearchInput";
import FilterChip from "components/ub/data/FilterChip";

interface Option {
  label: string;
  value: string;
}

const PUBLIC_OPTIONS: Option[] = [
  { label: "Public", value: "true" },
  { label: "Private", value: "false" },
];

const LANGUAGE_CENTER_OPTIONS: Option[] = [
  { label: "Has Language Center", value: "true" },
  { label: "No Language Center", value: "false" },
];

const HIDDEN_OPTIONS: Option[] = [
  { label: "Hidden", value: "true" },
  { label: "Visible", value: "false" },
];

export interface UniversityFilterValues {
  type: string;
  isPublic: string;
  hasLanguageCenter: string;
  isHidden: string;
}

const DEFAULT_FILTERS: UniversityFilterValues = {
  type: "all",
  isPublic: "all",
  hasLanguageCenter: "all",
  isHidden: "all",
};

interface UniversityFilterPanelProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;

  typeOptions: Option[];

  filters: UniversityFilterValues;
  onApplyFilters: (values: UniversityFilterValues) => void;
  onRemoveFilter: (key: keyof UniversityFilterValues) => void;
  onClearAll: () => void;

  resultsCount?: number;

  children?: React.ReactNode;
}

function findLabel(options: Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

// Same "Filters" button + slide-down panel + removable chip row pattern as
// ProgramFilterPanel (features/programs/components/shared/filters) — reused
// here so the Universities tables (admin, data-entry) match the Programs
// table's filter UX instead of a bespoke always-visible dropdown row.
export default function UniversityFilterPanel({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search universities...",
  typeOptions,
  filters,
  onApplyFilters,
  onRemoveFilter,
  onClearAll,
  resultsCount,
  children,
}: UniversityFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<UniversityFilterValues>(filters);
  const ref = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  // See ProgramFilterPanel's identical comment — `filters` is a fresh
  // object literal every render, so key off its serialized value instead
  // of identity to avoid resetting an in-progress draft on unrelated
  // parent re-renders (e.g. typing in the search box).
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  useEffect(() => {
    if (!open) return;
    setDraft(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filtersKey]);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("mousedown", onMouse);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onMouse);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const activeFilterCount = [
    filters.type !== "all",
    filters.isPublic !== "all",
    filters.hasLanguageCenter !== "all",
    filters.isHidden !== "all",
  ].filter(Boolean).length;

  const chips: { key: keyof UniversityFilterValues; label: string }[] = [];
  if (filters.type !== "all") chips.push({ key: "type", label: findLabel(typeOptions, filters.type) });
  if (filters.isPublic !== "all") chips.push({ key: "isPublic", label: findLabel(PUBLIC_OPTIONS, filters.isPublic) });
  if (filters.hasLanguageCenter !== "all") chips.push({ key: "hasLanguageCenter", label: findLabel(LANGUAGE_CENTER_OPTIONS, filters.hasLanguageCenter) });
  if (filters.isHidden !== "all") chips.push({ key: "isHidden", label: findLabel(HIDDEN_OPTIONS, filters.isHidden) });

  const handleApply = () => {
    onApplyFilters(draft);
    close();
  };

  const handleReset = () => {
    setDraft(DEFAULT_FILTERS);
    onClearAll();
    close();
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-3 sm:contents">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="flex-1"
          />
        </div>

        <div className="flex items-center gap-3 sm:contents">
          <div className="relative" ref={ref}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="true"
              className={`relative flex h-10 shrink-0 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition ${
                open
                  ? "border-blue-300 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-xs font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {open && (
              <>
                <div className="fixed inset-0 z-[90] bg-black/30 sm:hidden" onClick={close} />

                <div
                  role="dialog"
                  aria-label="Filters"
                  className="fixed inset-x-0 bottom-0 z-[100] max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-5 shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[calc(100vh-120px)] sm:w-[380px] sm:rounded-xl sm:border sm:shadow-xl"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h4 className="text-sm font-semibold text-slate-900">Filters</h4>
                    <button type="button" onClick={close} className="text-slate-400 hover:text-slate-600 sm:hidden">
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 py-4">
                    <FilterSelectField
                      value={draft.type}
                      onChange={(val: string) => setDraft((d) => ({ ...d, type: val }))}
                      options={typeOptions}
                      icon={MdOutlineCategory}
                      defaultOption="All Types"
                    />
                    <FilterSelectField
                      value={draft.isPublic}
                      onChange={(val: string) => setDraft((d) => ({ ...d, isPublic: val }))}
                      options={PUBLIC_OPTIONS}
                      icon={Building2}
                      defaultOption="Any Institution Type"
                    />
                    <FilterSelectField
                      value={draft.hasLanguageCenter}
                      onChange={(val: string) => setDraft((d) => ({ ...d, hasLanguageCenter: val }))}
                      options={LANGUAGE_CENTER_OPTIONS}
                      icon={Languages}
                      defaultOption="Any Language Center"
                    />
                    <FilterSelectField
                      value={draft.isHidden}
                      onChange={(val: string) => setDraft((d) => ({ ...d, isHidden: val }))}
                      options={HIDDEN_OPTIONS}
                      icon={EyeOff}
                      defaultOption="Any Visibility"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-700"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleApply}
                      className="rounded-lg border border-blue-600 bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {resultsCount !== undefined && (
            <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 sm:inline-flex">
              {resultsCount.toLocaleString()}
              <span className="font-normal text-blue-500">results</span>
            </span>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="-mx-6 flex items-center gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
          {chips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} onRemove={() => onRemoveFilter(chip.key)} />
          ))}
          {chips.length >= 2 && (
            <button
              type="button"
              onClick={onClearAll}
              className="shrink-0 whitespace-nowrap text-sm font-medium text-slate-500 underline-offset-2 transition hover:text-slate-700 hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {children}
    </div>
  );
}
