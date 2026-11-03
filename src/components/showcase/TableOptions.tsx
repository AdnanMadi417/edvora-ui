"use client";

import { useMemo, useState } from "react";
import { Download, UserPlus, UserRoundCog, XCircle } from "lucide-react";
import Amount from "components/ub/core/Amount";
import Button from "components/ub/core/Button";
import DataTable, { DataTablePrimaryCell, type DataTableColumn, type DataTableDensity } from "components/ub/data/DataTable";
import DataTableToolbar from "components/ub/data/DataTableToolbar";
import DaysTag from "components/ub/data/DaysTag";
import StageTag from "components/ub/data/StageTag";
import Tag from "components/ub/data/Tag";
import TablePagination from "components/ub/data/TablePagination";
import Chip from "components/ub/data/Chip";
import { Demo, ShowcaseSection } from "./Showcase";

type App = { id: string; student: string; ref: string; stage: string; institution: string; advisor: string; days: number; commission: number; status: "expected" | "paid" };

const APPS: App[] = [
  { id: "a1", student: "Nur Aisyah Binti Kamal", ref: "UBX-2026-0412", stage: "offer-received", institution: "Sunway University", advisor: "Farid Hakimi", days: 3, commission: 4200, status: "expected" },
  { id: "a2", student: "Chinedu Okafor", ref: "UBX-2026-0398", stage: "visa-in-progress", institution: "Taylor's University", advisor: "Lim Wei Jie", days: 9, commission: 3800, status: "paid" },
  { id: "a3", student: "Tanvir Hossain", ref: "UBX-2026-0407", stage: "institution-review", institution: "UCSI University", advisor: "Priya Nair", days: 16, commission: 3000, status: "expected" },
  { id: "a4", student: "Sara Mahmoud", ref: "UBX-2026-0415", stage: "documents-pending", institution: "Asia Pacific University", advisor: "Farid Hakimi", days: 5, commission: 2600, status: "expected" },
  { id: "a5", student: "Grace Wanjiru", ref: "UBX-2026-0420", stage: "submitted", institution: "Sunway University", advisor: "Lim Wei Jie", days: 1, commission: 4200, status: "expected" },
  { id: "a6", student: "Ahmed Al-Sayed", ref: "UBX-2026-0388", stage: "enrolled", institution: "Taylor's University", advisor: "Priya Nair", days: 22, commission: 3800, status: "paid" },
];

const COLUMNS: DataTableColumn<App>[] = [
  { key: "student", header: "Student", cell: (r) => <DataTablePrimaryCell name={r.student} reference={r.ref} />, sortable: true, sortValue: (r) => r.student },
  { key: "stage", header: "Stage", cell: (r) => <StageTag stageId={r.stage} size="sm" />, sortable: true },
  { key: "institution", header: "Institution", cell: (r) => r.institution, sortable: true },
  { key: "advisor", header: "Advisor", cell: (r) => r.advisor },
  { key: "days", header: "In stage", cell: (r) => <DaysTag mode="inStage" days={r.days} size="sm" />, sortable: true },
  { key: "commission", header: "Commission", cell: (r) => <Amount value={r.commission} />, align: "end", sortable: true },
];
const COLUMN_OPTIONS = [
  { key: "student", label: "Student", locked: true },
  { key: "stage", label: "Stage" },
  { key: "institution", label: "Institution" },
  { key: "advisor", label: "Advisor" },
  { key: "days", label: "In stage" },
  { key: "commission", label: "Commission" },
];
const STAGE_FILTERS = [
  { id: "all", label: "All" },
  { id: "action", label: "Action needed" },
  { id: "offer-received", label: "Offer received" },
  { id: "visa-in-progress", label: "Visa in progress" },
];

