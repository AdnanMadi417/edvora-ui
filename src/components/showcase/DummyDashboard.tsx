"use client";

// Dummy dashboard: every reusable dashboard and overview component on one
// page, composed the way a real dashboard would use them, with sample data.
// Each block is labelled with the component names it uses.

import { useState, type ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarClock,
  ClipboardCheck,
  FileUp,
  GraduationCap,
  Plane,
  Plus,
  Search,
  Users,
  Wallet,
} from "lucide-react";
import Amount from "components/ub/core/typography/Amount";
import Button from "components/ub/core/buttons/Button";
import TextButton from "components/ub/core/buttons/TextButton";
import ThemeSwitcher from "components/theme/ThemeSwitcher";
import { focusRing } from "components/ub/recipes";
import {
  ActivityHeatmap,
  BarChartCard,
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
  GaugeCard,
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
  QuickActions,
  ListFooter,
  ActivityFeed,
  ReminderCard,
  Sparkline,
  StatCard,
  StatTile,
  StatusTag,
  DonutStatsCard,
  CompositionCard,
  GroupedBarChart,
  AreaLineChart,
  AvatarStrip,
  RadialStatsCard,
  TaskList,
  TaskListItem,
  WidgetStatus,
  type DashboardPeriod,
} from "components/ub/dashboard";
import LegacyStatCard from "components/ub/data/cards/StatCard";
import OverviewVisual from "features/overview/components/OverviewVisual";
import OverviewItems from "features/overview/components/OverviewItems";
import CommissionStatusChart from "features/overview/components/CommissionStatusChart";
import UniversityCommissionCard from "features/overview/components/UniversityCommissionCard";
import type { OverviewItem, OverviewResource, ResourcePlan } from "features/overview/model/types";
import type { UniversityCommission } from "features/overview/model/dashboardData";

const NOW = new Date("2026-11-18T09:00:00+08:00");
const noop = () => undefined;

/** Every reusable component on this page, by layer, with where it lives. */
export const DASHBOARD_COMPONENTS: { group: string; path: string; names: string[] }[] = [
  { group: "Shared", path: "components/ub/dashboard/shared", names: ["DashboardHeader", "PeriodSelect", "CardMenu", "DeltaPill", "IconTile", "StatusTag", "WidgetStatus"] },
  { group: "Cards", path: "components/ub/dashboard/cards", names: ["DashboardCard", "CardLinkButton", "CardFooterStats", "StatCard", "StatTile", "DonutStatsCard", "CompositionCard", "RadialStatsCard", "BarChartCard", "GaugeCard", "ReminderCard", "CountdownCard", "ProgressCard"] },
  { group: "Charts", path: "components/ub/dashboard/charts", names: ["PillBarChart", "CategoryColumnChart", "DonutChart", "ReconciliationBars", "RadialRingsChart", "GroupedBarChart", "AreaLineChart", "GaugeChart", "GaugeLegendStats", "ActivityHeatmap", "Sparkline", "ChartLegend"] },
  { group: "Pipeline", path: "components/ub/dashboard/pipeline", names: ["PipelineFlow", "PipelineBar"] },
  { group: "Lists", path: "components/ub/dashboard/lists", names: ["TaskList", "TaskListItem", "PeopleList", "PeopleListItem", "BreakdownTable", "QuickActions", "ListFooter", "ActivityFeed", "AvatarStrip"] },
  { group: "Overview (role home)", path: "features/overview/components", names: ["OverviewVisual", "OverviewItems", "CommissionStatusChart", "UniversityCommissionCard"] },
  { group: "Data kit", path: "components/ub/data/cards", names: ["StatCard (data kit)"] },
];

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
const PLACEMENT = [
  { label: "Placed", value: 62, color: "cat-1" as const },
  { label: "In progress", value: 27, color: "cat-2" as const },
  { label: "Withdrawn", value: 11, color: "cat-3" as const },
];
const HOURS = ["9am", "10", "11", "12pm", "1", "2", "3", "4", "5"];
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const UPLOADS = DAYS.map((_, d) => HOURS.map((_, h) => (d > 4 ? Math.max(0, ((h * 3 + d) % 4) - 1) : ((d + 1) * (h + 2) * 7) % 13)));
const FLOW = [
  { id: "review", label: "Unibexs review", count: 1, stageId: "documents-pending" },
  { id: "offer", label: "University and offer", count: 2, stageId: "offer-received" },
  { id: "visa", label: "Visa", count: 2, stageId: "visa-in-progress" },
  { id: "arrival", label: "Arrival and enrollment", count: 2, stageId: "arrival-logistics" },
  { id: "commission", label: "Commission", count: 3, stageId: "commission-paid" },
];
const COUNTS = { "documents-pending": 1, "offer-received": 2, "visa-in-progress": 2, "arrival-logistics": 2, "commission-paid": 3 };

