"use client";

import clsx from "clsx";
import { Briefcase, Plane, Search, UserPlus, Wallet } from "lucide-react";
import DaysTag from "components/ub/data/DaysTag";
import NotificationItem, { NotificationGroup } from "components/ub/feedback/NotificationItem";
import { Avatar } from "components/ub/data/Avatar";
import { List, ListItem } from "components/ub/data/List";
import { card, cardInteractive, cardPadding, focusRing } from "components/ub/recipes";
import AdvisorHomeScreen from "features/advisor-home/AdvisorHome";
import { Demo, ShowcaseSection } from "./Showcase";

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

export default function DashboardPatterns() {
  return (
    <ShowcaseSection
      id="dashboard"
      number="13"
      title="Dashboard patterns"
      description="Building blocks of the Advisor and admin dashboards, assembled from the components above. The Advisor home follows the brief: next actions first, one Primary action, glass stat cards, the pipeline by stage color."
    >
      <Demo name="Advisor home" path="docs/unibexs-frontend-redesign-brief.md" description="The live Advisor home (features/advisor-home, page /partner/home): four glass stat cards, then next actions, deadlines, pipeline, onboarding and recent activity on solid surfaces. Switch the theme to compare with the dark reference.">
        <div className="ub-canvas-light rounded-ub-xl p-4 md:p-6">
          <AdvisorHomeScreen headingLevel={2} />
        </div>
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
