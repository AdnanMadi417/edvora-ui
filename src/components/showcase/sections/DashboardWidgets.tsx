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
  StatusTag,
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
  { id: "s1", label: "Application Submission", count: 6, stageId: "documents-pending", badge: { label: "Your move", tone: "attention" as const }, attention: true },
  { id: "s2", label: "Institution Review", count: 4, stageId: "institution-review" },
  { id: "s3", label: "Offer & Visa Payment", count: 3, stageId: "offer-received", badge: { label: "Your move", tone: "attention" as const }, attention: true },
  { id: "s4", label: "Visa Processing", count: 5, stageId: "visa-in-progress" },
  { id: "s5", label: "Arrival & Enrollment", count: 2, stageId: "arrival-logistics" },
  { id: "s6", label: "Commission Invoicing", count: 3, stageId: "enrolled", badge: { label: "Payout", tone: "success" as const } },
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
    <ShowcaseSection id="dashboard-widgets" title="Dashboard widgets" description="components/ub/dashboard: presentational widgets for dashboards.">
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
        description="Applications by stage as a journey line toward payout. Each station grows with its volume (44–64px), the track takes the stage colour from config/applicationStages.ts and drifts toward the end (still under reduced motion), and attention stations pulse. Press a station to filter; press it again to clear. Scrolls sideways on narrow screens; flows the other way in RTL."
        code={`<PipelineFlow
  stages={[{ id: "s1", label: "Application Submission", count: 6, stageId: "documents-pending", badge: { label: "Your move", tone: "attention" }, attention: true }]}
  selectedId={stage}
  onSelect={setStage}
/>`}
        props={[
          { name: "stages", type: "{ id, label, count, stageId?, badge?, attention? }[]", description: "stageId picks the colour; unknown ids show neutral. attention pulses the station." },
          { name: "selectedId / onSelect", type: "string | null / (id | null) => void", description: "Without onSelect the stations are static." },
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