// Overview fixtures: the same shapes the role home loads from the API.
const PIPELINE_PLAN: ResourcePlan = {
  id: "pipeline",
  title: "Application pipeline",
  subtitle: "All active applications, grouped by their current stage.",
  href: "#c-overview",
  emptyMessage: "No active applications in your pipeline yet.",
  load: async () => ({ total: 0, items: [] }),
};
const PIPELINE: OverviewResource = {
  state: "ready",
  data: {
    total: 10,
    items: [],
    distribution: FLOW.map((s) => ({ key: s.id, label: s.label, value: s.count, stageId: s.stageId })),
  },
};
const record = (id: string, student: string, amount: number, status: string) => ({
  id,
  applicationId: `app_${id}`,
  student,
  reference: `UBX-2026-${id}`,
  status,
  amount,
});
const COMMISSION_ROWS: UniversityCommission[] = [
  {
    key: "sunway",
    name: "Sunway University",
    currency: "RM",
    expected: { amount: 4200, unknown: 0, records: [record("0412", "Nur Aisyah Binti Kamal", 4200, "university")] },
    ready: { amount: 2450, unknown: 0, records: [record("0388", "Chinedu Okafor", 2450, "us")] },
    paid: { amount: 3000, unknown: 0, records: [record("0301", "Samuel Abdallah", 3000, "nobody")] },
    disputed: 1,
  },
  {
    key: "taylors",
    name: "Taylor's University",
    currency: "RM",
    expected: { amount: 3750, unknown: 0, records: [record("0420", "Tanvir Hossain", 3750, "university")] },
    ready: { amount: 0, unknown: 0, records: [] },
    paid: { amount: 5250, unknown: 0, records: [record("0277", "Esther Rahman", 5250, "nobody")] },
    disputed: 0,
  },
];
const COMMISSION: OverviewResource = { state: "ready", data: { total: 5, items: [], universityCommission: COMMISSION_ROWS } };
const NEXT_STEPS: OverviewItem[] = [
  { id: "a1", title: "Upload the EMGS eVAL document.", description: "Nadia Rahman · INTI International University", href: "#c-overview", status: "Upload EMGS eval", statusLabel: "eVAL to upload" },
  { id: "a2", title: "Review requested corrections and upload the required documents.", description: "Amina Hossain · Asia Pacific University", href: "#c-overview", status: "Correction Requested", statusLabel: "Corrections requested by Unibexs" },
  { id: "a3", title: "Confirm commission receipt or raise a dispute.", description: "Samuel Abdallah · UCSI University", href: "#c-overview", status: "Commission Paid", statusLabel: "Commission to confirm" },
];
const UPDATES: OverviewItem[] = [
  { id: "u1", title: "Unibexs moved Sara Ochieng's application to Corrections requested", description: "Upload the corrected documents so the review can continue.", href: "#c-overview", at: "2026-11-18T08:10:00+08:00" },
  { id: "u2", title: "Sunway University sent an offer letter for Nur Aisyah Binti Kamal", description: "Pay the visa fee to keep the offer.", href: "#c-overview", at: "2026-11-16T14:30:00+08:00" },
  { id: "u3", title: "Unibexs approved Kevin Abdallah's visa payment", description: "The visa application is now with EMGS.", href: "#c-overview", at: "2026-11-02T11:00:00+08:00" },
];
const ADVISORS: OverviewItem[] = [
  { id: "p1", title: "Global Pathways Education", description: "Agency · Nigeria", href: "#c-overview", status: "Verified" },
  { id: "p2", title: "Bright Futures Consultancy", description: "Agency · Bangladesh", href: "#c-overview", status: "Under Review", statusLabel: "In review" },
];

