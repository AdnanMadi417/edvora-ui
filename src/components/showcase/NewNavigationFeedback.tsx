"use client";

import { useState } from "react";
import { Bell, BookOpen, Copy, FilePenLine, FileText, House, MessageCircle, MoreHorizontal, Share2, Trash2, Users, Wallet } from "lucide-react";
import clsx from "clsx";
import { buttonBase, buttonSizes, buttonVariants, fieldControl, fieldControlHeight, fieldLabel, iconButtonSizes } from "components/ub/recipes";
import NavbarBottom, { type NavbarBottomItem } from "components/ub/navigation/NavbarBottom";
import Breadcrumbs from "components/ub/navigation/Breadcrumbs";
import Pagination from "components/ub/navigation/Pagination";
import ContextMenu from "components/ub/navigation/ContextMenu";
import Alert from "components/ub/feedback/Alert";
import Modal, { ConfirmDialog } from "components/ub/feedback/Modal";
import Drawer from "components/ub/feedback/Drawer";
import ActionSheet from "components/ub/feedback/ActionSheet";
import ProgressBar from "components/ub/feedback/ProgressBar";
import EmptyState from "components/ub/feedback/EmptyState";
import { Demo, ShowcaseSection, StateSwitch, Variant } from "./Showcase";

const NAV_ITEMS: NavbarBottomItem[] = [
  { href: "/partner/dashboard", label: "Home", icon: House },
  { href: "/partner/applications", label: "Tracker", icon: FileText, badgeCount: 3 },
  { href: "/partner/students", label: "Students", icon: Users },
  { href: "/partner/commission", label: "Commission", icon: Wallet },
  { href: "/partner/notifications", label: "Alerts", icon: Bell, badgeCount: 12, badgeLabel: (n) => `${n} unread` },
];

const btn = (variant: keyof typeof buttonVariants) => clsx(buttonBase, buttonSizes.md, buttonVariants[variant]);
const PROGRESS_STATES = ["determinate", "indeterminate"] as const;

