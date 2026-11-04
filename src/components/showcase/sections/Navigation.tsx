"use client";

import { useState } from "react";
import { FileText, CheckCircle2, Clock, AlertTriangle, LayoutGrid, Layers, User, FolderOpen, Wallet, Activity, List as ListIcon, Columns3, Bell, Settings, ShieldCheck, Users } from "lucide-react";
import Tabs, { tabPanelProps } from "components/ub/navigation/controls/Tabs";
import type { TabItem } from "components/ub/navigation/controls/Tabs";
import TablePagination from "components/ub/data/tables/TablePagination";
import StatsFilterCards, { type FilterCardItem } from "components/ub/navigation/controls/StatsFilterCards";
import ApplicationFilterBar from "components/ub/navigation/controls/ApplicationFilterBar";
import SortControl from "components/ub/forms/selection/SortControl";
import SearchInput from "components/ub/forms/selection/SearchInput";
import FilterSelectField from "components/ub/forms/selection/FilterSelectField";
import NavLink from "components/ub/navigation/links/NavLink";
import { Demo, ShowcaseSection, Variant } from "../Showcase";

type ProfileTab = "overview" | "applications" | "documents" | "commission" | "activity";
const TABS: TabItem<ProfileTab>[] = [
  { key: "overview", label: "Overview" },
  { key: "applications", label: "Applications" },
  { key: "documents", label: "Documents" },
  { key: "commission", label: "Commission" },
  { key: "activity", label: "Activity" },
];
const ICON_TABS: TabItem<ProfileTab>[] = [
  { key: "overview", label: "Overview", icon: User },
  { key: "applications", label: "Applications", icon: Layers, count: 3 },
  { key: "documents", label: "Documents", icon: FolderOpen, count: 2 },
  { key: "commission", label: "Commission", icon: Wallet },
  { key: "activity", label: "Activity", icon: Activity, disabled: true },
];
type ViewTab = "table" | "board" | "grid";
const VIEW_TABS: TabItem<ViewTab>[] = [
  { key: "table", label: "Table", icon: ListIcon },
  { key: "board", label: "Board", icon: Columns3 },
  { key: "grid", label: "Cards", icon: LayoutGrid },
];
type FilterTab = "all" | "unread" | "action";
const FILTER_TABS: TabItem<FilterTab>[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread", count: 12 },
  { key: "action", label: "Action needed", count: 4 },
];
type SettingsTab = "profile" | "team" | "notifications" | "security" | "general";
const SETTINGS_TABS: TabItem<SettingsTab>[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "team", label: "Team members", icon: Users, count: 8 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "general", label: "General", icon: Settings },
];

const CARDS: FilterCardItem[] = [
  { id: null, label: "All applications", count: 24, icon: Layers, colorScheme: "slate" },
  { id: "action", label: "Action needed", count: 6, icon: AlertTriangle, colorScheme: "amber", badge: { label: "Your move", tone: "attention" }, progress: 25 },
  { id: "review", label: "In review", count: 9, icon: Clock, colorScheme: "blue" },
  { id: "offer", label: "Offers", count: 5, icon: CheckCircle2, colorScheme: "emerald", badge: { label: "Payout", tone: "success" }, progress: 21 },
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
  const [view, setView] = useState<ViewTab>("table");
  const [filter, setFilter] = useState<FilterTab>("all");
  const [settings, setSettings] = useState<SettingsTab>("profile");
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
      <Demo name="Tabs" path="components/ub/navigation/controls/Tabs.tsx" description="Four variants share one API: icons (component, 16px), counts (99+ cap) and disabled tabs. Arrow keys move and activate, mirrored in RTL; Up/Down for vertical. Tabs never use the Primary fill.">
        <div className="grid gap-8">
          <Variant label="Underline (default): sections of one page">
            <Tabs<ProfileTab> tabs={TABS} active={tab} onChange={setTab} aria-label="Student profile" inset={false} />
          </Variant>
          <Variant label="Underline with icons, counts and a disabled tab">
            <Tabs<ProfileTab> tabs={ICON_TABS} active={tab} onChange={setTab} aria-label="Student profile with icons" inset={false} />
          </Variant>
          <Variant label="Underline, size sm">
            <Tabs<ProfileTab> tabs={ICON_TABS} active={tab} onChange={setTab} size="sm" aria-label="Student profile, small" inset={false} />
          </Variant>
          <div className="grid gap-8 md:grid-cols-2">
            <Variant label="Segmented: views of the same data">
              <div className="flex flex-wrap items-center gap-4">
                <Tabs<ViewTab> variant="segmented" tabs={VIEW_TABS} active={view} onChange={setView} aria-label="Layout" />
                <Tabs<ViewTab> variant="segmented" iconOnly size="sm" tabs={VIEW_TABS} active={view} onChange={setView} aria-label="Layout, icons only" />
              </div>
            </Variant>
            <Variant label="Segmented, full width">
              <Tabs<FilterTab> variant="segmented" fullWidth tabs={FILTER_TABS} active={filter} onChange={setFilter} aria-label="Notifications filter, full width" />
            </Variant>
            <Variant label="Pills: status filters above a list">
              <Tabs<FilterTab> variant="pills" tabs={FILTER_TABS} active={filter} onChange={setFilter} aria-label="Notifications filter" />
            </Variant>
            <Variant label="Pills, size sm with icons">
              <Tabs<ViewTab> variant="pills" size="sm" tabs={VIEW_TABS} active={view} onChange={setView} aria-label="Layout pills" />
            </Variant>
          </div>
          <Variant label="Vertical: settings and long profiles">
            <div className="grid gap-6 md:grid-cols-[240px_1fr]">
              <Tabs<SettingsTab> variant="vertical" tabs={SETTINGS_TABS} active={settings} onChange={setSettings} idPrefix="settings" aria-label="Settings" />
              <div {...tabPanelProps("settings", settings)} className="rounded-ub-lg border border-ub-border p-6 text-ub-body-sm text-ub-text-secondary">
                {SETTINGS_TABS.find((t) => t.key === settings)?.label} settings panel, labelled by its tab via tabPanelProps().
              </div>
            </div>
          </Variant>
        </div>
      </Demo>

      <Demo name="TablePagination" path="components/ub/data/tables/TablePagination.tsx">
        <TablePagination currentPage={page} onPageChange={setPage} itemsPerPage={10} itemCount={page === 3 ? 4 : 10} totalCount={24} itemLabel="applications" />
      </Demo>

      <Demo name="StatsFilterCards" path="components/ub/navigation/controls/StatsFilterCards.tsx">
        <StatsFilterCards cards={CARDS} selectedId={card} onSelect={setCard} />
      </Demo>

      <Demo name="ApplicationFilterBar" path="components/ub/navigation/controls/ApplicationFilterBar.tsx">
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

      <Demo name="NavLink" path="components/ub/navigation/links/NavLink.tsx" className="flex gap-4">
        <NavLink href="#navigation" className="text-ub-label-md text-ub-text-link hover:underline">
          Next.js link wrapper
        </NavLink>
      </Demo>
    </ShowcaseSection>
  );
}
