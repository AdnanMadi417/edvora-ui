"use client";

import clsx from "clsx";
import { BadgeDollarSign, Briefcase, FileText, GraduationCap, Plane, Plus, Search, UserPlus, Wallet, Award, Check } from "lucide-react";
import Button from "components/ub/core/Button";
import TextButton from "components/ub/core/TextButton";
import StatCard from "components/ub/data/StatCard";
import DaysTag from "components/ub/data/DaysTag";
import PipelineBar from "components/ub/data/PipelineBar";
import NotificationItem, { NotificationGroup } from "components/ub/feedback/NotificationItem";
import CountBadge from "components/ub/data/CountBadge";
import { Avatar } from "components/ub/data/Avatar";
import { List, ListItem } from "components/ub/data/List";
import ProgressBar from "components/ub/feedback/ProgressBar";
import { card, cardInteractive, cardPadding, focusRing } from "components/ub/recipes";
import { Demo, ShowcaseSection } from "./Showcase";

const NEXT_ACTIONS = [
  { student: "Nur Aisyah Binti Kamal", ref: "UBX-2026-0412", task: "Upload the signed offer letter", days: 1, mode: "deadline" as const, action: "Upload letter" },
  { student: "Chinedu Okafor", ref: "UBX-2026-0413", task: "Pay the EMGS visa fee", days: 0, mode: "deadline" as const, action: "Pay fee" },
  { student: "Tanvir Hossain", ref: "UBX-2026-0414", task: "Replace the blurred passport copy", days: 9, mode: "inStage" as const, action: "Replace file" },
];

// Pipeline counts per stage id from config/applicationStages.ts (brief §11.1: stages pending confirmation).
const PIPELINE: Partial<Record<string, number>> = {
  enquiry: 6,
  "documents-pending": 4,
  submitted: 3,
  "institution-review": 5,
  "offer-received": 3,
  "visa-in-progress": 2,
  "arrival-logistics": 1,
  enrolled: 4,
};

const DEADLINES = [
  { title: "Sunway University · September intake", detail: "Application deadline", days: 3 },
  { title: "EMGS visa renewal · Sara Mahmoud", detail: "Passport expires before arrival", days: 12 },
  { title: "Taylor's University · scholarship", detail: "Merit scholarship closes", days: 21 },
];

const ONBOARDING = [
  { label: "Complete your Advisor profile", done: true },
  { label: "Add your bank account", done: true },
  { label: "Sign the Non-Compete Covenant", done: true },
  { label: "Add your first student", done: false },
  { label: "Join the Earners Circle", done: false },
];

const ACTIVITY = [
  { who: "Sunway University", what: "sent an offer letter for Nur Aisyah Binti Kamal", when: "2 hours ago" },
  { who: "Finance team", what: "paid RM4,200 commission for UBX-2026-0398", when: "Yesterday" },
  { who: "You", what: "submitted Chinedu Okafor to Taylor's University", when: "27 Oct 2026" },
];

const NOTIFICATIONS: { group: string; items: { title: string; next: string; time: string; unread: boolean }[] }[] = [
  {
    group: "Today",
    items: [
      { title: "Offer received for Nur Aisyah Binti Kamal", next: "Next step: upload the signed offer letter.", time: "9:42 am", unread: true },
      { title: "Visa fee due for Chinedu Okafor", next: "Next step: pay RM2,500 before 5:00 pm.", time: "8:15 am", unread: true },
    ],
  },
  {
    group: "This week",
    items: [{ title: "Commission paid for UBX-2026-0398", next: "Next step: nothing. It's tracked automatically.", time: "Mon", unread: false }],
  },
  {
    group: "Earlier",
    items: [{ title: "Sunway University updated its fees", next: "Next step: check the Knowledge Hub before quoting.", time: "12 Oct 2026", unread: false }],
  },
];

const QUICK_ACTIONS = [
  { label: "Add student", icon: UserPlus, hint: "Start a new application" },
  { label: "Search Knowledge Hub", icon: Search, hint: "Programs, fees and intakes" },
  { label: "Book logistics", icon: Plane, hint: "Airport pickup and housing" },
  { label: "View commission", icon: Wallet, hint: "Expected, invoiced and paid" },
];

function Panel({ title, action, children, className }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={clsx(card, cardPadding, className)}>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h4 className="text-ub-heading-md text-ub-text-primary">{title}</h4>
        {action}
      </div>
      {children}
    </section>
  );
}