export default function NewNavigationFeedback() {
  const [activeNav, setActiveNav] = useState("/partner/applications");
  const [page, setPage] = useState(5);
  const [compactPage, setCompactPage] = useState(2);
  const [lastAction, setLastAction] = useState("No action chosen yet.");
  const [alertVisible, setAlertVisible] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [withdrawn, setWithdrawn] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [progressMode, setProgressMode] = useState<(typeof PROGRESS_STATES)[number]>("determinate");

  return (
    <ShowcaseSection
      id="nav-feedback-new"
      title="Navigation and feedback (brief components)"
      description="Bottom nav, breadcrumbs, pagination, context menu, inline alerts, dialogs, drawer, action sheet, progress and the canonical empty state."
    >
      <Demo
        name="NavbarBottom"
        path="components/ub/navigation/NavbarBottom.tsx"
        description="Mobile bottom nav: 64px plus the safe-area inset, light glass, hidden from md up. Shown here in a 375px frame with fixed={false}."
      >
        <div className="mx-auto flex h-[420px] w-full max-w-[375px] flex-col overflow-hidden rounded-ub-2xl border border-ub-border ub-canvas-light">
          <div className="flex-1 space-y-3 p-4">
            <p className="text-ub-heading-sm text-ub-text-primary">Application Tracker</p>
            <p className="text-ub-body-sm text-ub-text-secondary">3 applications need action today.</p>
            <div className="rounded-ub-lg border border-ub-border bg-ub-surface p-4">
              <p className="text-ub-label-md text-ub-text-primary">Nur Aisyah Binti Kamal</p>
              <p className="ub-ref text-ub-caption text-ub-text-tertiary">UBX-2026-0412 · Sunway University</p>
            </div>
          </div>
          {/* Links in the preview would navigate away; capture clicks to switch the active item instead. */}
          <div
            onClickCapture={(e) => {
              const a = (e.target as HTMLElement).closest("a");
              if (a) {
                e.preventDefault();
                setActiveNav(a.getAttribute("href") ?? activeNav);
              }
            }}
          >
            <NavbarBottom items={NAV_ITEMS} activeHref={activeNav} fixed={false} aria-label="Main (preview)" />
          </div>
        </div>
      </Demo>

      <Demo name="Breadcrumbs" path="components/ub/navigation/Breadcrumbs.tsx" description="Chevrons mirror in RTL. Below 640px the middle levels collapse into a menu." className="grid gap-6">
        <Variant label="Three levels">
          <Breadcrumbs
            items={[
              { label: "Students", href: "#c-breadcrumbs" },
              { label: "Nur Aisyah Binti Kamal", href: "#c-breadcrumbs" },
              { label: "Documents" },
            ]}
          />
        </Variant>
        <Variant label="Deep path (resize below 640px to collapse)">
          <Breadcrumbs
            items={[
              { label: "Knowledge Hub", href: "#c-breadcrumbs" },
              { label: "Malaysia", href: "#c-breadcrumbs" },
              { label: "Sunway University", href: "#c-breadcrumbs" },
              { label: "School of Engineering and Technology", href: "#c-breadcrumbs" },
              { label: "Bachelor of Computer Science (Hons)" },
            ]}
          />
        </Variant>
      </Demo>

      <Demo name="Pagination" path="components/ub/navigation/Pagination.tsx" description="Numbered pages with ellipsis from 640px; compact Page x of y below that or with compact." className="grid gap-6">
        <Variant label="Default">
          <Pagination page={page} pageCount={12} onPageChange={setPage} aria-label="Applications pages" />
        </Variant>
        <Variant label="Compact">
          <Pagination page={compactPage} pageCount={8} onPageChange={setCompactPage} compact aria-label="Students pages" />
        </Variant>
      </Demo>

      <Demo name="ContextMenu" path="components/ub/navigation/ContextMenu.tsx" description="Arrow keys, Home/End and typeahead. Esc closes and returns focus to the trigger." className="grid gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <ContextMenu
            label="Application actions"
            items={[
              {
                type: "group",
                label: "UBX-2026-0412",
                items: [
                  { label: "Edit application", icon: FilePenLine, shortcut: "E", onSelect: () => setLastAction("Edit application chosen.") },
                  { label: "Duplicate for another intake", icon: Copy, onSelect: () => setLastAction("Duplicate for another intake chosen.") },
                  { label: "Share Glass Box link", icon: Share2, onSelect: () => setLastAction("Glass Box link copied.") },
                  { label: "Message the Institution", icon: MessageCircle, disabled: true },
                ],
              },
              { type: "separator" },
              { label: "Withdraw application", icon: Trash2, tone: "danger", onSelect: () => setConfirmOpen(true) },
            ]}
            trigger={
              <button type="button" aria-label="More actions for UBX-2026-0412" className={clsx(buttonBase, iconButtonSizes.md, buttonVariants.secondary, "p-0")}>
                <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
              </button>
            }
          />
          <ContextMenu
            label="Sort students"
            align="start"
            items={[
              { label: "Name", onSelect: () => setLastAction("Sorted by name.") },
              { label: "Newest first", onSelect: () => setLastAction("Sorted by newest first.") },
              { label: "Days in stage", onSelect: () => setLastAction("Sorted by days in stage.") },
            ]}
            trigger={(props) => (
              <button type="button" {...props} className={btn("secondary")}>
                Sort by
              </button>
            )}
          />
        </div>
        <p aria-live="polite" className="text-ub-body-sm text-ub-text-secondary">
          {lastAction}
        </p>
      </Demo>

      <Demo name="Alert" path="components/ub/feedback/Alert.tsx" description="Inline alert: tinted background and border, 20px icon. Danger uses role=alert; the rest role=status." className="grid gap-4">
        {alertVisible ? (
          <Alert
            tone="warning"
            title="Fee information may be out of date"
            action={{ label: "Confirm with the Institution", onClick: () => setLastAction("Fee confirmation requested.") }}
            onDismiss={() => setAlertVisible(false)}
          >
            Sunway University last verified these fees 6 months ago. Confirm before quoting RM4,200 to the student.
          </Alert>
        ) : (
          <button type="button" className={clsx(btn("tertiary"), "justify-self-start")} onClick={() => setAlertVisible(true)}>
            Show warning alert again
          </button>
        )}
        <Alert tone="success" title="Application submitted">
          Sunway University has been notified. We&apos;ll update the Application Tracker when they reply.
        </Alert>
        <Alert tone="danger" title="Passport upload failed">
          This file is over 10 MB. Upload a PDF under 10 MB.
        </Alert>
        <Alert tone="info">Commission for this application is tracked automatically.</Alert>
      </Demo>

      <Demo name="Modal" path="components/ub/feedback/Modal.tsx" description="PopUp 400/560/720, radius 16, focus trapped, Esc closes and focus returns. ConfirmDialog uses the filled destructive button." className="grid gap-4">
        <div className="flex flex-wrap gap-3">
          <button type="button" className={btn("secondary")} onClick={() => setModalOpen(true)}>
            Add note
          </button>
          <button type="button" className={btn("secondary")} onClick={() => setConfirmOpen(true)} disabled={withdrawn}>
            Withdraw application
          </button>
        </div>
        <p aria-live="polite" className="text-ub-body-sm text-ub-text-secondary">
          {withdrawn ? "Application withdrawn. Sunway University has been notified." : "UBX-2026-0412 is in Institution review."}
        </p>
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Add note"
          description="Only you and your team can see notes. Students never see them in the Glass Box."
          footer={
            <>
              <button type="button" className={btn("secondary")} onClick={() => setModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className={btn("primary")}
                onClick={() => {
                  setModalOpen(false);
                  setLastAction("Note saved.");
                }}
              >
                Save note
              </button>
            </>
          }
        >
          <label htmlFor="nf-note" className={fieldLabel}>
            Note
          </label>
          <textarea id="nf-note" rows={4} className={clsx(fieldControl, "py-2")} defaultValue="Student asked about the September intake and hostel options." />
        </Modal>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => {
            setWithdrawn(true);
            setConfirmOpen(false);
          }}
          tone="danger"
          title="Withdraw this application?"
          consequence="The Institution will be notified, and this can't be undone."
          confirmLabel="Withdraw application"
        />
      </Demo>

      <Demo name="Drawer" path="components/ub/feedback/Drawer.tsx" description="480px from the end edge (left in RTL), full width on mobile, sticky footer.">
        <button type="button" className={btn("secondary")} onClick={() => setDrawerOpen(true)}>
          Filter applications
        </button>
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          title="Filter applications"
          description="Narrow the Application Tracker by stage, Institution and intake."
          footer={
            <>
              <button type="button" className={btn("secondary")} onClick={() => setDrawerOpen(false)}>
                Clear filters
              </button>
              <button type="button" className={btn("primary")} onClick={() => setDrawerOpen(false)}>
                Show 24 applications
              </button>
            </>
          }
        >
          <div className="grid gap-4">
            <div>
              <label htmlFor="nf-institution" className={fieldLabel}>
                Institution
              </label>
              <select id="nf-institution" className={clsx(fieldControl, fieldControlHeight)} defaultValue="sunway">
                <option value="sunway">Sunway University</option>
                <option value="taylors">Taylor&apos;s University</option>
                <option value="ucsi">UCSI University</option>
              </select>
            </div>
            <div>
              <label htmlFor="nf-intake" className={fieldLabel}>
                Intake
              </label>
              <select id="nf-intake" className={clsx(fieldControl, fieldControlHeight)} defaultValue="sep">
                <option value="sep">Sep 2026</option>
                <option value="jan">Jan 2027</option>
              </select>
            </div>
          </div>
        </Drawer>
      </Demo>

      <Demo name="ActionSheet" path="components/ub/feedback/ActionSheet.tsx" description="Bottom sheet on mobile, small centered dialog from 768px.">
        <button type="button" className={btn("secondary")} onClick={() => setSheetOpen(true)}>
          Student actions
        </button>
        <ActionSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title="Nur Aisyah Binti Kamal"
          description="UBX-2026-0412 · Sunway University"
          actions={[
            { label: "Message on WhatsApp", icon: MessageCircle, onSelect: () => setLastAction("WhatsApp opened.") },
            { label: "Share Glass Box link", icon: Share2, onSelect: () => setLastAction("Glass Box link copied.") },
            { label: "Withdraw application", icon: Trash2, tone: "danger", onSelect: () => setConfirmOpen(true) },
          ]}
        />
      </Demo>

      <Demo name="ProgressBar" path="components/ub/feedback/ProgressBar.tsx" description="8px pill with tones. Indeterminate animation is off under reduced motion.">
        <StateSwitch<(typeof PROGRESS_STATES)[number]> value={progressMode} options={PROGRESS_STATES} onChange={setProgressMode} label="Progress mode" />
        <div className="grid gap-6 sm:grid-cols-2">
          <Variant label="Brand">
            <ProgressBar label="Onboarding" value={3} max={5} valueText="3 of 5 steps" indeterminate={progressMode === "indeterminate"} />
          </Variant>
          <Variant label="Success">
            <ProgressBar label="Documents verified" value={6} max={6} valueText="6 of 6" tone="success" indeterminate={progressMode === "indeterminate"} />
          </Variant>
          <Variant label="Warning">
            <ProgressBar label="Offer letter upload" value={72} tone="warning" indeterminate={progressMode === "indeterminate"} />
          </Variant>
          <Variant label="Danger">
            <ProgressBar label="Visa window used" value={92} tone="danger" indeterminate={progressMode === "indeterminate"} />
          </Variant>
        </div>
      </Demo>

      <Demo name="EmptyState" path="components/ub/feedback/EmptyState.tsx" description="32px icon in a 64px circle, heading-md title, one sentence and one Primary action." className="grid gap-6 lg:grid-cols-2">
        <Variant label="Default">
          <EmptyState
            icon={FileText}
            title="No applications yet"
            description="Add your first student to start tracking every step."
            action={{ label: "Add student", onClick: () => setLastAction("Add student opened.") }}
          />
        </Variant>
        <Variant label="Compact">
          <EmptyState
            size="compact"
            icon={BookOpen}
            title="No saved programs"
            description="Save programs from the Knowledge Hub to compare up to 3."
            action={{ label: "Browse Knowledge Hub", href: "#c-emptystate" }}
          />
        </Variant>
      </Demo>
    </ShowcaseSection>
  );
}
