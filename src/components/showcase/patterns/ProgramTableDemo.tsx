"use client";

import { useState } from "react";
import ProgramFilterPanel, {
  type ProgramFilterValues,
} from "features/programs/components/shared/filters/ProgramFilterPanel";
import KnowledgeHubTable from "features/programs/components/shared/table/KnowledgeHubTable";
import { sampleProgram } from "../fixtures/program";
import { Demo } from "../Showcase";

const initial: ProgramFilterValues = {
  state: "all",
  field: "all",
  university: "all",
  qualId: null,
  scholarship: "all",
  courseType: "all",
  classType: "all",
};
export default function ProgramTableDemo() {
  const [filters, setFilters] = useState(initial);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("all");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const program = {
    ...sampleProgram,
    commission_amount: 4200,
    commission_currency: "MYR",
  };
  const matches =
    program.name.toLowerCase().includes(search.toLowerCase()) &&
    (filters.state === "all" || filters.state === "kl") &&
    filters.scholarship !== "false";
  const rows = matches ? [program] : [];
  return (
    <Demo
      name="Program table & filters"
      path="features/programs/components/shared/table/KnowledgeHubTable.tsx"
      description="Shared DataTable with stacked mobile rows, commission, selection and reusable buttons. Program filters use the full-width mobile Drawer with fixed footer actions."
    >
      <div className="min-w-0 space-y-5">
        <ProgramFilterPanel
          searchTerm={search}
          onSearchChange={(event) => setSearch(event.target.value)}
          stateOptions={[{ value: "kl", label: "Kuala Lumpur" }]}
          fieldOptions={[]}
          universityOptions={[]}
          qualificationOptions={[]}
          filters={filters}
          onApplyFilters={setFilters}
          onRemoveFilter={(key) =>
            setFilters((previous) => ({ ...previous, [key]: initial[key] }))
          }
          onClearAll={() => setFilters(initial)}
          sortBy={sort}
          onSortChange={setSort}
          resultsCount={rows.length}
        />
        <KnowledgeHubTable
          programs={rows}
          loading={false}
          isFetching={false}
          error={null}
          refetch={() => {}}
          currentPage={1}
          onPageChange={() => {}}
          itemsPerPage={10}
          total={rows.length}
          selectedPrograms={selected}
          selectedCount={selected[program.id] ? 1 : 0}
          onSelectProgram={(id) =>
            setSelected((previous) => ({ ...previous, [id]: !previous[id] }))
          }
          isSelectingAll={false}
          onSelectAll={() =>
            setSelected((previous) => ({ [program.id]: !previous[program.id] }))
          }
          onRowClick={() => {}}
          editHref={() => "#c-program-details"}
          hideDelete
        />
      </div>
    </Demo>
  );
}
