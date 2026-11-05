"use client";

import { useState } from "react";
import {
  sortRows,
  type DataTableSort,
} from "components/ub/data/tables/DataTable";
import UniversitiesDataTable from "features/universities/components/shared/UniversitiesDataTable";
import UniversityFilterPanel, {
  type UniversityFilterValues,
} from "features/universities/components/shared/filters/UniversityFilterPanel";
import UniversityProfileView from "features/universities/components/shared/UniversityProfileView";
import {
  sampleUniversities,
  sampleUniversityBranches,
} from "../fixtures/universities";
import { Demo } from "../Showcase";

const initial: UniversityFilterValues = {
  type: "all",
  isPublic: "all",
  hasLanguageCenter: "all",
  isHidden: "all",
};
export function UniversityTableDemo() {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(initial);
  const [sort, setSort] = useState<DataTableSort | null>(null);
  const rows = sampleUniversities.filter(
    (university) =>
      university.name.toLowerCase().includes(search.toLowerCase()) &&
      (filters.type === "all" ||
        university.university_type_name.toLowerCase() === filters.type) &&
      (filters.isPublic === "all" ||
        university.is_public === (filters.isPublic === "true")) &&
      (filters.hasLanguageCenter === "all" ||
        university.has_language_center ===
          (filters.hasLanguageCenter === "true"))
  );
  return (
    <Demo
      name="University table & filters"
      path="features/universities/components/shared/UniversitiesDataTable.tsx"
      description="Responsive directory using DataTable, an animated filter drawer, two-column intakes and icon actions. Sample links are for layout preview."
    >
      <div className="min-w-0 space-y-5">
        <UniversityFilterPanel
          searchTerm={search}
          onSearchChange={(event) => setSearch(event.target.value)}
          typeOptions={[
            { value: "extended", label: "Extended" },
            { value: "conditional", label: "Conditional" },
          ]}
          filters={filters}
          onApplyFilters={setFilters}
          onRemoveFilter={(key) =>
            setFilters((previous) => ({ ...previous, [key]: "all" }))
          }
          onClearAll={() => setFilters(initial)}
          showVisibility={false}
          resultsCount={rows.length}
        />
        <UniversitiesDataTable
          universities={
            sort
              ? sortRows(
                  rows,
                  [{ key: sort.key, header: sort.key, cell: () => null }],
                  sort
                )
              : rows
          }
          basePath="/partner/universities"
          loading={false}
          error={null}
          onRetry={() => {}}
          page={1}
          onPageChange={() => {}}
          total={rows.length}
          sort={sort}
          onSortChange={setSort}
        />
      </div>
    </Demo>
  );
}
export function UniversityProfileDemo() {
  return (
    <Demo
      name="University profile"
      path="features/universities/components/shared/UniversityProfileView.tsx"
      description="Shared university profile with study intakes, campuses, status and an overview. Management views also include payment methods."
    >
      <UniversityProfileView
        university={sampleUniversities[0]}
        branches={sampleUniversityBranches}
        basePath="/partner/universities"
      />
    </Demo>
  );
}
