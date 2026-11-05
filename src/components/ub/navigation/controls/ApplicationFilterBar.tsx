"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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

const LIFECYCLE_OPTIONS: Option[] = [
  { label: "Active", value: "active" },
  { label: "Hold", value: "hold" },
  { label: "Cancelled", value: "cancel" },
];

interface ApplicationFilterBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;

  selectedStages: string;
  onStagesChange: (val: string) => void;
  stageOptions: Option[];
  showStageFilter?: boolean;

  selectedUniversity: string;
  onUniversityChange: (val: string) => void;
  universityOptions: Option[];

  selectedStageStatus: string;
  onStageStatusChange: (val: string) => void;
  stageStatusOptions: Option[];
  stageStatusLoading?: boolean;

  selectedLifecycle?: string;
  onLifecycleChange?: (val: string) => void;
  showLifecycleFilter?: boolean;

  resultsCount?: number;

  activeFiltersCount: number;
  onClearFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export default function ApplicationFilterBar(props: ApplicationFilterBarProps) {
  const {
    showFilters,
    onToggleFilters,
    selectedStages,
    selectedUniversity,
    selectedStageStatus,
    selectedLifecycle = "all",
    showStageFilter = true,
    showLifecycleFilter = false,
  } = props;
  const reducedMotion = useReducedMotion();
  const [draft, setDraft] = useState({
    stage: selectedStages || "all",
    university: selectedUniversity || "all",
    status: selectedStageStatus || "all",
    lifecycle: selectedLifecycle,
  });
  useEffect(() => {
    if (showFilters)
      setDraft({
        stage: selectedStages || "all",
        university: selectedUniversity || "all",
        status: selectedStageStatus || "all",
        lifecycle: selectedLifecycle,
      });
  }, [
    showFilters,
    selectedStages,
    selectedUniversity,
    selectedStageStatus,
    selectedLifecycle,
  ]);
  const fields = [
    ...(showLifecycleFilter && props.onLifecycleChange
      ? [
          {
            key: "lifecycle",
            label: "Application status",
            options: LIFECYCLE_OPTIONS,
            placeholder: "Any status",
          },
        ]
      : []),
    ...(showStageFilter
      ? [
          {
            key: "stage",
            label: "Stage",
            options: props.stageOptions,
            placeholder: "All stages",
          },
        ]
      : []),
    {
      key: "university",
      label: "University",
      options: props.universityOptions,
      placeholder: "All universities",
    },
    {
      key: "status",
      label: "Stage status",
      options: props.stageStatusOptions,
      placeholder: props.stageStatusLoading
        ? "Loading statuses…"
        : "All stage statuses",
    },
  ];
  const selected = {
    stage: selectedStages || "all",
    university: selectedUniversity || "all",
    status: selectedStageStatus || "all",
    lifecycle: selectedLifecycle,
  };
  const change = (key: string, value: string) => {
    if (key === "stage") props.onStagesChange(value);
    if (key === "university") props.onUniversityChange(value);
    if (key === "status") props.onStageStatusChange(value);
    if (key === "lifecycle") props.onLifecycleChange?.(value);
  };
  const apply = () => {
    if (showStageFilter) props.onStagesChange(draft.stage);
    props.onUniversityChange(draft.university);
    props.onLifecycleChange?.(draft.lifecycle);
    props.onStageStatusChange(draft.status);
    onToggleFilters();
  };
  return (
    <div className="min-w-0 space-y-4">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SearchInput
          value={props.searchTerm}
          onChange={props.onSearchChange}
          placeholder="Search applications"
          className="min-w-0 flex-1 sm:min-w-[220px]"
        />
        <Button
          variant="secondary"
          icon={<SlidersHorizontal className="h-4 w-4" />}
          text={
            props.activeFiltersCount
              ? `Filters (${props.activeFiltersCount})`
              : "Filters"
          }
          onClick={onToggleFilters}
          className="min-h-[44px]"
        />
        {props.resultsCount !== undefined && (
          <p role="status" className="text-ub-label-sm text-ub-text-secondary">
            {props.resultsCount.toLocaleString()} applications
          </p>
        )}
      </div>
      <div className="flex flex-nowrap gap-2 overflow-x-auto pb-1 sm:flex-wrap">
        {fields
          .filter(
            ({ key }) =>
              selected[key] !== "all" &&
              selected[key] &&
              !(key === "lifecycle" && selected[key] === "active")
          )
          .map(({ key, label, options }) => (
            <FilterChip
              key={key}
              label={`${label}: ${
                options.find((option) => option.value === selected[key])
                  ?.label || selected[key]
              }`}
              onRemove={() =>
                change(key, key === "lifecycle" ? "active" : "all")
              }
            />
          ))}
        {props.activeFiltersCount > 0 && (
          <Button
            variant="tertiary"
            size="sm"
            text="Clear filters"
            onClick={props.onClearFilters}
            className="shrink-0"
          />
        )}
      </div>
      <Drawer
        open={showFilters}
        onClose={onToggleFilters}
        title="Filter applications"
        description="Narrow applications by institution, stage and status."
        footer={
          <div className="grid w-full grid-cols-2 gap-3">
            <Button
              variant="secondary"
              text="Clear filters"
              onClick={() => {
                props.onClearFilters();
                onToggleFilters();
              }}
              className="min-h-[44px]"
            />
            <Button
              variant="primary"
              text="Apply filters"
              onClick={apply}
              disabled={props.stageStatusLoading}
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
                options={[{ value: "all", label: placeholder }, ...options]}
                formData={draft}
                disabled={key === "status" && props.stageStatusLoading}
                className="min-h-[44px]"
                updateFormData={(_, value) =>
                  setDraft((previous) => ({
                    ...previous,
                    [key]: value,
                    ...(key === "stage" ? { status: "all" } : {}),
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