/** A block with the names of the components it uses above it. */
// Sample yearly totals for CompositionCard (2026 runs to September).
const STUDENT_YEARS = [
  { year: 2024, classified: 722, missing: 203 },
  { year: 2025, classified: 763, missing: 167 },
  { year: 2026, classified: 547, missing: 24 },
];

function Block({ names, children, className = "", show }: { names: string[]; children: ReactNode; className?: string; show: boolean }) {
  return (
    <div className={`flex min-w-0 flex-col gap-2 ${className}`}>
      {show && (
        <p className="flex flex-wrap gap-1" aria-label={`Components: ${names.join(", ")}`}>
          {names.map((name) => (
            <code key={name} className="rounded-ub-sm border border-ub-border bg-ub-surface-subtle px-1.5 py-0.5 text-ub-caption text-ub-text-secondary">
              {name}
            </code>
          ))}
        </p>
      )}
      {children}
    </div>
  );
}

export default function DummyDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const [labels, setLabels] = useState(true);
  const [flowStage, setFlowStage] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-ub-canvas text-ub-text-primary">
      <header className="ub-glass-light-strong sticky top-0 z-40 border-b border-ub-border">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-3 px-4 py-3 md:px-8">
          <Link href="/ui-unibexs-template-2026" className={`inline-flex min-h-11 items-center gap-2 rounded-ub-md text-ub-label-md text-ub-text-link ${focusRing}`}>
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
            Component gallery
          </Link>
          <span className="text-ub-label-md text-ub-text-primary">Dummy dashboard</span>
          <label className="ms-auto flex min-h-11 cursor-pointer items-center gap-2 text-ub-label-sm text-ub-text-secondary">
            <input type="checkbox" checked={labels} onChange={(e) => setLabels(e.target.checked)} className="h-4 w-4 accent-ub-action-primary" />
            Show component names
          </label>
          <ThemeSwitcher className="hidden w-64 md:grid" />
        </div>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-6 px-4 py-6 md:px-8 md:py-8">
        <section aria-labelledby="index-title" className="rounded-ub-lg border border-ub-border bg-ub-surface p-4 md:p-6">
          <h2 id="index-title" className="text-ub-heading-sm">
            Reusable dashboard and overview components ({DASHBOARD_COMPONENTS.reduce((n, g) => n + g.names.length, 0)})
          </h2>
          <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {DASHBOARD_COMPONENTS.map((group) => (
              <div key={group.group} className="min-w-0">
                <dt className="text-ub-label-md text-ub-text-primary">{group.group}</dt>
                <dd className="mt-0.5 break-words text-ub-caption text-ub-text-tertiary">{group.path}</dd>
                <dd className="mt-2 flex flex-wrap gap-1">
                  {group.names.map((name) => (
                    <code key={name} className="rounded-ub-sm border border-ub-border bg-ub-surface-subtle px-1.5 py-0.5 text-ub-caption text-ub-text-secondary">
                      {name}
                    </code>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <Block show={labels} names={["DashboardHeader", "PeriodSelect"]}>
          <DashboardHeader
            title="Your advisor overview"
            subtitle="7 applications need you today · 18 Nov 2026"
            secondaryActions={<PeriodSelect value={period} onChange={setPeriod} />}
            primaryAction={<Button variant="primary" icon={<Plus className="h-4 w-4" aria-hidden="true" />} text="Start application" />}
          />
        </Block>

        <Block show={labels} names={["StatCard", "DeltaPill", "IconTile", "CardLinkButton"]}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard variant="highlighted" icon={GraduationCap} label="Action required" value="7" caption="Waiting on you" action={<CardLinkButton href="#c-overview" label="Open action required" tone="secondary" />} />
            <StatCard variant="icon" icon={ClipboardCheck} label="Active applications" value="10" delta={{ value: 12, comparedTo: "vs last month" }} />
            <StatCard variant="bars" label="Arriving in 30 days" value="3" bars={[1, 2, 1, 3, 2, 4, 3]} caption="7 weeks" />
            <StatCard variant="icon" icon={Wallet} iconTone="success" label="Expected commission" value={<Amount value={7950} />} delta={{ value: 8, comparedTo: "vs last intake" }} />
          </div>
        </Block>

        <Block show={labels} names={["StatTile", "DeltaPill", "IconTile"]}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatTile label="Action required" value="7" icon={ClipboardCheck} iconTone="warning" footer={{ text: "Applications waiting for you" }} href="#c-overview" />
            <StatTile label="Active applications" value="10" icon={GraduationCap} delta={{ value: 10.7, comparedTo: "vs last 7 days" }} footer={{ value: "+1", text: "vs last 7 days" }} href="#c-overview" />
            <StatTile label="Arriving in 30 days" value="3" icon={Plane} delta={{ value: -5.1, comparedTo: "vs last month" }} footer={{ value: "−1", text: "vs last month" }} href="#c-overview" />
            <StatTile label="Expected commission" value={<Amount value={7950} />} icon={Wallet} iconTone="success" footer={{ text: "In the commission stage, not yet paid" }} href="#c-overview" />
          </div>
        </Block>

        <div className="grid gap-6 lg:grid-cols-3">
          <Block show={labels} names={["BarChartCard", "PillBarChart", "CardMenu", "CardFooterStats"]} className="lg:col-span-2">
            <BarChartCard
              title="Applications this week"
              subtitle="Weekend is still pending"
              data={WEEK}
              label="Applications per day"
              unit="applications"
              stats={[
                { label: "Submitted", value: "126" },
                { label: "Offers", value: "38" },
                { label: "Placed", value: "21" },
              ]}
              menu={{ onViewAll: noop, onExport: noop, onHide: noop, label: "Applications options" }}
            />
          </Block>
          <Block show={labels} names={["GaugeCard", "GaugeChart", "GaugeLegendStats"]}>
            <GaugeCard title="Placement" subtitle="January 2027 intake" segments={PLACEMENT} label="Placement this intake" centerLabel="62%" centerCaption="placed" />
          </Block>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Block show={labels} names={["DashboardCard", "CategoryColumnChart", "CardLinkButton"]}>
            <DashboardCard title="By Institution" actions={<CardLinkButton href="#c-overview" label="Open Institutions" />}>
              <CategoryColumnChart data={BY_INSTITUTION} label="Applications by Institution" unit="applications" heightClass="h-40" />
            </DashboardCard>
          </Block>
          <Block show={labels} names={["DashboardCard", "ActivityHeatmap", "ChartLegend"]} className="lg:col-span-2">
            <DashboardCard title="Performance" subtitle="When Advisors upload documents">
              <ActivityHeatmap rows={DAYS} columns={HOURS} values={UPLOADS} unit="uploads" label="Document uploads by day and hour" />
              <ChartLegend className="mt-4" marker="square" items={[{ label: "Uploads", color: "cat-1" }, { label: "Quiet hours", color: "muted" }]} />
            </DashboardCard>
          </Block>
        </div>

        <Block show={labels} names={["CompositionCard", "ReconciliationBars"]}>
          <CompositionCard
            title="Study level and recruitment mix"
            subtitle="Students by study level, reconciled to the official total · 2024 to September 2026"
            unit="students"
            centerLabel="Classified students"
            summary={{ value: 2426, label: "Total students", detail: "925 + 930 + 571", icon: GraduationCap }}
            items={[
              { key: "bachelor", label: "Bachelor", value: 1124, href: "#cc-bachelor" },
              { key: "english", label: "English", value: 518, href: "#cc-english" },
              { key: "foundation", label: "Foundation", value: 130, href: "#cc-foundation" },
              { key: "master", label: "Master", value: 116, href: "#cc-master" },
              { key: "phd", label: "PhD", value: 110, href: "#cc-phd" },
              { key: "diploma", label: "Diploma", value: 28, href: "#cc-diploma" },
              { key: "certificate", label: "Certificate", value: 6, href: "#cc-certificate" },
            ]}
            reconciliation={{
              title: "Students per year",
              note: "Classified + level not recorded = official total",
              matchesDonut: "classified",
              rows: STUDENT_YEARS.map(({ year, classified, missing }) => ({
                label: String(year),
                total: classified + missing,
                parts: [
                  { key: "classified", label: "Classified", value: classified },
                  { key: "missing", label: "Not recorded", value: missing, color: "var(--ub-neutral-400)" },
                ],
              })),
            }}
          />
        </Block>

        <div className="grid gap-6 lg:grid-cols-2">
          <Block show={labels} names={["DonutStatsCard", "DonutChart"]}>
            <DonutStatsCard
              title="Application pipeline"
              views={[
                { id: "stage", label: "By stage", centerLabel: "Active applications", items: FLOW.map((f) => ({ key: f.id, label: f.label, value: f.count, href: "#c-overview" })) },
                { id: "university", label: "By university", centerLabel: "Active applications", items: [
                  { key: "apu", label: "Asia Pacific University", value: 4 },
                  { key: "taylors", label: "Taylor's University", value: 3 },
                  { key: "ucsi", label: "UCSI University", value: 2 },
                  { key: "inti", label: "INTI International University", value: 1 },
                ] },
              ]}
            />
          </Block>
          <Block show={labels} names={["DashboardCard", "GroupedBarChart"]}>
            <DashboardCard title="Commission by university" subtitle="RM only.">
              <GroupedBarChart
                label="Commission per university in RM"
                series={[{ key: "expected", label: "Expected", color: "cat-1" }, { key: "ready", label: "Ready for payout", color: "cat-2" }, { key: "paid", label: "Paid", color: "cat-3" }]}
                groups={COMMISSION_ROWS.map((r) => ({ key: r.key, label: r.name, values: [r.expected.amount, r.ready.amount, r.paid.amount] }))}
                formatValue={(v) => `RM${v.toLocaleString("en-MY")}`}
              />
            </DashboardCard>
          </Block>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Block show={labels} names={["DashboardCard", "AreaLineChart"]}>
            <DashboardCard title="Commission paid by month" subtitle="RM only.">
              <AreaLineChart
                label="Commission paid per month in RM"
                formatValue={(v) => `RM${v.toLocaleString("en-MY")}`}
                points={[["2026-06", "Jun", 3000], ["2026-07", "Jul", 0], ["2026-08", "Aug", 5250], ["2026-09", "Sep", 2100], ["2026-10", "Oct", 4300], ["2026-11", "Nov", 3800]].map(([key, label, value]) => ({ key: String(key), label: String(label), value: Number(value) }))}
              />
            </DashboardCard>
          </Block>
          <Block show={labels} names={["DashboardCard", "AvatarStrip"]}>
            <DashboardCard title="Advisors awaiting review">
              <AvatarStrip
                label="Advisors awaiting review"
                people={["Global Pathways Education", "Bright Futures Consultancy", "Nur Aisyah Binti Kamal", "Chinedu Okafor", "Tanvir Hossain", "Sara Mahmoud"].map((name, i) => ({ id: `a${i}`, name, subtitle: i < 2 ? "Agency" : "Individual", status: "unverified", statusLabel: "Awaiting review", href: "#c-overview" }))}
              />
            </DashboardCard>
          </Block>
        </div>

        <Block show={labels} names={["RadialStatsCard", "RadialRingsChart"]}>
          <RadialStatsCard
            title="Advisors"
            total={21}
            totalLabel="advisors"
            items={[
              { id: "active", label: "Active", value: 15 },
              { id: "inactive", label: "Suspended", value: 6 },
              { id: "agency", label: "Company", value: 6 },
              { id: "individual", label: "Individual", value: 15 },
            ]}
          />
        </Block>

        <Block show={labels} names={["DashboardCard", "PipelineFlow", "PipelineBar"]}>
          <DashboardCard title="Pipeline" subtitle="Press a stage to filter; press it again to clear.">
            <PipelineFlow stages={FLOW} selectedId={flowStage} onSelect={setFlowStage} />
            <PipelineBar className="mt-6" counts={COUNTS} label="Applications by stage" />
          </DashboardCard>
        </Block>

        <div className="grid gap-6 lg:grid-cols-3">
          <Block show={labels} names={["TaskList", "TaskListItem"]}>
            <DashboardCard title="Due this week" actions={<CardLinkButton href="#c-overview" label="Open all tasks" />}>
              <TaskList label="Due this week" count={4}>
                <TaskListItem icon={FileUp} title="Upload signed offer letter" meta="Nur Aisyah Binti Kamal · UBX-2026-0412" dueInDays={2} action={<TextButton size="sm">Upload</TextButton>} />
                <TaskListItem icon={Wallet} iconTone="warning" title="Pay visa fee" meta="Chinedu Okafor · RM2,450" dueInDays={0} action={<TextButton size="sm">Pay</TextButton>} />
                <TaskListItem icon={Plane} iconTone="neutral" title="Confirm arrival date" meta="Tanvir Hossain · Taylor's University" dueInDays={9} />
                <TaskListItem icon={ClipboardCheck} iconTone="danger" title="Replace academic transcript" meta="Sara Mahmoud · Not certified" dueInDays={-1} />
              </TaskList>
            </DashboardCard>
          </Block>
          <Block show={labels} names={["PeopleList", "PeopleListItem", "StatusTag"]}>
            <DashboardCard title="Team" actions={<CardMenu onViewAll={noop} onExport={noop} label="Team options" />}>
              <PeopleList label="Team" count={3}>
                <PeopleListItem name="Farid Hakimi" work="Reviewing 4 applications" status="Under Review" statusLabel="In review" />
                <PeopleListItem name="Lim Wei Jie" work="Visa setup for 2 students" status="visa-in-progress" />
                <PeopleListItem name="Priya Nair" work="Waiting on Sunway University" status="Waiting for Payment" statusLabel="Waiting" />
              </PeopleList>
            </DashboardCard>
          </Block>
          <Block show={labels} names={["QuickActions"]}>
            <DashboardCard title="Shortcuts">
              <QuickActions
                actions={[
                  { icon: Search, label: "Explore programs", href: "#qa-programs", description: "Find the right course" },
                  { icon: BookOpen, label: "Application Tracker", href: "#qa-tracker", description: "Review progress" },
                  { icon: Users, label: "Manage team", href: "#qa-team", description: "Agency Advisors only" },
                ]}
              />
            </DashboardCard>
          </Block>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Block show={labels} names={["TaskList", "ListFooter"]}>
            <DashboardCard
              title="Stuck applications"
              footer={<ListFooter shown={2} total={15} label="Stuck applications" viewAllHref="#lf-all" />}
            >
              <TaskList label="Stuck applications" count={2}>
                <TaskListItem title="Laila Mahmoud" meta="Asia Pacific University" status="Enrollment verified" waitingDays={29} href="#lf-1" hrefLabel="Open application" />
                <TaskListItem title="Tariq Adeyemi" meta="Limkokwing University" status="Student travelling" waitingDays={28} href="#lf-2" hrefLabel="Open application" />
              </TaskList>
            </DashboardCard>
          </Block>
          <Block show={labels} names={["ActivityFeed"]}>
            <DashboardCard title="Recent activity">
              <ActivityFeed
                label="Recent activity"
                items={[
                  { id: "a1", title: "Fatima Yusuf submitted a new application for Ruqayyah Zhang", nextStep: "Review the documents and assign it for checking.", at: "2026-11-18T09:30:00Z", href: "#af-1" },
                  { id: "a2", title: "Li Wei signed up as an individual Advisor from China", nextStep: "Review the profile and verify their documents.", at: "2026-10-29T14:00:00Z", href: "#af-2" },
                ]}
              />
            </DashboardCard>
          </Block>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Block show={labels} names={["BreakdownTable"]}>
            <DashboardCard title="Commission by Institution">
              <BreakdownTable
                caption="Commission by Institution this intake"
                labelHeader="Institution"
                valueHeader="Commission"
                comparedTo="vs last intake"
                rows={[
                  { key: "sunway", label: "Sunway University", meta: "18 students", value: <Amount value={28400} />, growth: 14 },
                  { key: "taylors", label: "Taylor's University", meta: "12 students", value: <Amount value={21600} />, growth: 6 },
                  { key: "ucsi", label: "UCSI University", meta: "9 students", value: <Amount value={12300} />, growth: -8 },
                ]}
              />
            </DashboardCard>
          </Block>
          <Block show={labels} names={["StatusTag", "DeltaPill", "IconTile", "Sparkline"]}>
            <DashboardCard title="Small parts">
              <div className="flex flex-wrap gap-2">
                <StatusTag status="offer-received" />
                <StatusTag status="visa-in-progress" />
                <StatusTag status="Payment Rejected" />
                <StatusTag status="Waiting for Payment" />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <DeltaPill value={12} comparedTo="vs last month" />
                <DeltaPill value={-4.5} comparedTo="vs last week" />
                <DeltaPill value={3} unit="" goodWhen="down" comparedTo="overdue vs yesterday" />
                <IconTile icon={Wallet} tone="success" />
                <IconTile icon={CalendarClock} tone="warning" />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-8">
                <Sparkline values={[12, 18, 15, 22, 19, 26, 31]} label="Applications, last 7 weeks" className="h-8 w-32" />
                <Sparkline values={[12, 18, 15, 22, 19, 26, 31]} variant="bars" label="Applications, last 7 weeks" className="h-8 w-32" />
              </div>
            </DashboardCard>
          </Block>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Block show={labels} names={["ReminderCard"]}>
            <ReminderCard variant="highlighted" title="Call with Sunway University admissions" startsAt="2026-11-18T15:00:00+08:00" location="Google Meet" cta={{ label: "Join call", onClick: noop }} />
          </Block>
          <Block show={labels} names={["CountdownCard"]}>
            <CountdownCard heading="Next intake" target="2027-01-05T09:00:00+08:00" now={NOW} description="January 2027 intake. 12 students are confirmed." />
          </Block>
          <Block show={labels} names={["ProgressCard"]}>
            <ProgressCard title="Advisor onboarding" done={3} total={5} stepLabel="steps done" description="Next: add your bank details." action={<CardLinkButton href="#c-overview" label="Continue onboarding" />} />
          </Block>
        </div>

        <Block show={labels} names={["WidgetStatus", "DashboardCard state"]}>
          <div className="grid gap-6 md:grid-cols-3">
            <DashboardCard title="Loading">
              <WidgetStatus state="loading" skeleton="chart" />
            </DashboardCard>
            <DashboardCard title="Empty">
              <WidgetStatus state="empty" emptyMessage="You're all caught up." />
            </DashboardCard>
            <DashboardCard title="Error">
              <WidgetStatus state="error" errorMessage="Couldn't load this information." onRetry={noop} />
            </DashboardCard>
          </div>
        </Block>

        <section id="c-overview" aria-labelledby="overview-title" className="flex flex-col gap-6">
          <h2 id="overview-title" className="text-ub-heading-sm">
            Role home (overview) components
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <Block show={labels} names={["OverviewVisual"]}>
              <OverviewVisual role="partner" plans={[PIPELINE_PLAN]} resources={{ pipeline: PIPELINE }} onRetry={noop} />
            </Block>
            <Block show={labels} names={["CommissionStatusChart"]}>
              <CommissionStatusChart resource={COMMISSION} onRetry={noop} />
            </Block>
          </div>
          <Block show={labels} names={["UniversityCommissionCard"]}>
            <UniversityCommissionCard resource={COMMISSION} admin={false} onRetry={noop} />
          </Block>
          <div className="grid gap-6 lg:grid-cols-3">
            <Block show={labels} names={["OverviewItems (tasks)"]}>
              <DashboardCard title="Your next steps">
                <OverviewItems resourceId="actionRequired" title="Your next steps" items={NEXT_STEPS} />
              </DashboardCard>
            </Block>
            <Block show={labels} names={["OverviewItems (activity)"]}>
              <DashboardCard title="Recent activity">
                <OverviewItems resourceId="updates" title="Recent activity" items={UPDATES} />
              </DashboardCard>
            </Block>
            <Block show={labels} names={["OverviewItems (people)"]}>
              <DashboardCard title="Advisors awaiting review">
                <OverviewItems resourceId="reviews" title="Advisors awaiting review" items={ADVISORS} />
              </DashboardCard>
            </Block>
          </div>
        </section>

        <Block show={labels} names={["StatCard (data kit)"]}>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <LegacyStatCard label="Commission paid" value={<Amount value={84200} />} delta={{ value: 12 }} context="vs last month" sparkline={[12, 18, 15, 22, 26]} sparklineLabel="Commission, last 5 months" />
            <LegacyStatCard label="Students placed" value="21" delta={{ value: -4 }} context="vs last intake" />
          </div>
        </Block>

        <Block show={labels} names={["DashboardCard", "PillBarChart", "GaugeChart", "GaugeLegendStats", "CardFooterStats"]}>
          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardCard title="Applications (hand-built card)" footer={<CardFooterStats items={[{ label: "Submitted", value: "126" }, { label: "Offers", value: "38" }]} />}>
              <PillBarChart data={WEEK} label="Applications per day" unit="applications" />
            </DashboardCard>
            <DashboardCard title="Placement (hand-built card)">
              <GaugeChart segments={PLACEMENT} centerLabel="62%" centerCaption="placed" label="Placement this intake" />
              <GaugeLegendStats items={PLACEMENT} className="mt-4" />
            </DashboardCard>
          </div>
        </Block>
      </main>
    </div>
  );
}
