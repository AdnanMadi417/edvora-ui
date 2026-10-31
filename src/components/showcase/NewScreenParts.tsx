"use client";

import { useState } from "react";
import { Plus, Bell, PanelLeftClose, Smartphone, Tablet, Monitor } from "lucide-react";
import Link from "next/link";
import Button from "components/ub/core/Button";
import PageHeader from "components/ub/navigation/PageHeader";
import StageTag from "components/ub/data/StageTag";
import DaysTag from "components/ub/data/DaysTag";
import PipelineBar from "components/ub/data/PipelineBar";
import DescriptionList from "components/ub/data/DescriptionList";
import { Avatar } from "components/ub/data/Avatar";
import Amount from "components/ub/core/Amount";
import RefId from "components/ub/core/RefId";
import NotificationItem, { NotificationGroup, groupNotifications } from "components/ub/feedback/NotificationItem";
import SectionIconBadge from "components/ub/icons/SectionIconBadge";
import { APPLICATION_STAGES } from "config/applicationStages";
import { card } from "components/ub/recipes";
import { Demo, ShowcaseSection, Variant } from "./Showcase";

const PIPELINE = { enquiry: 6, "documents-pending": 4, submitted: 3, "institution-review": 5, "offer-received": 3, "visa-in-progress": 2, "arrival-logistics": 1, enrolled: 4 };

// Fixed "now" so the groups always show all three buckets.
const NOW = new Date(2026, 9, 29, 12, 0);
const NOTIFICATIONS = [
  { id: 1, at: new Date(2026, 9, 29, 9, 42), title: "Offer received for Nur Aisyah Binti Kamal", next: "Next step: upload the signed offer letter.", time: "9:42 am", unread: true },
  { id: 2, at: new Date(2026, 9, 29, 8, 15), title: "Visa fee due for Chinedu Okafor", next: "Next step: pay RM2,500 before 5:00 pm.", time: "8:15 am", unread: true },
  { id: 3, at: new Date(2026, 9, 26, 10, 0), title: "Commission paid for UBX-2026-0398", next: "Next step: nothing. It's tracked automatically.", time: "Mon", unread: false },
  { id: 4, at: new Date(2026, 9, 12, 10, 0), title: "Sunway University updated its fees", next: "Next step: check the Knowledge Hub before quoting.", time: "12 Oct 2026", unread: false },
];

