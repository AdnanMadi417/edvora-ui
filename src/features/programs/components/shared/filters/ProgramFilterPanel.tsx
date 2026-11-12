"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import React, { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import SelectInput from "components/ub/forms/selection/SelectInput";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import Button from "components/ub/core/buttons/Button";
import SearchInput from "components/ub/forms/selection/SearchInput";
import FilterChip from "components/ub/data/badges/FilterChip";
import SortButton from "features/programs/components/shared/filters/SortButton";
import { COURSE_TYPE_OPTIONS } from "features/programs/utils/courseType";

interface Option {
  label: string;
  value: string;
}

const SCHOLARSHIP_OPTIONS: Option[] = [
  { label: "Has scholarship", value: "true" },
  { label: "No scholarship", value: "false" },
];

const COURSE_TYPE_FILTER_OPTIONS: Option[] = COURSE_TYPE_OPTIONS;

const CLASS_TYPE_OPTIONS: Option[] = [
  { label: "Physical", value: "physical" },
  { label: "Online", value: "online" },
];

const HIDDEN_OPTIONS: Option[] = [
  { label: "Hidden programs only", value: "true" },
];

export interface ProgramFilterValues {
  state: string;
  field: string;
  university: string;
  qualId: string | null;
  scholarship: string;
  courseType: string;
  classType: string;
  // Only used by roles that manage hidden programs — "all" (or absent) means
  // the default visible-only list, "true" means hidden only.
  hidden?: string;
}

