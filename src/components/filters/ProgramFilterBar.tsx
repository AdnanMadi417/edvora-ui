"use client";

import React from "react";
import { SlidersHorizontal, Globe, GraduationCap, RefreshCw, Award, ArrowUpDown } from "lucide-react";
import { MdSchool } from "react-icons/md";
import { AiOutlineBank } from "react-icons/ai";
import FilterSelectField from "components/form/filter/FilterSelectField";
import MultiSelectFilterField from "components/form/filter/MultiSelectFilterField";
import SearchInput from "components/form/filter/SearchInput";

interface Option {
  label: string;
  value: string;
}

const SCHOLARSHIP_OPTIONS: Option[] = [
  { label: "Has Scholarship", value: "true" },
  { label: "No Scholarship", value: "false" },
];

const SORT_OPTIONS: Option[] = [
  { label: "Commission: High → Low", value: "commission_desc" },
  { label: "Commission: Low → High", value: "commission_asc" },
  { label: "Tuition: Low → High", value: "tuition_asc" },
  { label: "Tuition: High → Low", value: "tuition_desc" },
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

  sortBy?: string[];
  onSortChange?: (vals: string[]) => void;

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
  sortBy = [],
  onSortChange,
  resultsCount,
  activeFiltersCount,
  onClearFilters,
  showFilters,
  onToggleFilters,
  children,
}: ProgramFilterBarProps) {
  return (
    <div className="">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

        {/* Search + mobile toggle */}
        <div className="flex items-center gap-2 sm:contents">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            className="sm:w-64 sm:flex-none"
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
          <div className="w-full sm:w-40 flex-shrink-0">
            <FilterSelectField
              value={selectedState}
              onChange={onStateChange}
              options={stateOptions}
              icon={Globe}
              defaultOption="All Locations"
            />
          </div>

          <div className="w-full sm:w-36 flex-shrink-0">
            <FilterSelectField
              value={selectedField}
              onChange={onFieldChange}
              options={fieldOptions}
              icon={MdSchool}
              defaultOption="All Fields"
            />
          </div>

          <div className="w-full sm:w-40 flex-shrink-0">
            <FilterSelectField
              value={selectedUniversity}
              onChange={onUniversityChange}
              options={universityOptions}
              icon={AiOutlineBank}
              defaultOption="All Universities"
            />
          </div>

          <div className="w-full sm:w-40 flex-shrink-0">
            <FilterSelectField
              value={selectedQualId ?? "all"}
              onChange={(val) => onQualChange(val === "all" ? null : val)}
              options={qualificationOptions}
              icon={GraduationCap}
              defaultOption="All Qualifications"
            />
          </div>

          {onScholarshipChange && (
            <div className="w-full sm:w-40 flex-shrink-0">
              <FilterSelectField
                value={hasScholarship}
                onChange={onScholarshipChange}
                options={SCHOLARSHIP_OPTIONS}
                icon={Award}
                defaultOption="All Scholarships"
              />
            </div>
          )}

          {onSortChange && (
            <div className="w-full sm:w-48 flex-shrink-0">
              <MultiSelectFilterField
                value={sortBy}
                onChange={onSortChange}
                options={SORT_OPTIONS}
                icon={ArrowUpDown}
                placeholder="Default Sort"
              />
            </div>
          )}

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

        {children}
      </div>
    </div>
  );
}