function AdvisorHome() {
  const done = ONBOARDING.filter((s) => s.done).length;
  return (
    <div className="ub-canvas-light space-y-6 rounded-ub-xl p-4 md:p-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-ub-body-sm text-ub-text-tertiary">Thursday, 29 Oct 2026</p>
          <h3 className="text-ub-display-md-mobile text-ub-text-primary sm:text-ub-display-md">Good morning, Nur Aisyah</h3>
          <p className="mt-1 text-ub-body-lg text-ub-text-secondary">
            <span className="ub-tabular font-semibold text-ub-text-primary">3</span> applications need your action today.
          </p>
        </div>
        <Button variant="primary" text="Add student" icon={<Plus className="h-4 w-4" />} />
      </header>

      <Panel title="Next actions" action={<CountBadge count={NEXT_ACTIONS.length} tone="danger" label={(n) => `${n} actions due`} />}>
        <List aria-label="Next actions">
          {NEXT_ACTIONS.map((a) => (
            <ListItem
              key={a.ref}
              leading={<Avatar name={a.student} size={40} />}
              title={a.task}
              description={
                <span>
                  {a.student} · <span className="ub-ref">{a.ref}</span>
                </span>
              }
              meta={<DaysTag mode={a.mode} days={a.days} />}
              trailing={<Button size="sm" text={a.action} />}
            />
          ))}
        </List>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active applications" icon={<FileText className="h-5 w-5" />} value="24" delta={{ value: 3, unit: "" }} context="vs last month" sparkline={[14, 16, 15, 18, 20, 21, 24]} />
        <StatCard label="Offers this intake" icon={<Award className="h-5 w-5" />} value="6" delta={{ value: 20 }} context="vs last intake" />
        <StatCard label="Commission pending" icon={<BadgeDollarSign className="h-5 w-5" />} value="RM12,400" delta={{ value: -8 }} context="vs last month" />
        <StatCard label="Placed this year" icon={<GraduationCap className="h-5 w-5" />} value="18" delta={{ value: 12 }} context="vs 2025" sparkline={[4, 6, 9, 11, 13, 16, 18]} />
      </div>

      <Panel title="Pipeline" action={<TextButton size="sm" href="#dashboard">Open Application Tracker</TextButton>}>
        <PipelineBar counts={PIPELINE} />
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Upcoming deadlines">
          <List aria-label="Upcoming deadlines" dense>
            {DEADLINES.map((d) => (
              <ListItem key={d.title} title={d.title} description={d.detail} meta={<DaysTag mode="deadline" days={d.days} />} />
            ))}
          </List>
        </Panel>

        <Panel title="Finish setting up" action={<span className="ub-tabular text-ub-label-md text-ub-text-secondary">{done} of 5</span>}>
          <ProgressBar value={done} max={5} label="Onboarding progress" />
          <ul className="mt-4 space-y-2">
            {ONBOARDING.map((s) => (
              <li key={s.label} className="flex items-center gap-3 text-ub-body-sm">
                <span className={clsx("grid h-5 w-5 shrink-0 place-items-center rounded-ub-full", s.done ? "bg-ub-action-primary text-ub-action-primary-text" : "border border-ub-border-control")}>
                  {s.done && <Check className="h-3 w-3" aria-hidden />}
                </span>
                <span className={s.done ? "text-ub-text-tertiary" : "text-ub-text-primary"}>
                  {s.label}
                  <span className="sr-only">{s.done ? " (done)" : " (to do)"}</span>
                </span>
              </li>
            ))}
          </ul>
          <TextButton className="mt-4" trailingIcon="arrow-right">
            Continue setup
          </TextButton>
        </Panel>
      </div>

      <Panel title="Recent activity">
        <List aria-label="Recent activity" dense>
          {ACTIVITY.map((a) => (
            <ListItem key={a.what} leading={<Avatar name={a.who} size={32} />} title={<span><span className="font-semibold">{a.who}</span> {a.what}</span>} meta={<span className="text-ub-caption text-ub-text-tertiary">{a.when}</span>} />
          ))}
        </List>
      </Panel>
    </div>
  );
}

export default function DashboardPatterns() {
  return (
    <ShowcaseSection
      id="dashboard"
      number="13"
      title="Dashboard patterns"
      description="Building blocks of the Advisor and admin dashboards, assembled from the components above. The Advisor home follows the brief: next actions first, one Primary action, glass stat cards, the pipeline by stage color."
    >
      <Demo name="Advisor home" path="docs/unibexs-frontend-redesign-brief.md" description="Brief §6: greeting with today's date and the actions count, next actions with a Days tag and one button each, four stat cards, pipeline, deadlines, onboarding and recent activity.">
        <AdvisorHome />
      </Demo>

      <Demo name="Notifications feed" path="components/ub/feedback/NotificationItem.tsx" description="Each item states the event, then the next step. Unread items show an 8px blue dot. Grouped into Today, This week and Earlier.">
        <div className={clsx(card, "max-w-ub-form divide-y divide-ub-border")}>
          {NOTIFICATIONS.map((g) => (
            <NotificationGroup key={g.group} label={g.group}>
              {g.items.map((n) => (
                <NotificationItem key={n.title} title={n.title} nextStep={n.next} time={n.time} unread={n.unread} onClick={() => undefined} />
              ))}
            </NotificationGroup>
          ))}
        </div>
      </Demo>

      <Demo name="Quick actions" path="components/ub/recipes.ts" description="Interactive cards: border at rest, blue-300 border and shadow-sm on hover.">
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {QUICK_ACTIONS.map(({ label, icon: Icon, hint }) => (
            <li key={label}>
              <button type="button" className={clsx(card, cardInteractive, focusRing, "flex w-full items-center gap-4 p-4 text-start")}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-ub-md bg-ub-tone-brand-bg text-ub-tone-brand-text">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span>
                  <span className="block text-ub-label-md text-ub-text-primary">{label}</span>
                  <span className="block text-ub-caption text-ub-text-tertiary">{hint}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Demo>

      <Demo name="Pending tasks" path="components/ub/data/List.tsx" description="Compact list for team owners: who, what, and how long it has waited.">
        <div className={clsx(card, "max-w-ub-form")}>
          <List aria-label="Pending tasks" dense>
            {[
              { who: "Farid Hakimi", task: "Review documents for Sara Mahmoud", days: 2 },
              { who: "Lim Wei Jie", task: "Confirm arrival date for Tanvir Hossain", days: 6 },
              { who: "Priya Nair", task: "Answer Institution query on UBX-2026-0407", days: 16 },
            ].map((t) => (
              <ListItem key={t.task} leading={<Avatar name={t.who} size={32} />} title={t.task} description={t.who} meta={<DaysTag mode="inStage" days={t.days} />} trailing={<Briefcase className="h-4 w-4 text-ub-icon" aria-hidden />} />
            ))}
          </List>
        </div>
      </Demo>
    </ShowcaseSection>
  );
}
