"use client";

// One demo per Application Details feature component
// (features/applications/components), with mock data. The full page is the
// "Application Details" demo in Content.

import { useState } from "react";
import { Clock, Headset, Upload, XCircle } from "lucide-react";
import Button from "components/ub/core/buttons/Button";
import type { SectionCardState } from "components/ub/data/cards/SectionCard";
import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import { resolveStage } from "features/applications/stages";
import type { DocumentItem } from "features/applications/model/applicationView";
import type { ApplicationDetailsTab } from "features/applications/shared/applicationDetailTabs";
import type { OfferStatus } from "features/applications/components/OfferCard";
import ApplicationsTable, { type ApplicationListRow } from "features/applications/components/ApplicationsTable";
import {
  ActivityTimeline,
  ApplicationAlerts,
  ApplicationDetailsLayout,
  ApplicationHeader,
  ApplicationSummaryCard,
  ApplicationTrackerCard,
  CommissionCard,
  DocumentChecklist,
  DocumentRow,
  NotesPanel,
  OfferCard,
  StudentBackgroundCard,
  StudentInfoCard,
  VisaStatusCard,
  WithdrawApplicationDialog,
} from "features/applications/components";
import { Demo, ShowcaseSection, StateSwitch, ThemePreviews, Variant } from "../Showcase";

const NOW = new Date("2026-11-02T10:00:00+08:00");
const ago = (h: number) => new Date(NOW.getTime() - h * 3_600_000).toISOString();
const doc = (id: string, name: string, state: DocumentItem["state"], extra: Partial<DocumentItem> = {}): DocumentItem => ({
  id,
  name,
  state,
  stateLabel: state === "uploaded" ? "In review" : undefined,
  group: "application",
  uploadedAt: "2026-06-12T09:00:00+08:00",
  reason: null,
  fileKey: `demo/${id}.pdf`,
  fileUrl: null,
  ...extra,
});
const DOCS: DocumentItem[] = [
  doc("passport", "Passport", "verified"),
  doc("transcript", "Academic transcript", "needs-replacing", { reason: "Not certified. Upload a certified true copy." }),
  doc("english", "English proficiency certificate", "uploaded", { uploadedAt: ago(20) }),
  doc("photo", "Passport photo", "verified"),
];
const CARD_STATES = ["ready", "loading", "empty", "error"] as const;
const LIST_ROWS: ApplicationListRow[] = [
  { id: "app_001", student_name: "Nur Aisyah Binti Kamal", passport_number: "A12345678", program_name: "Bachelor of Computer Science (Hons)", university_name: "Sunway University", partner_name: "Global Pathways Education", account_manager_name: "Farid Hakimi", stage: "Institution Review", status: "Correction Requested", updated_at: ago(3) },
  { id: "app_002", student_name: "Chinedu Okafor", passport_number: "B98765432", program_name: "Master of Data Science", university_name: "Taylor's University", partner_name: "Bright Future Consultancy", account_manager_name: "Lim Wei Jie", stage: "Offer & Visa Payment", status: "Waiting for Payment", updated_at: ago(30) },
  { id: "app_003", student_name: "Tanvir Hossain", passport_number: "C24681357", program_name: "Diploma in Information Technology", university_name: "UCSI University", partner_name: "Global Pathways Education", account_manager_name: "Priya Nair", stage: "Visa Processing", status: "Visa Issued", updated_at: ago(120) },
];
const noop = () => undefined;

function useCardState() {
  return useState<SectionCardState>("ready");
}