function StandardDemo() {
  const [query, setQuery] = useState("");
  const [density, setDensity] = useState<DataTableDensity>("comfortable");
  const [hidden, setHidden] = useState<string[]>(["advisor"]);
  const rows = useMemo(() => APPS.filter((a) => `${a.student} ${a.ref} ${a.institution}`.toLowerCase().includes(query.toLowerCase())), [query]);
  return (
    <>
      <DataTableToolbar
        search={{ value: query, onChange: setQuery, placeholder: "Search students, references or Institutions" }}
        density={{ value: density, onChange: setDensity }}
        columns={{ options: COLUMN_OPTIONS, hidden, onChange: setHidden }}
        resultLabel={`${rows.length} applications`}
        actions={<Button variant="primary" size="sm" icon={<UserPlus className="h-4 w-4" aria-hidden="true" />} text="Add student" />}
      />
      <DataTable<App>
        caption="Applications"
        columns={COLUMNS}
        rows={rows}
        getRowId={(r) => r.id}
        density={density}
        hiddenColumns={hidden}
        getRowHref={() => "#c-table-standard"}
        defaultSort={{ key: "student", direction: "asc" }}
        empty={{ title: "No matching applications", description: "Try a different name, reference or Institution." }}
      />
    </>
  );
}

function SelectableDemo() {
  const [stage, setStage] = useState("all");
  const [selected, setSelected] = useState<string[]>([]);
  const [allMatching, setAllMatching] = useState(false);
  const [page, setPage] = useState(1);
  const rows = APPS.filter((a) => stage === "all" || (stage === "action" ? a.days >= 8 : a.stage === stage));
  return (
    <>
      <DataTableToolbar
        filters={
          <div role="group" aria-label="Filter by stage" className="flex flex-wrap gap-2">
            {STAGE_FILTERS.map((f) => (
              <Chip key={f.id} selected={stage === f.id} onSelectedChange={() => setStage(f.id)}>
                {f.label}
              </Chip>
            ))}
          </div>
        }
        density={{ value: "compact", onChange: () => undefined }}
        resultLabel={`${rows.length} of 248 applications`}
      />
      <DataTable<App>
        caption="Applications for bulk actions"
        columns={COLUMNS}
        rows={rows}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.student}
        density="compact"
        selectable
        selectedIds={selected}
        onSelectionChange={setSelected}
        isRowSelectable={(r) => (r.status === "paid" ? "Commission already paid" : true)}
        totalCount={248}
        allMatchingSelected={allMatching}
        onSelectAllMatchingChange={setAllMatching}
        selectionResetKey={stage}
        stickyFirstColumn
        getRowClassName={(r) => (r.status === "paid" ? "opacity-60" : undefined)}
        bulkActions={(ids, clear, ctx) => (
          <>
            <Button variant="primary" size="sm" icon={<UserRoundCog className="h-4 w-4" aria-hidden="true" />} text="Reassign Advisor" onClick={clear} />
            <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" aria-hidden="true" />} text={ctx.allMatching ? "Export all results" : `Export ${ids.length}`} />
          </>
        )}
        footer={<TablePagination currentPage={page} onPageChange={setPage} itemsPerPage={6} itemCount={rows.length} totalCount={248} itemLabel="applications" />}
      />
    </>
  );
}

function CardsDemo() {
  return (
    <div className="max-w-ub-form-sm">
      <DataTable<App>
        caption="Applications as cards"
        layout="cards"
        columns={COLUMNS.filter((c) => c.key !== "advisor")}
        rows={APPS.slice(0, 3)}
        getRowId={(r) => r.id}
        getRowHref={() => "#c-table-card-list"}
      />
    </div>
  );
}

