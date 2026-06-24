"use client";

import React from "react";
import { SlidersHorizontal, Globe, GraduationCap, RefreshCw } from "lucide-react";
import { MdSchool } from "react-icons/md";
import { AiOutlineBank } from "react-icons/ai";
import FilterSelectField from "components/form/filter/FilterSelectField";
import SearchInput from "components/form/filter/SearchInput";

interface Option {
  label: string;
  value: string;
}

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
        </div>

        {/* Collapsible dropdowns */}
        <div className={`flex w-full flex-col gap-3 overflow-hidden transition-all duration-300 ease-in-out sm:contents ${showFilters ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 sm:max-h-none sm:opacity-100"}`}>
          <div className="w-full sm:w-44 flex-shrink-0">
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

          <div className="w-full sm:w-44 flex-shrink-0">
            <FilterSelectField
              value={selectedUniversity}
              onChange={onUniversityChange}
              options={universityOptions}
              icon={AiOutlineBank}
              defaultOption="All Universities"
            />
          </div>

          <div className="w-full sm:w-44 flex-shrink-0">
            <FilterSelectField
              value={selectedQualId ?? "all"}
              onChange={(val) => onQualChange(val === "all" ? null : val)}
              options={qualificationOptions}
              icon={GraduationCap}
              defaultOption="All Qualifications"
            />
          </div>

          {activeFiltersCount > 0 && (
            <button
              onClick={onClearFilters}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>

        {children}
      </div>
    </div>
  );
}
