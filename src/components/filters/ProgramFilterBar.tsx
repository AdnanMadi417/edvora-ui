"use client";

import React from "react";
import { SlidersHorizontal, Globe, GraduationCap, RefreshCw, Award } from "lucide-react";
import { MdSchool } from "react-icons/md";
import { AiOutlineBank } from "react-icons/ai";
import FilterSelectField from "components/form/filter/FilterSelectField";
import SortControl from "components/form/filter/SortControl";
import SearchInput from "components/form/filter/SearchInput";

interface Option {
  label: string;
  value: string;
}

const SCHOLARSHIP_OPTIONS: Option[] = [
  { label: "Has Scholarship", value: "true" },
  { label: "No Scholarship", value: "false" },
];

interface ProgramFilterBarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;

  selectedState: string;
  onStateChange: (val: string) => void;
  stateOptions: Option[];

  selectedField: string;
  onFieldChange: (val: string) => void;
  fieldOptions: Option[];

  selectedUniversity: string;
  onUniversityChange: (val: string) => void;
  universityOptions: Option[];

  selectedQualId: string | null;
  onQualChange: (id: string | null) => void;
  qualificationOptions: Option[];

  hasScholarship?: string;
  onScholarshipChange?: (val: string) => void;

  sortBy?: string;
  onSortChange?: (val: string) => void;

  resultsCount?: number;

  activeFiltersCount: number;
  onClearFilters: () => void;
  showFilters: boolean;
  onToggleFilters: () => void;

  children?: React.ReactNode;
}

export default function ProgramFilterBar({
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search programs...",
  selectedState,
  onStateChange,
  stateOptions,
  selectedField,
  onFieldChange,
  fieldOptions,
  selectedUniversity,
  onUniversityChange,
  universityOptions,
  selectedQualId,
  onQualChange,
  qualificationOptions,
  hasScholarship = "all",
  onScholarshipChange,
  sortBy = "all",
  onSortChange,
  resultsCount,
  activeFiltersCount,
  onClearFilters,
  showFilters,
  onToggleFilters,
  children,
}: ProgramFilterBarProps) {
  return (
    <div className="flex flex-col gap-3">

      {/* Row 1: Search + mobile toggle + 3 dropdowns (desktop only) */}
      <div className="flex items-center gap-3">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          className="flex-1"
        />

        {/* Mobile: toggle + clear */}
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

        {/* Desktop: 3 dropdowns inline in row 1 */}
        <div className="hidden sm:flex flex-[3] gap-3">
          <div className="flex-1">
            <FilterSelectField
              value={selectedState}
              onChange={onStateChange}
              options={stateOptions}
              icon={Globe}
              defaultOption="All Locations"
            />
          </div>
          <div className="flex-1">
            <FilterSelectField
              value={selectedField}
              onChange={onFieldChange}
              options={fieldOptions}
              icon={MdSchool}
              defaultOption="All Fields"
            />
          </div>
          <div className="flex-1">
            <FilterSelectField
              value={selectedUniversity}
              onChange={onUniversityChange}
              options={universityOptions}
              icon={AiOutlineBank}
              defaultOption="All Universities"
            />
          </div>
        </div>
      </div>

      {/* Rows 2+: collapsible on mobile, always visible on desktop */}
      <div className={showFilters ? "flex flex-col gap-3" : "hidden sm:flex sm:flex-col sm:gap-3"}>

        {/* Mobile only: state / field / university */}
        <div className="flex flex-col gap-3 sm:hidden">
          <FilterSelectField
            value={selectedState}
            onChange={onStateChange}
            options={stateOptions}
            icon={Globe}
            defaultOption="All Locations"
          />
          <FilterSelectField
            value={selectedField}
            onChange={onFieldChange}
            options={fieldOptions}
            icon={MdSchool}
            defaultOption="All Fields"
          />
          <FilterSelectField
            value={selectedUniversity}
            onChange={onUniversityChange}
            options={universityOptions}
            icon={AiOutlineBank}
            defaultOption="All Universities"
          />
        </div>

        {/* Row 2: Qualification + Scholarship + results + clear (desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1">
            <FilterSelectField
              value={selectedQualId ?? "all"}
              onChange={(val) => onQualChange(val === "all" ? null : val)}
              options={qualificationOptions}
              icon={GraduationCap}
              defaultOption="All Qualifications"
            />
          </div>
          {onScholarshipChange && (
            <div className="flex-1">
              <FilterSelectField
                value={hasScholarship}
                onChange={onScholarshipChange}
                options={SCHOLARSHIP_OPTIONS}
                icon={Award}
                defaultOption="All Scholarships"
              />
            </div>
          )}
          <div className="hidden sm:flex items-center gap-3">
            {resultsCount !== undefined && (activeFiltersCount > 0 || searchTerm !== "") && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
                {resultsCount.toLocaleString()}
                <span className="font-normal text-blue-500">results</span>
              </span>
            )}
            {activeFiltersCount > 0 && (
              <button
                onClick={onClearFilters}
                className="flex shrink-0 items-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <RefreshCw className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Sort */}
        {onSortChange && <SortControl value={sortBy} onChange={onSortChange} />}
      </div>

      {children}
    </div>
  );
}
