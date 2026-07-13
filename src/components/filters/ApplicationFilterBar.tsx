"use client";

import React from "react";
import { SlidersHorizontal, Building, GitBranch, Flag, RefreshCw, Activity } from "lucide-react";
import FilterSelectField from "components/form/filter/FilterSelectField";
import SearchInput from "components/form/filter/SearchInput";

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
            placeholder="Search applications..."
            className="sm:w-56 sm:flex-none"
          />
          <button
            className="relative sm:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
            onClick={onToggleFilters}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {activeFiltersCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="sm:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-200 bg-white text-red-500 hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Collapsible dropdowns */}
        <div className={`flex w-full flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out sm:contents ${showFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"}`}>

          {showLifecycleFilter && onLifecycleChange && (
            <div className="w-full sm:w-36 flex-shrink-0">
              <FilterSelectField
                value={selectedLifecycle}
                onChange={onLifecycleChange}
                options={LIFECYCLE_OPTIONS}
                icon={Activity}
                defaultOption="All Status"
              />
            </div>
          )}

          {showStageFilter && (
            <div className="w-full sm:w-36 flex-shrink-0">
              <FilterSelectField
                value={selectedStages}
                onChange={onStagesChange}
                options={stageOptions}
                icon={GitBranch}
                defaultOption="All Stages"
              />
            </div>
          )}

          <div className="w-full sm:w-36 flex-shrink-0">
            <FilterSelectField
              value={selectedUniversity}
              onChange={onUniversityChange}
              options={universityOptions}
              icon={Building}
              defaultOption="All Universities"
            />
          </div>

          <div className="w-full sm:w-36 flex-shrink-0">
            <FilterSelectField
              value={selectedStageStatus}
              onChange={onStageStatusChange}
              options={stageStatusOptions}
              icon={Flag}
              defaultOption="All Statuses"
            />
          </div>

          {resultsCount !== undefined && (activeFiltersCount > 0 || searchTerm !== "") && (
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
              {resultsCount.toLocaleString()}
              <span className="font-normal text-blue-500">results</span>
            </span>
          )}

          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="hidden sm:flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
