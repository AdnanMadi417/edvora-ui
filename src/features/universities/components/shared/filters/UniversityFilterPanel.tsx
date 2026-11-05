"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import Drawer from "components/ub/feedback/dialogs/Drawer";
import Button from "components/ub/core/buttons/Button";
import SelectInput from "components/ub/forms/selection/SelectInput";
import SearchInput from "components/ub/forms/selection/SearchInput";
import FilterChip from "components/ub/data/badges/FilterChip";

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
  showVisibility?: boolean;
}

function findLabel(options: Option[], value: string): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

/** Shared university search and animated filter drawer. */
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
  showVisibility = true,
}: UniversityFilterPanelProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<UniversityFilterValues>(filters);
  const reducedMotion = useReducedMotion();

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

  const activeFilterCount = [
    filters.type !== "all",
    filters.isPublic !== "all",
    filters.hasLanguageCenter !== "all",
    showVisibility && filters.isHidden !== "all",
  ].filter(Boolean).length;

  const chips: { key: keyof UniversityFilterValues; label: string }[] = [];
  if (filters.type !== "all")
    chips.push({ key: "type", label: findLabel(typeOptions, filters.type) });
  if (filters.isPublic !== "all")
    chips.push({
      key: "isPublic",
      label: findLabel(PUBLIC_OPTIONS, filters.isPublic),
    });
  if (filters.hasLanguageCenter !== "all")
    chips.push({
      key: "hasLanguageCenter",
      label: findLabel(LANGUAGE_CENTER_OPTIONS, filters.hasLanguageCenter),
    });
  if (showVisibility && filters.isHidden !== "all")
    chips.push({
      key: "isHidden",
      label: findLabel(HIDDEN_OPTIONS, filters.isHidden),
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
      key: "type",
      label: "University type",
      options: typeOptions,
      placeholder: "All types",
    },
    {
      key: "isPublic",
      label: "Institution",
      options: PUBLIC_OPTIONS,
      placeholder: "Public & private",
    },
    {
      key: "hasLanguageCenter",
      label: "Language center",
      options: LANGUAGE_CENTER_OPTIONS,
      placeholder: "Any language center",
    },
    ...(showVisibility
      ? [
          {
            key: "isHidden",
            label: "Visibility",
            options: HIDDEN_OPTIONS,
            placeholder: "Any visibility",
          },
        ]
      : []),
  ];
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="min-w-0 flex-1 sm:min-w-[220px]"
        />
        <Button
          variant="secondary"
          icon={<SlidersHorizontal className="h-4 w-4" />}
          text={
            activeFilterCount ? `Filters (${activeFilterCount})` : "Filters"
          }
          onClick={() => setOpen(true)}
          className="min-h-[44px]"
        />
        {resultsCount !== undefined && (
          <p role="status" className="text-ub-label-sm text-ub-text-secondary">
            {resultsCount} universities
          </p>
        )}
      </div>
      <AnimatePresence initial={false}>
        {chips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{
              duration: reducedMotion ? 0 : MICRO_DURATION,
              ease: EASE,
            }}
          >
            <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap">
              {chips.map((chip) => (
                <FilterChip
                  key={chip.key}
                  label={chip.label}
                  onRemove={() => onRemoveFilter(chip.key)}
                />
              ))}
              <Button
                size="sm"
                variant="tertiary"
                text="Clear filters"
                onClick={onClearAll}
                className="shrink-0"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
      <Drawer
        open={open}
        onClose={close}
        title="Filter universities"
        description="Find institutions by type, language support and availability."
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
            <motion.div
              key={key}
              initial={reducedMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reducedMotion ? 0 : MICRO_DURATION,
                delay: reducedMotion ? 0 : index * 0.025,
                ease: EASE,
              }}
            >
              <p className="mb-2 text-ub-label-md text-ub-text-primary">
                {label}
              </p>
              <SelectInput
                field={key}
                aria-label={label}
                className="min-h-[44px]"
                formData={draft}
                options={[{ value: "all", label: placeholder }, ...options]}
                updateFormData={(_, value) =>
                  setDraft((previous) => ({ ...previous, [key]: value }))
                }
              />
            </motion.div>
          ))}
        </div>
      </Drawer>
    </div>
  );
}
