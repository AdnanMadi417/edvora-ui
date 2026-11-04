"use client";

import React from "react";
import { SlidersHorizontal, Building, GitBranch, Flag, RefreshCw, Activity } from "lucide-react";
import { focusRing, tagBase, tagTones } from "components/ub/recipes";
import FilterSelectField from "components/ub/forms/selection/FilterSelectField";
import SearchInput from "components/ub/forms/selection/SearchInput";

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

export default function ApplicationFilterBar({
  searchTerm,
  onSearchChange,
  selectedStages,
  onStagesChange,
  stageOptions,
  showStageFilter = true,
  selectedUniversity,
  onUniversityChange,
  universityOptions,
  selectedStageStatus,
  onStageStatusChange,
  stageStatusOptions,
  selectedLifecycle = "all",
  onLifecycleChange,
  showLifecycleFilter = false,
  resultsCount,
  activeFiltersCount,
  onClearFilters,
  showFilters,
  onToggleFilters,
}: ApplicationFilterBarProps) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

        {/* Search + mobile toggle */}
        <div className="flex items-center gap-2 sm:contents">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Search applications"
            className="sm:w-56 sm:flex-none"
          />
          <button
            type="button"
            className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-ub-full border border-ub-border-control bg-ub-surface text-ub-text-secondary hover:bg-ub-surface-subtle sm:hidden ${focusRing}`}
            onClick={onToggleFilters}
            aria-label={showFilters ? "Hide filters" : "Show filters"}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {activeFiltersCount > 0 && (
              <span className="ub-tabular absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-ub-full bg-ub-action-primary px-1 text-ub-label-sm text-ub-action-primary-text">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              aria-label="Clear filters"
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-ub-full text-ub-text-link hover:bg-ub-action-secondary-hover sm:hidden ${focusRing}`}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Collapsible dropdowns */}
        <div className={`flex w-full flex-col gap-3 overflow-hidden transition-all duration-ub-base ease-ub-standard motion-reduce:transition-none sm:contents ${showFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"}`}>

          {showLifecycleFilter && onLifecycleChange && (
            <div className="w-full shrink-0 sm:w-40">
              <FilterSelectField
                value={selectedLifecycle}
                onChange={onLifecycleChange}
                options={LIFECYCLE_OPTIONS}
                icon={Activity}
                defaultOption="Any status"
              />
            </div>
          )}

          {showStageFilter && (
            <div className="w-full shrink-0 sm:w-40">
              <FilterSelectField
                value={selectedStages}
                onChange={onStagesChange}
                options={stageOptions}
                icon={GitBranch}
                defaultOption="All stages"
              />
            </div>
          )}

          <div className="w-full shrink-0 sm:w-40">
            <FilterSelectField
              value={selectedUniversity}
              onChange={onUniversityChange}
              options={universityOptions}
              icon={Building}
              defaultOption="All Institutions"
            />
          </div>

          <div className="w-full shrink-0 sm:w-40">
            <FilterSelectField
              value={selectedStageStatus}
              onChange={onStageStatusChange}
              options={stageStatusOptions}
              icon={Flag}
              defaultOption="All statuses"
            />
          </div>

          {resultsCount !== undefined && (activeFiltersCount > 0 || searchTerm !== "") && (
            <span aria-live="polite" className={`${tagBase} ${tagTones.brand} ub-tabular hidden sm:inline-flex`}>
              {resultsCount.toLocaleString()}
              <span className="font-normal">{resultsCount === 1 ? "result" : "results"}</span>
            </span>
          )}

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onClearFilters}
              className={`hidden h-10 shrink-0 items-center justify-center gap-2 rounded-ub-full px-4 text-ub-label-md text-ub-text-link transition-colors duration-ub-fast ease-ub-standard hover:bg-ub-action-secondary-hover active:bg-ub-action-secondary-pressed sm:inline-flex ${focusRing}`}
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