export default function NewScreenParts() {
  const [stageFilter, setStageFilter] = useState<string | null>(null);
  const [items, setItems] = useState(NOTIFICATIONS);

  return (
    <ShowcaseSection id="screen-parts" title="Screen building blocks">
      <Demo name="AppShell" path="components/ub/navigation/AppShell.tsx" description="Shared by every role layout. Open a role area to try it: collapse the sidebar with the button at its top or Ctrl/⌘+B, then resize the window.">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Monitor, title: "1200px and up", body: "Persistent sidebar, 256px or a 72px icon rail. Rail items show their label as a tooltip; a group expands the sidebar. The choice is remembered and applied before paint." },
            { icon: Tablet, title: "768–1199px", body: "The sidebar becomes a drawer, opened from the top bar's menu button. Esc, the scrim or choosing a page closes it." },
            { icon: Smartphone, title: "Below 768px", body: "Bottom nav with three main sections and Menu, which opens the full drawer. Content pads above it." },
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className={`${card} p-4`}>
              <Icon className="h-5 w-5 text-ub-icon-interactive" aria-hidden />
              <p className="mt-3 text-ub-label-md text-ub-text-primary">{title}</p>
              <p className="mt-1 text-ub-body-sm text-ub-text-secondary">{body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-ub-body-sm text-ub-text-secondary">
            <PanelLeftClose className="h-4 w-4" aria-hidden /> Try it in:
          </span>
          {[
            ["Admin", "/admin/applications"],
            ["Advisor", "/partner/applications"],
            ["Account manager", "/account-manager/applications"],
            ["Reviewer", "/reviewer/advisors"],
            ["Data entry", "/data-entry/knowledge-hub"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="inline-flex h-8 items-center rounded-ub-full border border-ub-border px-3 text-ub-label-sm text-ub-text-link transition-colors duration-ub-fast hover:border-ub-border-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-ub-border-focus">
              {label}
            </Link>
          ))}
        </div>
      </Demo>

      <Demo name="Sidebar and NavbarTop" path="components/ub/navigation/Sidebar.tsx" description="Read the collapse state anywhere with useSidebarCollapsed(); widths come from --ub-sidebar-w in styles/tokens/shell.css.">
        <pre dir="ltr" className="overflow-x-auto rounded-ub-md border border-ub-border bg-ub-surface-subtle p-4 text-ub-caption leading-5 text-ub-text-primary">
          <code>{`// app/<role>/layout.tsx
<RoleGuard allowedRoles={["admin"]}>
  <ToastProvider>
    <AppShell routes={adminRoutes}>{children}</AppShell>
  </ToastProvider>
</RoleGuard>

// anywhere in the portal
const { collapsed, toggle, setCollapsed } = useSidebarCollapsed();`}</code>
        </pre>
      </Demo>

      <Demo name="PageHeader" path="components/ub/navigation/PageHeader.tsx" description="Breadcrumbs, the page's h1, meta tags, one sentence and the view's actions (Primary last)." className="space-y-8">
        <Variant label="List page">
          <PageHeader
            breadcrumbs={[{ label: "Home", href: "#navigation" }, { label: "Application Tracker" }]}
            title="Application Tracker"
            description="Every student's application, from enquiry to placed."
            actions={
              <>
                <Button text="Export CSV" />
                <Button variant="primary" text="Add student" icon={<Plus className="h-4 w-4" />} />
              </>
            }
          />
        </Variant>
        <Variant label="Detail page (Student profile)">
          <PageHeader
            breadcrumbs={[{ label: "Students", href: "#navigation" }, { label: "Nur Aisyah Binti Kamal" }]}
            leading={<Avatar name="Nur Aisyah Binti Kamal" size={64} />}
            title="Nur Aisyah Binti Kamal"
            meta={
              <>
                <StageTag stageId="offer-received" />
                <DaysTag mode="inStage" days={5} />
              </>
            }
            description={
              <>
                <RefId value="UBX-2026-0412" /> · Bachelor of Computer Science (Hons) · Sunway University
              </>
            }
            actions={<Button variant="primary" text="Upload offer letter" />}
          />
        </Variant>
      </Demo>

      <Demo name="StageTag" path="components/ub/data/StageTag.tsx" description="Labels and colors come from config/applicationStages.ts (pending confirmation). Action needed is a separate flag." className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {APPLICATION_STAGES.map((s) => (
            <StageTag key={s.id} stageId={s.id} />
          ))}
        </div>
        <div className="flex flex-wrap gap-4">
          <Variant label="With Action needed">
            <StageTag stageId="documents-pending" actionNeeded />
          </Variant>
          <Variant label="Small, no dot">
            <StageTag stageId="visa-in-progress" size="sm" dot={false} />
          </Variant>
        </div>
      </Demo>

      <Demo name="PipelineBar" path="components/ub/data/PipelineBar.tsx" description="Click a legend item to filter, the way the Application Tracker does. Screen readers get the totals." className="space-y-3">
        <PipelineBar counts={PIPELINE} onStageSelect={(id) => setStageFilter((cur) => (cur === id ? null : id))} selectedStageId={stageFilter} />
        <p className="text-ub-body-sm text-ub-text-secondary" aria-live="polite">
          {stageFilter ? `Filtered to ${APPLICATION_STAGES.find((s) => s.id === stageFilter)?.label}` : "No stage filter"}
        </p>
      </Demo>

      <Demo name="NotificationItem" path="components/ub/feedback/NotificationItem.tsx" description="groupNotifications() buckets by date into Today, This week and Earlier. Click an item to mark it read.">
        <div className={`${card} max-w-ub-form divide-y divide-ub-border`}>
          {groupNotifications(items, (n) => n.at, NOW).map((group) => (
            <NotificationGroup key={group.label} label={group.label}>
              {group.items.map((n) => (
                <NotificationItem
                  key={n.id}
                  title={n.title}
                  nextStep={n.next}
                  time={n.time}
                  unread={n.unread}
                  leading={<SectionIconBadge icon={Bell} color={n.unread ? "blue" : "slate"} />}
                  onClick={() => setItems((all) => all.map((x) => (x.id === n.id ? { ...x, unread: false } : x)))}
                />
              ))}
            </NotificationGroup>
          ))}
        </div>
      </Demo>

      <Demo name="DescriptionList" path="components/ub/data/DescriptionList.tsx" description="Semantic <dl>. Values can be any component; empty values show a dash so the layout holds." className="grid gap-8 lg:grid-cols-2">
        <Variant label="Stacked, 2 columns (Student profile overview)">
          <DescriptionList
            columns={2}
            items={[
              { label: "Nationality", value: "Malaysia" },
              { label: "Passport number", value: <RefId value="A12345678" /> },
              { label: "Date of birth", value: "14 Mar 2006" },
              { label: "Phone", value: "+60 12-345 6789" },
              { label: "Intake", value: "September 2026" },
              { label: "Emergency contact", value: "" },
              { label: "Address", value: "12 Jalan SS 15/4, Subang Jaya, Selangor", fullWidth: true },
            ]}
          />
        </Variant>
        <Variant label="Inline, divided (payout details)">
          <DescriptionList
            layout="inline"
            divided
            items={[
              { label: "Tuition (annual)", value: <Amount value={18500} /> },
              { label: "Commission rate", value: "12%" },
              { label: "Commission", value: <Amount value={2220} /> },
              { label: "Status", value: <StageTag stageId="commission-paid" size="sm" /> },
              { label: "Reference", value: <RefId value="UBX-2026-0398" copyable /> },
            ]}
          />
        </Variant>
      </Demo>
    </ShowcaseSection>
  );
}