export default function ApplicationComponents() {
  const [summaryState, setSummaryState] = useCardState();
  const [docState, setDocState] = useCardState();
  const [offer, setOffer] = useState<OfferStatus>("received");
  const [commission, setCommission] = useState<"expected" | "invoiced" | "paid" | "disputed" | "none">("expected");
  const [activityState, setActivityState] = useState<"ready" | "loading" | "error" | "empty">("ready");
  const [stage, setStage] = useState<"SENT_TO_UNIVERSITY" | "WAITING_FOR_PAYMENT" | "ARRIVAL_CONFIRMED">("SENT_TO_UNIVERSITY");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [tab, setTab] = useState<ApplicationDetailsTab>("overview");
  const [notes, setNotes] = useState([{ id: "n1", author: "Farid Hakimi", body: "Student prefers the January intake.", at: ago(26) }]);

  return (
    <ShowcaseSection id="application-components" title="Application Details components" description="Feature components that compose the kit with application data. Typed props in, no fetching.">
      <Demo
        name="ApplicationsTable"
        path="features/applications/components/ApplicationsTable.tsx"
        description="The Application Tracker list for every role, on DataTable: student with passport number, programme and Institution, owner (staff), stage with a status tag and an Action needed tag, updated time. Rows open in a new tab. Staff get compact rows, selection and Export as CSV; Advisors get comfortable rows."
        code={`<ApplicationsTable
  rows={applications}
  loading={loading}
  error={error}
  onRetry={refetch}
  hrefFor={(id) => \`/admin/applications/\${id}\`}
  ownership="advisor-and-manager"
  statusLabel={statusLabel}
  needsAction={needsAction}
  defaultDensity="compact"
  selectable
  selectionResetKey={filtersKey}
  footer={<TablePagination ... />}
/>`}
        props={[
          { name: "rows / loading / error / onRetry", type: "ApplicationListRow[] / boolean / string | null / () => void", description: "From the role's list hook; data stays in the page." },
          { name: "hrefFor", type: "(id) => string", description: "Detail page; opens in a new tab." },
          { name: "ownership", type: '"advisor-and-manager" | "advisor" | "none"', default: '"none"', description: "Owner column per role." },
          { name: "statusLabel / needsAction", type: "(status) => string / (status) => boolean", description: "Status display name and the Action needed rule." },
          { name: "defaultDensity", type: '"comfortable" | "compact"', default: '"comfortable"', description: "Staff compact, Advisors comfortable; the toolbar switches it." },
          { name: "selectable / selectionResetKey", type: "boolean / string", default: "false", description: "Staff selection with Export as CSV; clears when filters change." },
        ]}
      >
        <ApplicationsTable rows={LIST_ROWS} hrefFor={() => "#c-applicationstable"} ownership="advisor-and-manager" statusLabel={(s) => s} needsAction={(s) => s === "Correction Requested"} defaultDensity="compact" selectable />
      </Demo>

      <Demo
        name="ApplicationHeader"
        path="features/applications/components/ApplicationHeader.tsx"
        description="Avatar, name, reference ID (ss02), stage tag, Days tag, Institution · programme · intake, one Primary action (hidden below 768px, where the sticky bar shows it) and the overflow menu."
        code={`<ApplicationHeader
  studentName="Nur Aisyah Binti Kamal"
  reference="UBX-2026-0412"
  stageId="offer-received"
  daysInStage={9}
  institution="Sunway University"
  programme="Bachelor of Computer Science (Hons)"
  intake="2027-01-05"
  primaryAction={{ label: "Accept offer", icon: CheckCircle2, onClick: accept }}
  overflowActions={[{ label: "Withdraw application", icon: XCircle, onClick: openWithdraw, destructive: true }]}
/>`}
        props={[
          { name: "studentName / photoUrl / reference", type: "string", description: "Reference hidden when the API has none." },
          { name: "stageId / stageLabel / actionNeeded", type: "string / string / boolean", description: "Stage tag from config; label when the id is unknown." },
          { name: "daysInStage", type: "number | null", description: "Days tag; omitted when the API doesn't provide it." },
          { name: "primaryAction", type: "{ label, icon?, onClick, loading?, disabled? }", description: "The one Primary: the viewer's next action." },
          { name: "overflowActions", type: "{ label, icon, onClick, destructive? }[]", description: "Everything else, in the ⋮ menu." },
          { name: "titleAs", type: '"h1" | "h2" | "h3"', default: '"h1"', description: "Heading level when embedded." },
          { name: "loading", type: "boolean", default: "false", description: "Skeleton header." },
        ]}
      >
        <ThemePreviews className="xl:grid-cols-1">
          <ApplicationHeader
            breadcrumbs={<Breadcrumbs items={[{ label: "Applications", href: "#" }, { label: "Nur Aisyah Binti Kamal" }]} />}
            studentName="Nur Aisyah Binti Kamal"
            titleAs="h3"
            reference="UBX-2026-0412"
            stageId="offer-received"
            daysInStage={9}
            institution="Sunway University"
            programme="Bachelor of Computer Science (Hons)"
            intake="2027-01-05"
            primaryAction={{ label: "Accept offer", icon: Upload, onClick: noop }}
            overflowActions={[
              { label: "Put on hold", icon: Clock, onClick: noop },
              { label: "Contact Unibexs support", icon: Headset, onClick: noop },
              { label: "Withdraw application", icon: XCircle, onClick: () => setWithdrawOpen(true), destructive: true },
            ]}
          />
        </ThemePreviews>
      </Demo>

      <Demo name="ApplicationAlerts" path="features/applications/components/ApplicationAlerts.tsx" description="Stacked alerts above the tracker; renders nothing when empty. buildApplicationAlerts() derives the correction and replace-document alerts from the data." code={`<ApplicationAlerts alerts={buildApplicationAlerts(view, actions?.correction_reason)} />`}>
        <ApplicationAlerts
          alerts={[
            { id: "fix", tone: "warning", title: "Correction requested", body: "The academic transcript is not certified. Upload a certified true copy." },
            { id: "replace", tone: "danger", title: "Replace the passport photo", body: "The background must be plain white." },
          ]}
        />
      </Demo>

      <Demo name="ApplicationTrackerCard" path="features/applications/components/ApplicationTrackerCard.tsx" description="Horizontal from 768px, vertical below; the current step has aria-current=&quot;step&quot;; the Next step line is announced politely. Steps come from stages.ts." code={`<ApplicationTrackerCard stage={resolveStage({ stageCode, statusCode, lifecycle })} nextStep={view.nextStep} statusName={view.stage.statusName} />`}>
        <StateSwitch<typeof stage> value={stage} options={["SENT_TO_UNIVERSITY", "WAITING_FOR_PAYMENT", "ARRIVAL_CONFIRMED"] as const} onChange={setStage} label="Backend status" />
        <div className="mt-4">
          <ApplicationTrackerCard stage={resolveStage({ stageCode: stage === "ARRIVAL_CONFIRMED" ? "STUDENT_ARRIVAL_ENROLLMENT" : "OFFER_LETTER", statusCode: stage })} statusName={stage === "SENT_TO_UNIVERSITY" ? "Sent to University" : stage === "WAITING_FOR_PAYMENT" ? "Waiting for Payment" : "Arrival Confirmed"} nextStep={stage === "ARRIVAL_CONFIRMED" ? null : stage === "WAITING_FOR_PAYMENT" ? "Pay the visa fee and upload the receipt." : "Wait for the university's decision."} />
        </div>
      </Demo>

      <Demo name="ApplicationSummaryCard" path="features/applications/components/ApplicationSummaryCard.tsx" description="Programme, Institution, level, intake, duration, tuition (RM, tabular), submitted date and Advisor. Missing values read Not available." code={`<ApplicationSummaryCard programme={view.programme} institution={view.institution} intake={view.intake} tuition={view.tuition} submittedAt={view.submittedAt} advisorName={view.advisorName} />`}>
        <StateSwitch<SectionCardState> value={summaryState} options={CARD_STATES} onChange={setSummaryState} label="Card state" />
        <div className="mt-4 max-w-ub-form">
          <ApplicationSummaryCard state={summaryState} onRetry={() => setSummaryState("ready")} programme="Bachelor of Computer Science (Hons)" institution="Sunway University" qualificationLevel="Bachelor's degree" intake="2027-01-05" durationMonths={36} tuition={{ amount: 31000, currency: "RM" }} submittedAt="2026-06-14T11:00:00+08:00" advisorName={null} />
        </div>
      </Demo>

      <Demo name="StudentInfoCard and StudentBackgroundCard" path="features/applications/components/StudentInfoCard.tsx" description="Contact details with a WhatsApp action and the passport number in ss02; background holds education, English tests and emergency contacts." className="grid gap-6 lg:grid-cols-2" code={`<StudentInfoCard email={s.email} phone={s.phone} passportNumber={s.passportNumber} whatsappUrl={whatsappLink(s.phone)} />`}>
        <StudentInfoCard email="nur.aisyah@mail.com" phone="+60 12 345 6789" nationality="Malaysia" passportNumber="A12345678" birthday="2006-03-18" gender="Female" address="Jalan SS 15/4, Subang Jaya" whatsappUrl="https://wa.me/60123456789" />
        <StudentBackgroundCard
          education={[{ id: "e", institution: "SMK Seksyen 9 Shah Alam", qualification: "SPM", grade: "8A 1B", endDate: "2023-12-01" }]}
          englishTests={[{ id: "t", test: "MUET", score: "Band 4", date: "2026-03-15" }]}
          emergencyContacts={[{ id: "c", name: "Kamal Bin Hassan", relation: "Father", phone: "+60 13 222 4455" }]}
          className="lg:col-span-2"
        />
      </Demo>

      <Demo name="DocumentChecklist and DocumentRow" path="features/applications/components/DocumentChecklist.tsx" description="Needs replacing first, then by date. Count badge on the title; limit plus View all for the Overview. DocumentRow offers Replace only when the backend allows it (replaceable) or the file needs replacing." code={`<DocumentChecklist documents={docs} limit={4} onViewAll={() => setTab("documents")} onDownload={download} onReplace={startReplace} />`}>
        <StateSwitch<SectionCardState> value={docState} options={CARD_STATES} onChange={setDocState} label="Card state" />
        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <DocumentChecklist documents={docState === "empty" ? [] : DOCS} state={docState === "empty" ? "ready" : docState} limit={3} onViewAll={noop} onDownload={noop} onReplace={noop} onRetry={() => setDocState("ready")} />
          <Variant label="DocumentRow while uploading (64%)">
            <ul className="rounded-ub-lg border border-ub-border bg-ub-surface px-4">
              <DocumentRow document={doc("transcript-2", "Academic transcript", "needs-replacing")} uploadProgress={64} onReplace={noop} />
            </ul>
          </Variant>
        </div>
      </Demo>

      <Demo name="OfferCard" path="features/applications/components/OfferCard.tsx" description="Status tag, expiry as a Days tag, conditions, the offer letter and the visa fee. offerStatusOf() derives the status." code={`<OfferCard status={offerStatusOf(statusCode, !!view.offerLetter)} offerLetter={view.offerLetter} visaFee={visaFee} onDownload={download} />`}>
        <StateSwitch<OfferStatus> value={offer} options={["awaiting", "received", "declined"] as const} onChange={setOffer} label="Offer status" />
        <div className="mt-4 max-w-ub-form">
          <OfferCard status={offer} offerLetter={offer === "received" ? doc("offer", "Offer letter", "verified") : null} expiresInDays={offer === "received" ? 12 : null} conditions={offer === "received" ? ["Submit a certified academic transcript before enrolment."] : []} visaFee={offer === "received" ? { amount: 2450, currency: "RM" } : null} onDownload={noop} />
        </div>
      </Demo>

      <Demo name="VisaStatusCard" path="features/applications/components/VisaStatusCard.tsx" description="Vertical tracker from the visa documents: verified → complete, uploaded → In review, needs replacing → attention." code={`<VisaStatusCard steps={[{ id: "fee", label: "Visa fee", document: receipt }, { id: "eval", label: "EMGS evaluation (eVAL)", document: view.visa.evaluation }]} />`}>
        <div className="max-w-ub-form">
          <VisaStatusCard
            steps={[
              { id: "fee", label: "Visa fee", document: doc("receipt", "Visa payment receipt", "verified") },
              { id: "eval", label: "EMGS evaluation (eVAL)", document: doc("eval", "EMGS evaluation", "uploaded") },
              { id: "approval", label: "Visa approval letter", document: null },
            ]}
            onDownload={noop}
          />
        </div>
      </Demo>

      <Demo name="CommissionCard" path="features/applications/components/CommissionCard.tsx" description="Expected / Invoiced / Paid (Disputed while a dispute is open), amount, due date when known, role actions and Tracked automatically. The Institution's payout window is never shown as a commitment." code={`<CommissionCard commission={view.commission} actions={<Button variant="primary" text="Confirm received" />} />`}>
        <StateSwitch<typeof commission> value={commission} options={["expected", "invoiced", "paid", "disputed", "none"] as const} onChange={setCommission} label="Commission" />
        <div className="mt-4 max-w-ub-form-sm">
          <CommissionCard
            commission={commission === "none" ? null : { state: commission, amount: 4200, currency: "RM", type: "Flat fee per student", expectedFrom: null, expectedTo: null, notes: null }}
            dueInDays={commission === "expected" ? 45 : null}
            actions={commission === "paid" ? <><Button variant="primary" text="Confirm received" /><Button variant="secondary" text="Dispute commission" /></> : undefined}
          />
        </div>
      </Demo>

      <Demo name="ActivityTimeline" path="features/applications/components/ActivityTimeline.tsx" description="Grouped Today / This week / Earlier, relative time under 7 days, detail lines, Load more, and loading, error (Try again) and unavailable states." code={`<ActivityTimeline events={toTimelineEvents(timeline.items)} total={timeline.total} loading={timeline.loading} error={timeline.error} onRetry={timeline.refetch} hasMore={timeline.hasMore} onLoadMore={timeline.loadMore} />`}>
        <StateSwitch<typeof activityState> value={activityState} options={["ready", "loading", "error", "empty"] as const} onChange={setActivityState} label="Activity state" />
        <div className="mt-4 max-w-ub-form">
          <ActivityTimeline
            now={NOW}
            loading={activityState === "loading"}
            error={activityState === "error" ? "Couldn't load activity." : null}
            onRetry={() => setActivityState("ready")}
            total={activityState === "ready" ? 3 : 0}
            hasMore={activityState === "ready"}
            onLoadMore={noop}
            events={
              activityState === "ready"
                ? [
                    { id: "a1", title: "Farid Hakimi uploaded the English proficiency certificate", at: ago(20), tone: "brand" },
                    { id: "a2", title: "Unibexs System requested a correction", at: ago(30), tone: "attention", details: [{ label: "Reason", text: "The academic transcript is not certified." }] },
                    { id: "a3", title: "Submitted to Institution", at: "2026-06-14T11:00:00+08:00", tone: "neutral" },
                  ]
                : []
            }
          />
        </div>
      </Demo>

      <Demo name="NotesPanel" path="features/applications/components/NotesPanel.tsx" description="Internal notes with an add form. Never render it in the Glass Box." code={`<NotesPanel notes={notes} onAdd={saveNote} />`}>
        <div className="max-w-ub-form-sm">
          <NotesPanel now={NOW} notes={notes} onAdd={(body) => setNotes((n) => [{ id: `n${n.length + 1}`, author: "You", body, at: new Date().toISOString() }, ...n])} />
        </div>
      </Demo>

      <Demo name="WithdrawApplicationDialog" path="features/applications/components/WithdrawApplicationDialog.tsx" description="Names the consequence; Cancel is focused first and the destructive action comes last." code={`<WithdrawApplicationDialog open={open} onClose={close} onConfirm={withdraw} loading={withdrawing} />`}>
        <Button variant="secondary" icon={<XCircle className="h-4 w-4" aria-hidden="true" />} text="Withdraw application" onClick={() => setWithdrawOpen(true)} />
        <WithdrawApplicationDialog open={withdrawOpen} onClose={() => setWithdrawOpen(false)} onConfirm={() => setWithdrawOpen(false)} />
      </Demo>

      <Demo name="ApplicationDetailsLayout" path="features/applications/components/ApplicationDetailsLayout.tsx" description="Page frame: header, alerts, tracker, then the five tabs (scroll on mobile) and their panels; OverviewGrid is 2/3 + 1/3 from 992px; the Primary repeats in a sticky bar below 768px unless stickyAction is false." code={`<ApplicationDetailsLayout header={header} alerts={alerts} tracker={tracker} activeTab={tab} onTabChange={setTab} panels={panels} primaryAction={next} />`}>
        <ApplicationDetailsLayout
          header={<ApplicationHeader studentName="Nur Aisyah Binti Kamal" titleAs="h3" stageId="offer-received" institution="Sunway University" />}
          tracker={(navigation) => <ApplicationTrackerCard stage={resolveStage({ stageCode: "OFFER_LETTER" })} nextStep="Pay the visa fee and upload the receipt." navigation={navigation} />}
          activeTab={tab}
          onTabChange={setTab}
          tabCounts={{ documents: 1 }}
          stickyAction={false}
          panels={{
            overview: <p className="text-ub-body-sm text-ub-text-secondary">Overview panel: OverviewGrid with the summary, documents and offer on the left; student, commission and notes on the right.</p>,
            documents: <p className="text-ub-body-sm text-ub-text-secondary">Documents panel.</p>,
            "offer-visa": <p className="text-ub-body-sm text-ub-text-secondary">Offer and visa panel.</p>,
            commission: <p className="text-ub-body-sm text-ub-text-secondary">Commission panel.</p>,
            activity: <p className="text-ub-body-sm text-ub-text-secondary">Activity panel.</p>,
          }}
        />
      </Demo>
    </ShowcaseSection>
  );
}
