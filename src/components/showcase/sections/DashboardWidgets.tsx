"use client";

// Style-guide demos for components/ub/dashboard, with Unibexs mock data.

import { useState } from "react";
import { Bell, CalendarClock, ClipboardCheck, Download, FileCheck2, FileUp, GraduationCap, Plane, Plus, Users, Wallet } from "lucide-react";
import Amount from "components/ub/core/typography/Amount";
import Button from "components/ub/core/buttons/Button";
import TextButton from "components/ub/core/buttons/TextButton";
import {
  ActivityHeatmap,
  BreakdownTable,
  CardFooterStats,
  CardLinkButton,
  CardMenu,
  CategoryColumnChart,
  ChartLegend,
  CountdownCard,
  DashboardCard,
  DashboardHeader,
  DeltaPill,
  GaugeChart,
  GaugeLegendStats,
  IconTile,
  PeopleList,
  PeopleListItem,
  PeriodSelect,
  PillBarChart,
  PipelineBar,
  PipelineFlow,
  ProgressCard,
  ReminderCard,
  Sparkline,
  StatCard,
  StatTile,
  StatusTag,
  DonutStatsCard,
  GroupedBarChart,
  AreaLineChart,
  AvatarStrip,
  RadialStatsCard,
  TaskList,
  TaskListItem,
  type DashboardPeriod,
  type WidgetState,
} from "components/ub/dashboard";
import { Demo, ShowcaseSection, StateSwitch, ThemePreviews } from "../Showcase";

const NOW = new Date("2026-11-03T09:00:00+08:00");
const STATES = ["ready", "loading", "empty", "error"] as const;
const noop = () => undefined;