export default function TableOptions() {
  return (
    <ShowcaseSection id="table-options" title="Table options" description="One DataTable, several options.">
      <Demo
        name="Table: Standard"
        path="components/ub/data/DataTable.tsx"
        description="Default table with the toolbar: search, result count, density and a Columns menu (Student can't be hidden). Each row opens the application: the name is a link that covers the row. Below 768px rows stack."
        code={`<DataTableToolbar
  search={{ value: query, onChange: setQuery, placeholder: "Search students" }}
  density={{ value: density, onChange: setDensity }}
  columns={{ options, hidden, onChange: setHidden }}
  resultLabel={\`\${rows.length} applications\`}
/>
<DataTable caption="Applications" columns={columns} rows={rows} getRowId={(r) => r.id}
  density={density} hiddenColumns={hidden} getRowHref={(r) => \`/partner/applications/\${r.id}\`} />`}
        props={[
          { name: "density", type: '"comfortable" | "compact"', default: '"comfortable"', description: "56px rows for Advisors, 44px for staff (brief §4.6)." },
          { name: "getRowHref", type: "(row) => string", description: "First column becomes a link covering the row; other interactive cells stay clickable." },
          { name: "hiddenColumns", type: "string[]", description: "Keys hidden by the Columns menu." },
          { name: "stickyFirstColumn", type: "boolean", default: "false", description: "Pins the first column on wide tables (768px+)." },
          { name: "getRowClassName", type: "(row, index) => string | undefined", description: "Extra classes for one row, e.g. opacity-60 for paid or voided entries. Tokens and opacity only." },
          { name: "sort / defaultSort / manualSort", type: "{ key, direction } / boolean", description: "Client sorting, or server-sorted rows." },
        ]}
      >
        <StandardDemo />
      </Demo>

      <Demo
        name="Table: Selectable"
        path="components/ub/data/DataTable.tsx"
        description="Checkbox column with select all on the page, then Select all 248 results. Shift-click selects a range, Esc clears, paid rows can't be selected (hover for why). Changing the filter clears the selection and says so. The bulk-action bar floats at the bottom."
        code={`<DataTable
  selectable
  selectedIds={selected}
  onSelectionChange={setSelected}
  isRowSelectable={(r) => (r.paid ? "Commission already paid" : true)}
  totalCount={248}
  allMatchingSelected={allMatching}
  onSelectAllMatchingChange={setAllMatching}
  selectionResetKey={filtersKey}
  bulkActions={(ids, clear, { allMatching }) => <Button variant="primary" size="sm" text="Reassign Advisor" />}
  ...
/>`}
        props={[
          { name: "selectable / selectedIds / onSelectionChange", type: "boolean / string[] / (ids) => void", description: "Controlled or uncontrolled selection." },
          { name: "isRowSelectable", type: "(row) => true | string", description: "A string disables the row's checkbox and explains why." },
          { name: "totalCount / allMatchingSelected / onSelectAllMatchingChange", type: "number / boolean / (all) => void", description: "Offers Select all N results across pages; bulk actions then get allMatching." },
          { name: "selectionResetKey", type: "string", description: "Clears the selection (and announces it) when filters change." },
          { name: "bulkActions", type: "(ids, clear, { allMatching, count }) => ReactNode", description: "One Primary plus secondary actions; confirm destructive ones naming the count." },
        ]}
      >
        <SelectableDemo />
      </Demo>

      <Demo
        name="Table: Card list"
        path="components/ub/data/DataTable.tsx"
        description="layout=&quot;cards&quot; keeps the stacked label: value cards at every width: narrow panels, Knowledge Hub lists. Tables use this automatically below 768px."
        code={`<DataTable layout="cards" caption="Applications" columns={columns} rows={rows} getRowId={(r) => r.id} />`}
      >
        <CardsDemo />
      </Demo>

      <Demo
        name="DataTableToolbar"
        path="components/ub/data/DataTableToolbar.tsx"
        description="Every part is optional and wraps on small screens. Density is a radio group (a setting, not tabs); the result count is announced politely."
        props={[
          { name: "search", type: "{ value, onChange, placeholder?, label? }", description: "Pill search field." },
          { name: "filters", type: "ReactNode", description: "Chips or filter selects." },
          { name: "density", type: "{ value, onChange }", description: "Comfortable / compact radio group." },
          { name: "columns", type: "{ options: { key, label, locked? }[], hidden, onChange }", description: "Show columns menu." },
          { name: "resultLabel / actions", type: "ReactNode", description: "Result count; end-side actions." },
        ]}
      >
        <DataTableToolbar
          search={{ value: "", onChange: () => undefined, placeholder: "Search" }}
          filters={<Tag tone="brand">Stage: Offer received</Tag>}
          density={{ value: "comfortable", onChange: () => undefined }}
          columns={{ options: COLUMN_OPTIONS, hidden: [], onChange: () => undefined }}
          resultLabel="248 applications"
          actions={<Button variant="secondary" size="sm" icon={<XCircle className="h-4 w-4" aria-hidden="true" />} text="Clear filters" />}
        />
      </Demo>
    </ShowcaseSection>
  );
}