const DEFAULT_FILTERS: ProgramFilterValues = {
  state: "all",
  field: "all",
  university: "all",
  qualId: null,
  scholarship: "all",
  courseType: "all",
  classType: "all",
  hidden: "all",
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

  /** Shows the "Hidden programs only" filter — for roles that can unhide. */
  showHiddenFilter?: boolean;

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
  showHiddenFilter = false,
  resultsCount,
  children,
}: ProgramFilterPanelProps) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<ProgramFilterValues>(filters);

  const close = () => setOpen(false);

  // Callers pass `filters` as a fresh object literal on every render, so
  // this can't key off object identity — that resets an in-progress draft
  // (e.g. a University pick not yet Applied) on any unrelated parent
  // re-render, like typing in the search box. Key off a stable
  // serialization of the actual values instead.
  const filtersKey = useMemo(() => JSON.stringify(filters), [filters]);
  useEffect(() => {
    if (!open) return;
    setDraft(filters);
    // filtersKey (not filters) is the intended dependency — see comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filtersKey]);

  const activeFilterCount = [
    filters.state !== "all",
    filters.field !== "all",
    filters.university !== "all",
    filters.qualId !== null,
    filters.scholarship !== "all",
    filters.courseType !== "all",
    filters.classType !== "all",
    showHiddenFilter && (filters.hidden ?? "all") !== "all",
  ].filter(Boolean).length;

  const chips: { key: keyof ProgramFilterValues; label: string }[] = [];
  if (filters.state !== "all")
    chips.push({ key: "state", label: findLabel(stateOptions, filters.state) });
  if (filters.field !== "all")
    chips.push({ key: "field", label: findLabel(fieldOptions, filters.field) });
  if (filters.university !== "all")
    chips.push({
      key: "university",
      label: findLabel(universityOptions, filters.university),
    });
  if (filters.qualId !== null)
    chips.push({
      key: "qualId",
      label: findLabel(qualificationOptions, filters.qualId),
    });
  if (filters.scholarship !== "all")
    chips.push({
      key: "scholarship",
      label: findLabel(SCHOLARSHIP_OPTIONS, filters.scholarship),
    });
  if (filters.courseType !== "all")
    chips.push({
      key: "courseType",
      label: findLabel(COURSE_TYPE_FILTER_OPTIONS, filters.courseType),
    });
  if (filters.classType !== "all")
    chips.push({
      key: "classType",
      label: findLabel(CLASS_TYPE_OPTIONS, filters.classType),
    });
  if (showHiddenFilter && (filters.hidden ?? "all") !== "all")
    chips.push({
      key: "hidden",
      label: findLabel(HIDDEN_OPTIONS, filters.hidden ?? "all"),
    });

  const handleApply = () => {
    onApplyFilters(draft);
    close();
  };

  const handleReset = () => {
    setDraft(DEFAULT_FILTERS);
    onClearAll();
    close();
  };

  const fields = [
    {
      key: "state",
      label: "Location",
      options: stateOptions,
      placeholder: "All locations",
    },
    {
      key: "field",
      label: "Field of study",
      options: fieldOptions,
      placeholder: "All fields",
    },
    {
      key: "university",
      label: "University",
      options: universityOptions,
      placeholder: "All universities",
    },
    {
      key: "qualId",
      label: "Qualification",
      options: qualificationOptions,
      placeholder: "All qualifications",
    },
    {
      key: "scholarship",
      label: "Scholarship",
      options: SCHOLARSHIP_OPTIONS,
      placeholder: "All scholarships",
    },
    {
      key: "courseType",
      label: "Course type",
      options: COURSE_TYPE_FILTER_OPTIONS,
      placeholder: "All course types",
    },
    {
      key: "classType",
      label: "Delivery mode",
      options: CLASS_TYPE_OPTIONS,
      placeholder: "All delivery modes",
    },
    ...(showHiddenFilter
      ? [
          {
            key: "hidden",
            label: "Visibility",
            options: HIDDEN_OPTIONS,
            placeholder: "Visible programs",
          },
        ]
      : []),
  ];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="min-w-0 flex-1 sm:min-w-[220px]"
        />
        <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
          <Button
            onClick={() => setOpen(true)}
            variant="secondary"
            icon={<SlidersHorizontal className="h-4 w-4" />}
            text={
              activeFilterCount ? `Filters (${activeFilterCount})` : "Filters"
            }
            className="min-h-[44px]"
          />
          <SortButton value={sortBy} onChange={onSortChange} />
        </div>
        {resultsCount !== undefined && (
          <p role="status" className="text-ub-label-sm text-ub-text-secondary">
            {resultsCount.toLocaleString()} programs
          </p>
        )}
      </div>
      <AnimatePresence initial={false}>
        {chips.length > 0 && <motion.div key="filters" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: reducedMotion ? 0 : MICRO_DURATION, ease: EASE }}>
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap">
            <AnimatePresence initial={false}>
              {chips.map((chip) => <motion.div key={chip.key} layout={!reducedMotion} initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reducedMotion ? 1 : 0.95 }} transition={{ duration: reducedMotion ? 0 : MICRO_DURATION, ease: EASE }} className="shrink-0">
                <FilterChip label={chip.label} onRemove={() => onRemoveFilter(chip.key)} />
              </motion.div>)}
            </AnimatePresence>
            <Button size="sm" variant="tertiary" text="Clear filters" onClick={onClearAll} className="shrink-0" />
          </div>
        </motion.div>}
      </AnimatePresence>
      {children}
      <Drawer
        open={open}
        onClose={close}
        title="Filter programs"
        description="Narrow the Knowledge Hub by university, qualification and study preferences."
        footer={
          <div className="grid w-full grid-cols-2 gap-3">
            <Button
              variant="secondary"
              text="Clear filters"
              onClick={handleReset}
              className="min-h-[44px]"
            />
            <Button
              variant="primary"
              text="Apply filters"
              onClick={handleApply}
              className="min-h-[44px]"
            />
          </div>
        }
      >
        <div className="space-y-5">
          {fields.map(({ key, label, options, placeholder }, index) => (
            <motion.div key={key} initial={reducedMotion ? false : { opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reducedMotion ? 0 : MICRO_DURATION, delay: reducedMotion ? 0 : index * 0.025, ease: EASE }}>
              <p className="mb-2 text-ub-label-md text-ub-text-primary">
                {label}
              </p>
              <SelectInput
                className="min-h-[44px]"
                field={key}
                aria-label={label}
                options={[{ value: "all", label: placeholder }, ...options]}
                formData={{ ...draft, qualId: draft.qualId ?? "all" }}
                updateFormData={(_, value) =>
                  setDraft((previous) => ({
                    ...previous,
                    [key]: key === "qualId" && value === "all" ? null : value,
                  }))
                }
              />
            </motion.div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