const WEEK = [
  { label: "Mon", value: 14 },
  { label: "Tue", value: 22 },
  { label: "Wed", value: 18 },
  { label: "Thu", value: 31 },
  { label: "Fri", value: 26 },
  { label: "Sat", value: 9, status: "pending" as const },
  { label: "Sun", value: 6, status: "pending" as const },
];
const BY_INSTITUTION = [
  { key: "sunway", label: "Sunway", value: 48 },
  { key: "taylors", label: "Taylor's", value: 36 },
  { key: "ucsi", label: "UCSI", value: 27 },
  { key: "apu", label: "APU", value: 22 },
  { key: "inti", label: "INTI", value: 15 },
];
const HOURS = ["9am", "10", "11", "12pm", "1", "2", "3", "4", "5"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const UPLOADS = DAYS.map((_, d) => HOURS.map((_, h) => (d > 4 ? Math.max(0, (h * 3 + d) % 4 - 1) : ((d + 1) * (h + 2) * 7) % 13)));
const PLACEMENT = [
  { label: "Placed", value: 62, color: "cat-1" as const },
  { label: "In progress", value: 27, color: "cat-2" as const },
  { label: "Withdrawn", value: 11, color: "cat-3" as const },
];
const FLOW_STAGES = [
  { id: "s1", label: "Application Submission", count: 6, stageId: "documents-pending" },
  { id: "s2", label: "Institution Review", count: 4, stageId: "institution-review" },
  { id: "s3", label: "Offer & Visa Payment", count: 3, stageId: "offer-received" },
  { id: "s4", label: "Visa Processing", count: 5, stageId: "visa-in-progress" },
  { id: "s5", label: "Arrival & Enrollment", count: 2, stageId: "arrival-logistics" },
  { id: "s6", label: "Commission Invoicing", count: 3, stageId: "enrolled" },
];

const COUNTS = { enquiry: 18, "documents-pending": 24, submitted: 15, "institution-review": 21, "offer-received": 12, "visa-in-progress": 9, "arrival-logistics": 5, enrolled: 7 };

function useStateSwitch() {
  return useState<WidgetState>("ready");
}

export default function DashboardWidgets() {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const [chartState, setChartState] = useStateSwitch();
  const [listState, setListState] = useStateSwitch();
  const [statState, setStatState] = useState<"ready" | "loading" | "error">("ready");
  const pick = (s: WidgetState) => (s === "ready" ? undefined : s);

  return (
    <ShowcaseSection id="dashboard-widgets" title="Dashboard widgets" description="components/ub/dashboard: presentational widgets for dashboards. All of them composed on one page: /ui-unibexs-template-2026/dashboard.">
      <Demo
        name="DashboardHeader and PeriodSelect"
        path="components/ub/dashboard/shared/DashboardHeader.tsx"
        description="Title, one line of context, secondary actions then the one Primary on the end side; wraps on mobile. PeriodSelect is a native select styled as a pill (This week / This month / This intake / This year)."
        code={`<DashboardHeader
  title="Good morning, Farid"
  subtitle="14 applications need you today."
  secondaryActions={<PeriodSelect value={period} onChange={setPeriod} />}
  primaryAction={<Button variant="primary" text="Add student" />}
/>`}
        props={[
          { name: "title / subtitle", type: "ReactNode", description: "heading-xl title and a body line." },
          { name: "primaryAction / secondaryActions", type: "ReactNode", description: "One Primary; secondaries before it." },
          { name: "PeriodSelect value / onChange / options", type: '"week" | "month" | "intake" | "year"', description: "Controlled; options sets which periods show." },
        ]}
      >
        <ThemePreviews className="xl:grid-cols-1">
          <DashboardHeader
            as="h3"
            title="Good morning, Farid"
            subtitle="14 applications need you today."
            secondaryActions={<PeriodSelect value={period} onChange={setPeriod} />}
            primaryAction={<Button variant="primary" icon={<Plus className="h-4 w-4" aria-hidden="true" />} text="Add student" />}
          />
        </ThemePreviews>
      </Demo>

      <Demo
        name="DashboardCard, CardMenu, CardLinkButton and CardFooterStats"
        path="components/ub/dashboard/cards/DashboardCard.tsx"
        description="Card shell: title, controls (PeriodSelect, ⋯ menu with View all / Export / Hide, round ↗ link), body that swaps to loading / empty / error, and an optional footer of 2–3 stats with hairline dividers."
        code={`<DashboardCard
  title="Applications this week"
  actions={<><CardMenu onViewAll={…} onExport={…} onHide={…} /><CardLinkButton href="/admin/applications" label="Open Application Tracker" /></>}
  state={state}
  footer={<CardFooterStats items={[{ label: "Submitted", value: "126" }, { label: "Offers", value: "38" }]} />}
>
  <PillBarChart data={week} label="Applications per day" />
</DashboardCard>`}
        props={[
          { name: "title / subtitle / actions", type: "ReactNode", description: "Header; actions sit on the end side." },
          { name: "state / emptyMessage / errorMessage / onRetry", type: "WidgetState / string / string / () => void", description: "Body swaps to the matching state." },
          { name: "variant", type: '"default" | "highlighted"', default: '"default"', description: "Highlighted uses the brand fill; one per view." },
          { name: "footer", type: "ReactNode", description: "Usually CardFooterStats." },
          { name: "skeleton", type: '"lines" | "chart" | "list" | "stat"', description: "Loading shape." },
        ]}
      >
        <StateSwitch<WidgetState> value={chartState} options={STATES} onChange={setChartState} label="Card state" />
        <ThemePreviews>
          <DashboardCard
            title="Applications this week"
            subtitle="Weekend is still pending"
            state={chartState}
            skeleton="chart"
            emptyMessage="No applications this week yet."
            onRetry={() => setChartState("ready")}
            actions={
              <>
                <CardMenu onViewAll={noop} onExport={noop} onHide={noop} label="Applications options" />
                <CardLinkButton href="#c-dashboardcard-cardmenu-cardlinkbutton-and-cardfooterstats" label="Open Application Tracker" />
              </>
            }
            footer={<CardFooterStats items={[{ label: "Submitted", value: "126" }, { label: "Offers", value: "38" }, { label: "Placed", value: "21" }]} />}
          >
            <PillBarChart data={WEEK} label="Applications per day" unit="applications" />
          </DashboardCard>
        </ThemePreviews>
      </Demo>

      <Demo
        name="StatCard, DeltaPill and IconTile"
        path="components/ub/dashboard/cards/StatCard.tsx"
        description="Label, big tabular value, delta pill (green when the change is good, red when bad; arrow and sign, so never colour alone) and caption. Variants: default, highlighted (brand fill, one per view), with icon, with mini bars."
        code={`<StatCard label="Commission paid" value={<Amount value={84200} />} delta={{ value: 12, comparedTo: "vs last month" }} caption="RM75,100 last month" variant="icon" icon={Wallet} />`}
        props={[
          { name: "label / value / caption", type: "string / ReactNode / ReactNode", description: "Value uses Amount or Numeral." },
          { name: "delta", type: "{ value, unit?, goodWhen?, comparedTo? }", description: "DeltaPill; goodWhen=\"down\" for metrics where lower is better." },
          { name: "variant", type: '"default" | "highlighted" | "icon" | "bars"', default: '"default"', description: "Highlighted: brand fill. Icon: IconTile. Bars: mini bars from `bars`." },
          { name: "icon / iconTone / bars / action", type: "IconComponent / tone / number[] / ReactNode", description: "Variant extras; action is usually a CardLinkButton." },
          { name: "state", type: '"ready" | "loading" | "error"', description: "Skeleton or error with Try again." },
        ]}
      >
        <StateSwitch<"ready" | "loading" | "error"> value={statState} options={["ready", "loading", "error"] as const} onChange={setStatState} label="Stat state" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard state={statState} onRetry={() => setStatState("ready")} variant="highlighted" icon={GraduationCap} label="Students placed" value="21" delta={{ value: 18, comparedTo: "vs last intake" }} caption="Target 30 this intake" action={<CardLinkButton href="#" label="Open placed students" tone="secondary" />} />
          <StatCard state={statState} onRetry={() => setStatState("ready")} variant="icon" icon={Wallet} iconTone="success" label="Commission paid" value={<Amount value={84200} />} delta={{ value: 12, comparedTo: "vs last month" }} caption="RM75,100 last month" />
          <StatCard state={statState} onRetry={() => setStatState("ready")} variant="bars" label="Applications" value="126" bars={[8, 12, 9, 14, 18, 15, 22, 19, 26]} delta={{ value: -4, comparedTo: "vs last week" }} caption="9 weeks" />
          <StatCard state={statState} onRetry={() => setStatState("ready")} label="Average days in stage" value="6.4" delta={{ value: -1.2, unit: " days", goodWhen: "down", comparedTo: "vs last month" }} caption="Lower is better" />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <DeltaPill value={12} comparedTo="vs last month" />
          <DeltaPill value={-4.5} comparedTo="vs last week" />
          <DeltaPill value={3} unit="" goodWhen="down" comparedTo="overdue vs yesterday" />
          <DeltaPill value={0} />
          <IconTile icon={FileCheck2} tone="brand" size="sm" />
          <IconTile icon={Wallet} tone="success" />
          <IconTile icon={Bell} tone="warning" size="lg" />
        </div>
      </Demo>

      <Demo
        name="StatTile"
        path="components/ub/dashboard/cards/StatTile.tsx"
        description="KPI tile used on every role home: a tray holding the stat card (label, big tabular value, optional change pill, icon on the end) and a footer line that links to the list behind the number, with an arrow on the end (mirrored in RTL). Show a change pill only when there is a real comparison. Loading shows a skeleton; error says so with Try again."
        code={`<StatTile label="Active applications" value="10" icon={ClipboardCheck} delta={{ value: 12, comparedTo: "vs last 7 days" }} footer={{ value: "+3", text: "vs last 7 days" }} href="/partner/applications" />`}
        props={[
          { name: "label / value", type: "string / ReactNode", description: "Value uses Amount or a formatted number." },
          { name: "delta", type: "{ value, unit?, goodWhen?, comparedTo? }", description: "DeltaPill beside the value; omit without real history." },
          { name: "icon / iconTone", type: "IconComponent / brand | success | warning | danger | neutral", description: "IconTile on the end side." },
          { name: "footer", type: "{ value?: ReactNode; text: ReactNode }", description: "Bold figure then words, or words alone." },
          { name: "href / linkLabel", type: "string / string", description: "Footer becomes a link with an arrow; linkLabel names it." },
          { name: "state / errorMessage / onRetry", type: '"ready" | "loading" | "error"', description: "Skeleton or error with Try again." },
        ]}
      >
        <StateSwitch<"ready" | "loading" | "error"> value={statState} options={["ready", "loading", "error"] as const} onChange={setStatState} label="Tile state" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatTile state={statState} onRetry={() => setStatState("ready")} label="Action required" value="7" icon={ClipboardCheck} iconTone="warning" footer={{ text: "Applications waiting for you" }} href="#c-stattile" />
          <StatTile state={statState} onRetry={() => setStatState("ready")} label="Active applications" value="126" icon={GraduationCap} delta={{ value: 10.7, comparedTo: "vs last 7 days (sample)" }} footer={{ value: "+12", text: "vs last 7 days (sample)" }} href="#c-stattile" />
          <StatTile state={statState} onRetry={() => setStatState("ready")} label="Arriving in 30 days" value="3" icon={Plane} delta={{ value: -5.1, comparedTo: "vs last month (sample)" }} footer={{ value: "−1", text: "vs last month (sample)" }} href="#c-stattile" />
          <StatTile state={statState} onRetry={() => setStatState("ready")} label="Expected commission" value={<Amount value={7950} />} icon={Wallet} iconTone="success" footer={{ text: "In the commission stage, not yet paid" }} href="#c-stattile" />
        </div>
      </Demo>

      <Demo
        name="DonutStatsCard and DonutChart"
        path="components/ub/dashboard/cards/DonutStatsCard.tsx"
        description="A total split into parts. Tabs for each split show their total; the donut has the total in the hole and 2px surface gaps; the legend gives each part's swatch, name, share and value, and links to the list behind it. Colours are five fixed, checked categorical slots (never cycled); past five parts the rest fold into Other."
        code={`<DonutStatsCard title="Application pipeline" views={[{ id: "stage", label: "By stage", centerLabel: "Active applications", items: [{ key: "visa", label: "Visa", value: 2, href: "/partner/applications?stage=visa" }] }]} />`}
        props={[
          { name: "views", type: "{ id, label, centerLabel, items: { key, label, value, href? }[] }[]", description: "Two or more show as tabs." },
          { name: "maxSlices", type: "number", default: "5", description: "The rest fold into Other." },
          { name: "state / emptyMessage / errorMessage / onRetry", type: "WidgetState / …", description: "Card states." },
        ]}
      >
        <div className="max-w-xl">
          <DonutStatsCard
            title="Application pipeline"
            subtitle="All active applications."
            views={[
              { id: "stage", label: "By stage", centerLabel: "Active applications", items: [
                { key: "review", label: "Unibexs review", value: 1, href: "#c-donutstatscard-and-donutchart" },
                { key: "offer", label: "University and offer", value: 2, href: "#c-donutstatscard-and-donutchart" },
                { key: "visa", label: "Visa", value: 2, href: "#c-donutstatscard-and-donutchart" },
                { key: "arrival", label: "Arrival and enrollment", value: 2, href: "#c-donutstatscard-and-donutchart" },
                { key: "commission", label: "Commission", value: 3, href: "#c-donutstatscard-and-donutchart" },
              ] },
              { id: "university", label: "By university", centerLabel: "Active applications", items: [
                { key: "apu", label: "Asia Pacific University", value: 4 },
                { key: "taylors", label: "Taylor's University", value: 3 },
                { key: "ucsi", label: "UCSI University", value: 1 },
                { key: "inti", label: "INTI International University", value: 1 },
                { key: "sunway", label: "Sunway University", value: 1 },
                { key: "mmu", label: "Multimedia University", value: 0 },
              ] },
            ]}
          />
        </div>
      </Demo>

      <Demo
        name="RadialStatsCard and RadialRingsChart"
        path="components/ub/dashboard/cards/RadialStatsCard.tsx"
        description="Several measures of one whole as concentric rings (outermost first), each filled to its share, the total in the hole. The legend gives each count and share; with onSelect each row filters the list below and the other rings dim. Colours are the checked categorical slots in fixed order."
        code={`<RadialStatsCard title="Advisors" total={21} totalLabel="advisors" items={[{ id: "active", label: "Active", value: 15 }, { id: "inactive", label: "Suspended", value: 6 }]} selectedId={filter} onSelect={setFilter} />`}
        props={[
          { name: "items", type: "{ id, label, value }[]", description: "Outermost ring first; max five." },
          { name: "total / totalLabel", type: "number / string", description: "The whole, shown in the hole." },
          { name: "onSelect / selectedId", type: "(id | null) => void / string | null", description: "Legend rows become filter toggles." },
          { name: "framed", type: "boolean", default: "true", description: "false inside a section that has its own border." },
        ]}
      >
        <RadialStatsDemo />
      </Demo>

      <Demo
        name="GroupedBarChart"
        path="components/ub/dashboard/charts/GroupedBarChart.tsx"
        description="Up to three series per group on one baseline: thin bars with rounded ends, 2px gaps, recessive gridlines, one axis, legend above. Hover or Tab to a bar for its value; a hidden table carries the numbers."
        code={`<GroupedBarChart label="Commission per university in RM" series={[{ key: "expected", label: "Expected", color: "cat-1" }, { key: "paid", label: "Paid", color: "cat-3" }]} groups={[{ key: "apu", label: "APU", values: [4200, 3000] }]} />`}
        props={[
          { name: "series", type: '{ key, label, color: "cat-1" | "cat-2" | "cat-3" }[]', description: "Fixed order; max three." },
          { name: "groups", type: "{ key, label, values: number[] }[]", description: "One value per series." },
          { name: "label / formatValue / heightClass", type: "string / (n) => string / string", description: "Naming and formatting." },
        ]}
      >
        <GroupedBarChart
          label="Commission per university in RM"
          series={[{ key: "expected", label: "Expected", color: "cat-1" }, { key: "ready", label: "Ready for payout", color: "cat-2" }, { key: "paid", label: "Paid", color: "cat-3" }]}
          groups={[
            { key: "apu", label: "Asia Pacific University", values: [4200, 2450, 3000] },
            { key: "taylors", label: "Taylor's University", values: [3750, 0, 5250] },
            { key: "ucsi", label: "UCSI University", values: [1800, 1200, 2600] },
            { key: "sunway", label: "Sunway University", values: [2900, 600, 1400] },
          ]}
          formatValue={(v) => `RM${v.toLocaleString("en-MY")}`}
        />
      </Demo>

      <Demo
        name="AreaLineChart"
        path="components/ub/dashboard/charts/AreaLineChart.tsx"
        description="One series over time: a 2px line with a soft area, recessive gridlines, one axis. Hover, or focus and use the arrow keys, for a crosshair and the value. Only chart dated records the API returns."
        code={`<AreaLineChart label="Commission paid per month in RM" points={[{ key: "2026-06", label: "Jun", value: 3000 }]} />`}
        props={[
          { name: "points", type: "{ key, label, value }[]", description: "In time order." },
          { name: "label / formatValue / heightClass", type: "string / (n) => string / string", description: "Naming and formatting." },
        ]}
      >
        <AreaLineChart
          label="Commission paid per month in RM"
          formatValue={(v) => `RM${v.toLocaleString("en-MY")}`}
          points={[["2026-04", "Apr", 1200], ["2026-05", "May", 3400], ["2026-06", "Jun", 2600], ["2026-07", "Jul", 5200], ["2026-08", "Aug", 2100], ["2026-09", "Sep", 4300], ["2026-10", "Oct", 3800], ["2026-11", "Nov", 6100]].map(([key, label, value]) => ({ key: String(key), label: String(label), value: Number(value) }))}
        />
      </Demo>

      <Demo
        name="AvatarStrip"
        path="components/ub/dashboard/lists/AvatarStrip.tsx"
        description="People in a scrollable row: 64px avatar with the status circle, name and one line, each opening the profile. Previous / next buttons on the end page through and hide at the ends; mirrored in RTL."
        code={`<AvatarStrip label="Advisors awaiting review" people={[{ id: "p1", name: "Global Pathways", subtitle: "Agency · Nigeria", status: "unverified", href: "/admin/advisors/p1" }]} />`}
        props={[
          { name: "people", type: "{ id, name, subtitle?, avatarSrc?, status?, statusLabel?, href?, ariaLabel? }[]", description: "status is a backend value shown as the circle." },
          { name: "label", type: "string", description: "Accessible name of the row." },
        ]}
      >
        <div className="max-w-lg">
          <AvatarStrip
            label="Advisors awaiting review"
            people={["Global Pathways Education", "Bright Futures Consultancy", "Nur Aisyah Binti Kamal", "Chinedu Okafor", "Tanvir Hossain", "Sara Mahmoud", "Lim Wei Jie"].map((name, i) => ({
              id: `p${i}`,
              name,
              subtitle: i < 2 ? "Agency" : "Individual",
              status: i % 3 === 0 ? "active" : "unverified",
              statusLabel: i % 3 === 0 ? "Verified" : "Awaiting review",
              href: "#c-avatarstrip",
            }))}
          />
        </div>
      </Demo>

      <Demo
        name="PillBarChart and ChartLegend"
        path="components/ub/dashboard/charts/PillBarChart.tsx"
        description="Rounded bars on one baseline (≤24px, 2px gaps). The current bar is the accent with a value bubble; others muted; pending or forecast bars hatched (45°). Hover or Tab to any bar for its value. ChartLegend: dot + label in text colours."
        code={`<PillBarChart data={[{ label: "Mon", value: 14 }, { label: "Sat", value: 9, status: "pending" }]} label="Applications per day" unit="applications" />
<ChartLegend marker="square" items={[{ label: "Submitted", color: "cat-1" }, { label: "Pending", color: "hatch" }]} />`}
        props={[
          { name: "data", type: "{ label, value, status?: \"actual\" | \"pending\" }[]", description: "Pending bars are hatched." },
          { name: "highlightIndex", type: "number", description: "Default: the last non-pending bar." },
          { name: "formatValue / unit / label", type: "(n) => string / string / string", description: "Bubble text, screen-reader noun and chart name." },
          { name: "state / emptyMessage / errorMessage / onRetry", type: "WidgetStateProps", description: "Empty when data is []." },
        ]}
      >
        <StateSwitch<WidgetState> value={chartState} options={STATES} onChange={setChartState} label="Chart state" />
        <ThemePreviews>
          <div className="grid gap-4">
            <PillBarChart data={WEEK} state={pick(chartState)} onRetry={() => setChartState("ready")} label="Applications per day" unit="applications" />
            <ChartLegend marker="square" items={[{ label: "Submitted", color: "cat-1" }, { label: "Earlier days", color: "muted" }, { label: "Pending", color: "hatch" }]} />
          </div>
        </ThemePreviews>
      </Demo>

      <Demo
        name="CategoryColumnChart"
        path="components/ub/dashboard/charts/CategoryColumnChart.tsx"
        description="Columns for up to ~8 categories with the value in a bubble on each cap. One hue: the largest (or highlightKey) in the accent, the rest muted, so colour never stands for identity; the label under each column does."
        code={`<CategoryColumnChart data={[{ key: "sunway", label: "Sunway", value: 48 }, …]} label="Applications by Institution" unit="applications" />`}
        props={[
          { name: "data", type: "{ key, label, value }[]", description: "Fold extras into Other past ~8." },
          { name: "highlightKey", type: "string", description: "Default: the largest." },
          { name: "formatValue / unit / label / heightClass", type: "…", description: "Bubble format and naming." },
        ]}
      >
        <div className="max-w-ub-form-sm">
          <CategoryColumnChart data={BY_INSTITUTION} state={pick(chartState)} onRetry={() => setChartState("ready")} label="Applications by Institution" unit="applications" />
        </div>
      </Demo>

      <Demo
        name="GaugeChart and GaugeLegendStats"
        path="components/ub/dashboard/charts/GaugeChart.tsx"
        description="Half-donut for a percentage or a split, with a centre label; segments have 2px surface gaps and fill from the start side (mirrored in RTL). GaugeLegendStats repeats each share with its dot, so colour is never the only signal. Colours: the validated categorical slots 1, 2 and 4."
        code={`<GaugeChart segments={[{ label: "Placed", value: 62, color: "cat-1" }, …]} centerLabel="62%" centerCaption="placed this intake" label="Placement this intake" />
<GaugeLegendStats items={segments} />`}
        props={[
          { name: "value | segments", type: "number | { label, value, color }[]", description: "One value on a track, or a split summing to ≤100." },
          { name: "centerLabel / centerCaption / label", type: "ReactNode / ReactNode / string", description: "Centre text and the accessible summary." },
          { name: "GaugeLegendStats items", type: "{ label, value, color }[]", description: "Percent + label row." },
        ]}
      >
        <ThemePreviews>
          <div className="grid gap-4">
            <GaugeChart segments={PLACEMENT} state={pick(chartState)} onRetry={() => setChartState("ready")} centerLabel="62%" centerCaption="placed this intake" label="Placement this intake" />
            {chartState === "ready" && <GaugeLegendStats items={PLACEMENT} />}
          </div>
        </ThemePreviews>
      </Demo>

      <Demo
        name="ActivityHeatmap"
        path="components/ub/dashboard/charts/ActivityHeatmap.tsx"
        description="Day × hour grid in one blue ramp (more = darker in light, brighter in dark: its own dark steps). One Tab stop; arrow keys move between cells (mirrored in RTL); every cell has a tooltip and a label; a Less–More key explains the scale."
        code={`<ActivityHeatmap rows={["Mon", …]} columns={["9am", …]} values={uploads} unit="uploads" label="Document uploads by day and hour" />`}
        props={[
          { name: "rows / columns / values", type: "string[] / string[] / number[][]", description: "values[row][column]." },
          { name: "unit / label", type: "string", description: "Tooltip noun and grid name." },
        ]}
      >
        <ThemePreviews>
          <ActivityHeatmap rows={DAYS} columns={HOURS} values={UPLOADS} state={pick(chartState)} onRetry={() => setChartState("ready")} unit="uploads" label="Document uploads by day and hour" />
        </ThemePreviews>
      </Demo>

      <Demo
        name="Sparkline and PipelineBar"
        path="components/ub/dashboard/charts/Sparkline.tsx"
        description="Sparkline: a 2px trend line with an end dot, or mini bars with the latest in the accent; summarised for screen readers (first, last, peak). PipelineBar: the stage-coloured segmented bar from the data kit, driven by config/applicationStages.ts."
        code={`<Sparkline values={[12, 18, 15, 22, 26]} label="Applications, last 5 weeks" className="h-8 w-32" />
<PipelineBar counts={{ enquiry: 18, "documents-pending": 24 }} />`}
        props={[
          { name: "values / variant / label", type: 'number[] / "line" | "bars" / string', description: "Size it with className." },
          { name: "PipelineBar counts / onStageSelect / selectedStageId", type: "Record<stageId, number> / …", description: "See PipelineBar in Data display." },
        ]}
      >
        <div className="grid gap-6">
          <div className="flex flex-wrap items-center gap-8">
            <Sparkline values={[12, 18, 15, 22, 19, 26, 31]} label="Applications, last 7 weeks" className="h-8 w-32" />
            <Sparkline values={[12, 18, 15, 22, 19, 26, 31]} variant="bars" label="Applications, last 7 weeks" className="h-8 w-32" />
          </div>
          <PipelineBar counts={COUNTS} label="Applications by stage" />
        </div>
      </Demo>

      <Demo
        name="PipelineFlow"
        path="components/ub/dashboard/pipeline/PipelineFlow.tsx"
        description="The one pipeline: applications by stage in workflow order, used on every Applications page and the role home. From 1024px each stage is a StatTile (name, count, step number, share in the footer). Tablets, phones and narrow cards (layout=&quot;list&quot;): a vertical list with a share bar in the brand colour and the count on the end. No per-stage colours and no badges. onSelect toggles a filter (press again to clear); getHref makes each stage a link."
        code={`<PipelineFlow
  stages={[{ id: "s1", label: "Application Submission", count: 6, stageId: "documents-pending" }]}
  selectedId={stage}
  onSelect={setStage}
/>`}
        props={[
          { name: "stages", type: "{ id, label, count }[]", description: "In workflow order; the step number comes from the position." },
          { name: "selectedId / onSelect / getHref", type: "string | null / (id | null) => void / (stage) => string", description: "Toggle filter, or a link per stage; without either the stages are static." },
          { name: "layout", type: '"auto" | "list"', default: '"auto"', description: "auto: columns from 1024px, list below. list: always the list (half-width cards)." },
          { name: "label", type: "string", default: '"Applications by stage"', description: "Accessible name for the group." },
        ]}
      >
        <PipelineFlowDemo />
      </Demo>

      <Demo
        name="TaskList and PeopleList"
        path="components/ub/dashboard/lists/TaskList.tsx"
        description="TaskListItem: icon tile, title, meta, due Days tag (amber, orange, red as it nears), action. PeopleListItem: avatar, name, current work, status tag. Both lists handle loading / empty / error."
        code={`<TaskList label="Due this week" count={tasks.length}>
  <TaskListItem icon={FileUp} title="Upload signed offer letter" meta="Nur Aisyah · UBX-2026-0412" dueInDays={2} action={<TextButton>Open</TextButton>} />
</TaskList>`}
        props={[
          { name: "TaskListItem", type: "{ title, meta?, icon?, iconTone?, dueInDays?, action? }", description: "dueInDays negative = overdue." },
          { name: "PeopleListItem", type: "{ name, avatarSrc?, work?, status?, statusLabel?, action? }", description: "status: stage id or status name." },
          { name: "TaskList / PeopleList", type: "{ count, label, state?, emptyMessage? }", description: "count decides empty." },
        ]}
      >
        <StateSwitch<WidgetState> value={listState} options={STATES} onChange={setListState} label="List state" />
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <DashboardCard title="Due this week" actions={<CardLinkButton href="#" label="Open all tasks" />}>
            <TaskList label="Due this week" count={4} state={pick(listState)} onRetry={() => setListState("ready")}>
              <TaskListItem icon={FileUp} title="Upload signed offer letter" meta="Nur Aisyah Binti Kamal · UBX-2026-0412" dueInDays={2} action={<TextButton size="sm">Open</TextButton>} />
              <TaskListItem icon={Wallet} iconTone="warning" title="Pay visa fee" meta="Chinedu Okafor · RM2,450" dueInDays={0} action={<TextButton size="sm">Pay</TextButton>} />
              <TaskListItem icon={Plane} iconTone="neutral" title="Confirm arrival date" meta="Tanvir Hossain · Taylor's University" dueInDays={9} />
              <TaskListItem icon={ClipboardCheck} iconTone="danger" title="Replace academic transcript" meta="Sara Mahmoud · Not certified" dueInDays={-1} />
            </TaskList>
          </DashboardCard>
          <DashboardCard title="Account managers" actions={<CardMenu onViewAll={noop} onExport={noop} />}>
            <PeopleList label="Account managers" count={3} state={pick(listState)} onRetry={() => setListState("ready")}>
              <PeopleListItem name="Farid Hakimi" work="Reviewing 4 applications" status="Under Review" statusLabel="In review" />
              <PeopleListItem name="Lim Wei Jie" work="Visa setup for 2 students" status="visa-in-progress" />
              <PeopleListItem name="Priya Nair" work="Waiting on Sunway University" status="Waiting for Payment" statusLabel="Waiting" />
            </PeopleList>
          </DashboardCard>
        </div>
      </Demo>

      <Demo
        name="BreakdownTable and StatusTag"
        path="components/ub/dashboard/lists/BreakdownTable.tsx"
        description="Compact 44px rows: label (with meta), right-aligned tabular value, growth pill. StatusTag colours a stage id from the stage config and any other status from the shared status map; text always present."
        code={`<BreakdownTable caption="Commission by Institution" labelHeader="Institution" valueHeader="Commission" rows={[{ key: "sunway", label: "Sunway University", value: <Amount value={28400} />, growth: 14 }]} comparedTo="vs last intake" />
<StatusTag status="offer-received" /> <StatusTag status="Payment Rejected" />`}
        props={[
          { name: "rows", type: "{ key, label, meta?, value, growth?, goodWhen? }[]", description: "growth in percent." },
          { name: "caption / labelHeader / valueHeader / growthHeader / comparedTo", type: "string", description: "Table naming; comparedTo is read with each pill." },
          { name: "StatusTag status / label / size", type: "string / string / sm | md", description: "Stage id or status name/code." },
        ]}
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <BreakdownTable
            caption="Commission by Institution this intake"
            labelHeader="Institution"
            valueHeader="Commission"
            comparedTo="vs last intake"
            state={pick(listState)}
            onRetry={() => setListState("ready")}
            rows={[
              { key: "sunway", label: "Sunway University", meta: "18 students", value: <Amount value={28400} />, growth: 14 },
              { key: "taylors", label: "Taylor's University", meta: "12 students", value: <Amount value={21600} />, growth: 6 },
              { key: "ucsi", label: "UCSI University", meta: "9 students", value: <Amount value={12300} />, growth: -8 },
              { key: "apu", label: "Asia Pacific University", meta: "7 students", value: <Amount value={9800} />, growth: 0 },
            ]}
          />
          <div className="flex flex-wrap content-start gap-2">
            <StatusTag status="offer-received" />
            <StatusTag status="visa-in-progress" />
            <StatusTag status="Payment Rejected" />
            <StatusTag status="Waiting for Payment" />
            <StatusTag status="Application Completed" />
            <StatusTag status="Correction Requested" />
          </div>
        </div>
      </Demo>

      <Demo
        name="ReminderCard, CountdownCard and ProgressCard"
        path="components/ub/dashboard/cards/ReminderCard.tsx"
        description="ReminderCard: the next event with time, place and one CTA (empty when nothing is scheduled). CountdownCard: days / hours / minutes to a date, updating every minute. ProgressCard: title, bar and step count; turns green when complete."
        code={`<ReminderCard title="Call with Sunway University admissions" startsAt="2026-11-03T15:00:00+08:00" location="Google Meet" cta={{ label: "Join call", href: meetUrl }} />
<CountdownCard heading="Next intake" target="2027-01-05T09:00:00+08:00" description="January 2027 intake. 12 students are confirmed." />
<ProgressCard title="Onboarding" done={3} total={5} stepLabel="steps done" />`}
        props={[
          { name: "ReminderCard", type: "{ heading?, title?, startsAt?, location?, cta?, variant? }", description: "Empty without a title." },
          { name: "CountdownCard", type: "{ heading, target, description?, doneMessage?, now? }", description: "now fixes the time for tests and previews." },
          { name: "ProgressCard", type: "{ title, done, total, stepLabel?, description?, action?, tone? }", description: "Success tone once done ≥ total." },
        ]}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <ReminderCard variant="highlighted" title="Call with Sunway University admissions" startsAt="2026-11-03T15:00:00+08:00" location="Google Meet" cta={{ label: "Join call", onClick: noop, icon: <CalendarClock className="h-4 w-4" aria-hidden="true" /> }} />
          <CountdownCard heading="Next intake" target="2027-01-05T09:00:00+08:00" now={NOW} description="January 2027 intake. 12 students are confirmed." />
          <ProgressCard title="Advisor onboarding" done={3} total={5} stepLabel="steps done" description="Next: add your bank details." action={<CardLinkButton href="#" label="Continue onboarding" />} />
        </div>
      </Demo>

      <Demo name="Admin dashboard" path="components/showcase/sections/DashboardWidgets.tsx" description="The widgets composed into an admin dashboard: header with period, four KPIs, weekly applications, placement gauge, Institutions, upload heatmap, tasks and team. Resize to see the grid fold to one column.">
        <div className="ub-canvas-light grid gap-4 rounded-ub-xl p-4 md:gap-6 md:p-6">
          <DashboardHeader as="h3" title="Applications overview" subtitle="Monday 3 November · 14 applications need you" secondaryActions={<><PeriodSelect value={period} onChange={setPeriod} /><Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" aria-hidden="true" />} text="Export" /></>} primaryAction={<Button variant="primary" size="sm" icon={<Users className="h-4 w-4" aria-hidden="true" />} text="Assign Advisors" />} />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard variant="highlighted" icon={GraduationCap} label="Students placed" value="21" delta={{ value: 18, comparedTo: "vs last intake" }} caption="Target 30" />
            <StatCard variant="icon" icon={Wallet} iconTone="success" label="Commission paid" value={<Amount value={84200} />} delta={{ value: 12, comparedTo: "vs last month" }} caption="RM75,100 last month" />
            <StatCard variant="bars" label="Applications" value="126" bars={[8, 12, 9, 14, 18, 15, 22, 19, 26]} delta={{ value: -4, comparedTo: "vs last week" }} caption="9 weeks" />
            <StatCard label="Avg days in stage" value="6.4" delta={{ value: -1.2, unit: " days", goodWhen: "down", comparedTo: "vs last month" }} caption="Lower is better" />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <DashboardCard className="lg:col-span-2" title="Applications this week" actions={<CardMenu onViewAll={noop} onExport={noop} onHide={noop} />} footer={<CardFooterStats items={[{ label: "Submitted", value: "126" }, { label: "Offers", value: "38" }, { label: "Placed", value: "21" }]} />}>
              <PillBarChart data={WEEK} label="Applications per day" unit="applications" />
            </DashboardCard>
            <DashboardCard title="Placement" subtitle="January 2027 intake">
              <GaugeChart segments={PLACEMENT} centerLabel="62%" centerCaption="placed" label="Placement this intake" />
              <GaugeLegendStats items={PLACEMENT} className="mt-4" />
            </DashboardCard>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <DashboardCard title="By Institution" actions={<CardLinkButton href="#" label="Open Institutions" />}>
              <CategoryColumnChart data={BY_INSTITUTION} label="Applications by Institution" unit="applications" heightClass="h-40" />
            </DashboardCard>
            <DashboardCard className="lg:col-span-2" title="Document uploads" subtitle="When Advisors upload">
              <ActivityHeatmap rows={DAYS} columns={HOURS} values={UPLOADS} unit="uploads" label="Document uploads by day and hour" />
            </DashboardCard>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <DashboardCard title="Due this week">
              <TaskList label="Due this week" count={2}>
                <TaskListItem icon={FileUp} title="Upload signed offer letter" meta="Nur Aisyah · UBX-2026-0412" dueInDays={2} />
                <TaskListItem icon={Wallet} iconTone="warning" title="Pay visa fee" meta="Chinedu Okafor · RM2,450" dueInDays={0} />
              </TaskList>
            </DashboardCard>
            <DashboardCard title="Team">
              <PeopleList label="Team" count={2}>
                <PeopleListItem name="Farid Hakimi" work="Reviewing 4 applications" status="Under Review" statusLabel="In review" />
                <PeopleListItem name="Lim Wei Jie" work="Visa setup for 2 students" status="visa-in-progress" />
              </PeopleList>
            </DashboardCard>
            <CountdownCard heading="Next intake" target="2027-01-05T09:00:00+08:00" now={NOW} description="12 students confirmed." />
          </div>
        </div>
      </Demo>
    </ShowcaseSection>
  );
}

function PipelineFlowDemo() {
  const [stage, setStage] = useState<string | null>(null);
  return <PipelineFlow stages={FLOW_STAGES} selectedId={stage} onSelect={setStage} />;
}

function RadialStatsDemo() {
  const [filter, setFilter] = useState<string | null>(null);
  return (
    <div className="max-w-3xl">
      <RadialStatsCard
        title="Advisors"
        subtitle="Press a group to show only those advisors."
        total={21}
        totalLabel="advisors"
        selectedId={filter}
        onSelect={setFilter}
        items={[
          { id: "active", label: "Active", value: 15 },
          { id: "inactive", label: "Suspended", value: 6 },
          { id: "agency", label: "Company", value: 6 },
          { id: "individual", label: "Individual", value: 15 },
        ]}
      />
    </div>
  );
}
