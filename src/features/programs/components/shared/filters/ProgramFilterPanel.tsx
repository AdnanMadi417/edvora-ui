"use client";

import React, { useEffect, useRef, useState } from "react";
import { SlidersHorizontal, Globe, GraduationCap, Award, X, RotateCcw } from "lucide-react";
import { MdSchool } from "react-icons/md";
import { AiOutlineBank } from "react-icons/ai";
import FilterSelectField from "components/form/filter/FilterSelectField";
import SearchInput from "components/form/filter/SearchInput";
import FilterChip from "components/ui/filters/FilterChip";
import SortButton from "features/programs/components/shared/filters/SortButton";

interface Option {
  label: string;
  value: string;
}

const SCHOLARSHIP_OPTIONS: Option[] = [
  { label: "Has Scholarship", value: "true" },
  { label: "No Scholarship", value: "false" },
];

export interface ProgramFilterValues {
  state: string;
  field: string;
  university: string;
  qualId: string | null;
  scholarship: string;
}

const DEFAULT_FILTERS: ProgramFilterValues = {
  state: "all",
  field: "all",
  university: "all",
  qualId: null,
  scholarship: "all",
};

interface ProgramFilterPanelProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;

  stateOptions: Option[];
  fieldOptions: Option[];
  universityOptions: Option[];
  qualificationOptions: Option[];

  filters: ProgramFilterValues;
  onApplyFilters: (values: ProgramFilterValues) => void;
  onRemoveFilter: (key: keyof ProgramFilterValues) => void;
  onClearAll: () => void;

  sortBy: string;
  onSortChange: (value: string) => void;

  resultsCount?: number;

  children?: React.ReactNode;
}

function findLabel(options: Option[], value: string | null): string {
  return options.find((o) => o.value === value)?.label ?? value ?? "";
}

export default function ProgramFilterPanel({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search programs...",
  stateOptions,
  fieldOptions,
  universityOptions,
  qualificationOptions,
  filters,
  onApplyFilters,
  onRemoveFilter,
  onClearAll,
  sortBy,
  onSortChange,
  resultsCount,
  children,
}: ProgramFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProgramFilterValues>(filters);
  const ref = useRef<HTMLDivElement>(null);

  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;
    setDraft(filters);
  }, [open, filters]);

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
    filters.state !== "all",
    filters.field !== "all",
    filters.university !== "all",
    filters.qualId !== null,
    filters.scholarship !== "all",
  ].filter(Boolean).length;

  const chips: { key: keyof ProgramFilterValues; label: string }[] = [];
  if (filters.state !== "all") chips.push({ key: "state", label: findLabel(stateOptions, filters.state) });
  if (filters.field !== "all") chips.push({ key: "field", label: findLabel(fieldOptions, filters.field) });
  if (filters.university !== "all") chips.push({ key: "university", label: findLabel(universityOptions, filters.university) });
  if (filters.qualId !== null) chips.push({ key: "qualId", label: findLabel(qualificationOptions, filters.qualId) });
  if (filters.scholarship !== "all") chips.push({ key: "scholarship", label: findLabel(SCHOLARSHIP_OPTIONS, filters.scholarship) });

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
      <div className="flex items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="flex-1"
        />

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
              {/* Mobile backdrop for the bottom-sheet variant */}
              <div className="fixed inset-0 z-[90] bg-black/30 sm:hidden" onClick={close} />

              <div
                role="dialog"
                aria-label="Filters"
                className="fixed inset-x-0 bottom-0 z-[100] max-h-[80vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-white p-5 shadow-2xl sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:max-h-[calc(100vh-120px)] sm:w-[420px] sm:rounded-xl sm:border sm:shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-semibold text-slate-900">Filters</h4>
                  <button type="button" onClick={close} className="text-slate-400 hover:text-slate-600 sm:hidden">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-3 py-4">
                  <FilterSelectField
                    value={draft.state}
                    onChange={(val: string) => setDraft((d) => ({ ...d, state: val }))}
                    options={stateOptions}
                    icon={Globe}
                    defaultOption="All Locations"
                  />
                  <FilterSelectField
                    value={draft.field}
                    onChange={(val: string) => setDraft((d) => ({ ...d, field: val }))}
                    options={fieldOptions}
                    icon={MdSchool}
                    defaultOption="All Fields"
                  />
                  <FilterSelectField
                    value={draft.university}
                    onChange={(val: string) => setDraft((d) => ({ ...d, university: val }))}
                    options={universityOptions}
                    icon={AiOutlineBank}
                    defaultOption="All Universities"
                  />
                  <FilterSelectField
                    value={draft.qualId ?? "all"}
                    onChange={(val: string) => setDraft((d) => ({ ...d, qualId: val === "all" ? null : val }))}
                    options={qualificationOptions}
                    icon={GraduationCap}
                    defaultOption="All Qualifications"
                  />
                  <FilterSelectField
                    value={draft.scholarship}
                    onChange={(val: string) => setDraft((d) => ({ ...d, scholarship: val }))}
                    options={SCHOLARSHIP_OPTIONS}
                    icon={Award}
                    defaultOption="All Scholarships"
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

        <SortButton value={sortBy} onChange={onSortChange} />

        {resultsCount !== undefined && (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 sm:inline-flex">
            {resultsCount.toLocaleString()}
            <span className="font-normal text-blue-500">results</span>
          </span>
        )}
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <FilterChip key={chip.key} label={chip.label} onRemove={() => onRemoveFilter(chip.key)} />
          ))}
          {chips.length >= 2 && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-sm font-medium text-slate-500 underline-offset-2 transition hover:text-slate-700 hover:underline"
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
