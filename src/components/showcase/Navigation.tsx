"use client";

import { useState } from "react";
import { FileText, CheckCircle2, Clock, AlertTriangle, LayoutGrid, Layers } from "lucide-react";
import Tabs from "components/ub/navigation/Tabs";
import type { TabItem } from "components/ub/navigation/Tabs";
import TablePagination from "components/ub/data/TablePagination";
import StatsFilterCards, { type FilterCardItem } from "components/ub/navigation/StatsFilterCards";
import ApplicationFilterBar from "components/ub/navigation/ApplicationFilterBar";
import SortControl from "components/ub/forms/SortControl";
import SearchInput from "components/ub/forms/SearchInput";
import FilterSelectField from "components/ub/forms/FilterSelectField";
import NavLink from "components/ub/navigation/NavLink";
import { Demo, ShowcaseSection, Variant } from "./Showcase";

type ProfileTab = "overview" | "applications" | "documents" | "commission" | "activity";
const TABS: TabItem<ProfileTab>[] = [
  { key: "overview", label: "Overview" },
  { key: "applications", label: "Applications" },
  { key: "documents", label: "Documents" },
  { key: "commission", label: "Commission" },
  { key: "activity", label: "Activity" },
];

const CARDS: FilterCardItem[] = [
  { id: null, label: "All applications", count: 24, icon: Layers, colorScheme: "slate" },
  { id: "action", label: "Action needed", count: 6, icon: AlertTriangle, colorScheme: "amber" },
  { id: "review", label: "In review", count: 9, icon: Clock, colorScheme: "blue" },
  { id: "offer", label: "Offers", count: 5, icon: CheckCircle2, colorScheme: "emerald" },
  { id: "draft", label: "Drafts", count: 4, icon: FileText, colorScheme: "violet" },
];

const STAGES = [
  { label: "Application submission", value: "stage_1" },
  { label: "Institution review", value: "stage_2" },
  { label: "Visa processing", value: "stage_3" },
];
const INSTITUTIONS = [
  { label: "Sunway University", value: "uni_004" },
  { label: "Taylor's University", value: "uni_002" },
  { label: "UCSI University", value: "uni_003" },
];
const STATUSES = [
  { label: "Documents pending", value: "s1" },
  { label: "Correction requested", value: "s2" },
];

export default function Navigation() {
  const [tab, setTab] = useState<ProfileTab>("overview");
  const [page, setPage] = useState(1);
  const [card, setCard] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [uni, setUni] = useState("");
  const [status, setStatus] = useState("");
  const [lifecycle, setLifecycle] = useState("active");
  const [showFilters, setShowFilters] = useState(true);
  const [sort, setSort] = useState("all");
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const active = [stage, uni, status].filter(Boolean).length;

  return (
    <ShowcaseSection id="navigation" title="Navigation and filters" description="Tabs, pagination and the filter/search controls used above tables.">
      <Demo name="Tabs" path="components/ub/navigation/Tabs.tsx">
        <Tabs<ProfileTab> tabs={TABS} active={tab} onChange={setTab} />
        <p className="mt-4 text-ub-body-sm text-ub-text-secondary">Active tab: {TABS.find((t) => t.key === tab)?.label}</p>
      </Demo>

      <Demo name="TablePagination" path="components/ub/data/TablePagination.tsx">
        <TablePagination currentPage={page} onPageChange={setPage} itemsPerPage={10} itemCount={page === 3 ? 4 : 10} totalCount={24} itemLabel="applications" />
      </Demo>

      <Demo name="StatsFilterCards" path="components/ub/navigation/StatsFilterCards.tsx">
        <StatsFilterCards cards={CARDS} selectedId={card} onSelect={setCard} />
      </Demo>

      <Demo name="ApplicationFilterBar" path="components/ub/navigation/ApplicationFilterBar.tsx">
        <ApplicationFilterBar
          searchTerm={search}
          onSearchChange={(e) => setSearch(e.target.value)}
          selectedStages={stage}
          onStagesChange={setStage}
          stageOptions={STAGES}
          showStageFilter
          selectedUniversity={uni}
          onUniversityChange={setUni}
          universityOptions={INSTITUTIONS}
          selectedStageStatus={status}
          onStageStatusChange={setStatus}
          stageStatusOptions={STATUSES}
          selectedLifecycle={lifecycle}
          onLifecycleChange={setLifecycle}
          showLifecycleFilter
          resultsCount={24}
          activeFiltersCount={active}
          onClearFilters={() => {
            setStage("");
            setUni("");
            setStatus("");
          }}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((s) => !s)}
        />
      </Demo>

      <Demo name="SearchInput, FilterSelectField, SortControl" path="components/ub/forms/" className="flex flex-wrap items-end gap-6">
        <Variant label="SearchInput" className="min-w-[240px] flex-1">
          <SearchInput value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} placeholder="Search students, Institutions…" />
        </Variant>
        <Variant label="FilterSelectField">
          <FilterSelectField
            value={country}
            onChange={setCountry}
            icon={LayoutGrid}
            defaultOption="All countries"
            options={[
              { label: "Malaysia", value: "MY" },
              { label: "Nigeria", value: "NG" },
              { label: "Bangladesh", value: "BD" },
            ]}
          />
        </Variant>
        <Variant label="SortControl">
          <SortControl value={sort} onChange={setSort} />
        </Variant>
      </Demo>

      <Demo name="NavLink" path="components/ub/navigation/NavLink.tsx" className="flex gap-4">
        <NavLink href="#navigation" className="text-ub-label-md text-ub-text-link hover:underline">
          Next.js link wrapper
        </NavLink>
      </Demo>
    </ShowcaseSection>
  );
}
