"use client";

// Application Details with realistic mock data, built only from the Layer B
// components (features/applications/components). It shows every slot the
// design has, including ones the details API doesn't feed yet (Days tag,
// offer expiry, commission due date, notes, withdraw): see the PR notes.

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  ExternalLink,
  Headset,
  Upload,
  XCircle,
} from "lucide-react";
import { Demo } from "./Showcase";
import Breadcrumbs from "components/ub/navigation/Breadcrumbs";
import ThemeSwitcher from "components/theme/ThemeSwitcher";
import { resolveStage } from "features/applications/stages";
import type { ApplicationDetailsTab } from "features/applications/shared/applicationDetailTabs";
import type { DocumentItem } from "features/applications/model/applicationView";
import type { NoteItem } from "features/applications/components/NotesPanel";
import {
  ActivityTimeline,
  ApplicationAlerts,
  ApplicationDetailsLayout,
  ApplicationHeader,
  ApplicationSummaryCard,
  ApplicationTrackerCard,
  CommissionCard,
  DocumentChecklist,
  NotesPanel,
  OfferCard,
  OverviewGrid,
  StudentBackgroundCard,
  StudentInfoCard,
  TwoColumn,
  VisaStatusCard,
  WithdrawApplicationDialog,
} from "features/applications/components";

const NOW = new Date("2026-11-02T10:00:00+08:00");
const ago = (h: number) =>
  new Date(NOW.getTime() - h * 3_600_000).toISOString();

const doc = (
  id: string,
  name: string,
  state: DocumentItem["state"],
  uploadedAt: string | null,
  reason: string | null = null
): DocumentItem => ({
  id,
  name,
  state,
  stateLabel: state === "uploaded" ? "In review" : undefined,
  group: "application",
  uploadedAt,
  reason,
  fileKey: uploadedAt ? `demo/${id}.pdf` : null,
  fileUrl: null,
});

const DOCUMENTS: DocumentItem[] = [
  doc("passport", "Passport", "verified", "2026-06-12T09:00:00+08:00"),
  doc(
    "transcript",
    "Academic transcript",
    "needs-replacing",
    "2026-06-12T09:05:00+08:00",
    "Not certified. Upload a certified true copy."
  ),
  doc(
    "certificate",
    "Academic certificate",
    "verified",
    "2026-06-12T09:06:00+08:00"
  ),
  doc("english", "English proficiency certificate", "uploaded", ago(20)),
  doc("photo", "Passport photo", "verified", "2026-06-12T09:08:00+08:00"),
];
const OFFER_LETTER = {
  ...doc("offer", "Offer letter", "verified", "2026-10-21T14:00:00+08:00"),
  group: "offer" as const,
};

const STAGE = resolveStage({
  stageCode: "INSTITUTION_REVIEW",
  statusCode: "CORRECTION_REQUESTED",
  lifecycle: "active",
});

const EVENTS = [
  {
    id: "a1",
    title: "Farid Hakimi uploaded the English proficiency certificate",
    at: ago(20),
    tone: "brand" as const,
  },
  {
    id: "a2",
    title: "Unibexs System requested a correction",
    at: ago(30),
    tone: "attention" as const,
    details: [
      { label: "Reason", text: "The academic transcript is not certified." },
    ],
  },
  {
    id: "a3",
    title: "Offer received from Sunway University",
    at: ago(24 * 12),
    tone: "success" as const,
  },
  {
    id: "a4",
    title: "Submitted to Institution",
    at: "2026-06-14T11:00:00+08:00",
    tone: "neutral" as const,
  },
];

/** The page itself, embeddable: `embedded` drops the fixed mobile action bar so it can sit inside the style guide. */
export function ApplicationDetailsPreview({
  embedded = false,
}: {
  embedded?: boolean;
}) {
  const [tab, setTab] = useState<ApplicationDetailsTab>("overview");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: "n1",
      author: "Farid Hakimi",
      body: "Student prefers the January intake. Confirmed by WhatsApp.",
      at: ago(26),
    },
  ]);

  const primaryAction = {
    label: "Replace transcript",
    icon: Upload,
    onClick: () => setTab("documents"),
  };
  const offerCard = (
    <OfferCard
      status="received"
      offerLetter={OFFER_LETTER}
      expiresInDays={12}
      conditions={["Submit a certified academic transcript before enrolment."]}
      visaFee={{ amount: 2450, currency: "RM" }}
      visaFeeNote="Includes EMGS processing fee, medical screening and first-year insurance."
      onDownload={() => undefined}
    />
  );
  const commissionCard = (
    <CommissionCard
      commission={{
        state: "expected",
        amount: 4200,
        currency: "RM",
        type: "Flat fee per student",
        expectedFrom: 30,
        expectedTo: 60,
        notes: null,
      }}
      dueInDays={45}
    />
  );

  return (
    <ApplicationDetailsLayout
      header={
        <ApplicationHeader
          breadcrumbs={
            <Breadcrumbs
              items={[
                { label: "Applications", href: "#" },
                { label: "Nur Aisyah Binti Kamal" },
              ]}
            />
          }
          studentName="Nur Aisyah Binti Kamal"
          titleAs={embedded ? "h3" : "h1"}
          reference="UBX-2026-0412"
          stageId={STAGE?.stage?.id}
          actionNeeded
          daysInStage={9}
          institution="Sunway University"
          programme="Bachelor of Computer Science (Hons)"
          intake="2027-01-05"
          primaryAction={primaryAction}
          overflowActions={[
            { label: "Put on hold", icon: Clock, onClick: () => undefined },
            {
              label: "Contact Unibexs support",
              icon: Headset,
              onClick: () => undefined,
            },
            {
              label: "Withdraw application",
              icon: XCircle,
              onClick: () => setWithdrawOpen(true),
              destructive: true,
            },
          ]}
        />
      }
      alerts={
        <ApplicationAlerts
          alerts={[
            {
              id: "fix",
              tone: "warning",
              title: "Correction requested",
              body: "The academic transcript is not certified. Upload a certified true copy.",
            },
            {
              id: "fee",
              tone: "warning",
              title: "Tuition fee may be out of date",
              body: "Sunway University last updated its fees 94 days ago. Check the Knowledge Hub before quoting.",
            },
          ]}
        />
      }
      tracker={
        <ApplicationTrackerCard
          stage={STAGE}
          statusName="Correction requested"
          nextStep="Replace the academic transcript with a certified true copy."
        />
      }
      activeTab={tab}
      onTabChange={setTab}
      tabCounts={{ documents: 1 }}
      primaryAction={primaryAction}
      stickyAction={!embedded}
      panels={{
        overview: (
          <OverviewGrid
            main={
              <>
                <ApplicationSummaryCard
                  programme="Bachelor of Computer Science (Hons)"
                  institution="Sunway University"
                  qualificationLevel="Bachelor's degree"
                  intake="2027-01-05"
                  durationMonths={36}
                  tuition={{ amount: 31000, currency: "RM" }}
                  submittedAt="2026-06-14T11:00:00+08:00"
                  advisorName="Farid Hakimi"
                />
                <DocumentChecklist
                  documents={DOCUMENTS}
                  limit={4}
                  onViewAll={() => setTab("documents")}
                  onDownload={() => undefined}
                  onReplace={() => undefined}
                />
                {offerCard}
              </>
            }
            aside={
              <>
                <StudentInfoCard
                  email="nur.aisyah@mail.com"
                  phone="+60 12 345 6789"
                  nationality="Malaysia"
                  passportNumber="A12345678"
                  birthday="2006-03-18"
                  gender="Female"
                  address="Jalan SS 15/4, Subang Jaya, Selangor"
                  whatsappUrl="https://wa.me/60123456789"
                />
                {commissionCard}
                <NotesPanel
                  notes={notes}
                  now={NOW}
                  onAdd={(body) =>
                    setNotes((n) => [
                      {
                        id: `n${n.length + 1}`,
                        author: "You",
                        body,
                        at: new Date().toISOString(),
                      },
                      ...n,
                    ])
                  }
                />
              </>
            }
          />
        ),
        documents: (
          <div className="grid gap-4 md:gap-6">
            <DocumentChecklist
              documents={DOCUMENTS}
              title="Student documents"
              onDownload={() => undefined}
              onReplace={() => undefined}
              uploadProgress={{}}
            />
            <StudentBackgroundCard
              education={[
                {
                  id: "e",
                  institution: "SMK Seksyen 9 Shah Alam",
                  qualification: "SPM",
                  grade: "8A 1B",
                  endDate: "2023-12-01",
                },
              ]}
              englishTests={[
                { id: "t", test: "MUET", score: "Band 4", date: "2026-03-15" },
              ]}
              emergencyContacts={[
                {
                  id: "c",
                  name: "Kamal Bin Hassan",
                  relation: "Father",
                  phone: "+60 13 222 4455",
                },
              ]}
            />
          </div>
        ),
        "offer-visa": (
          <TwoColumn>
            {offerCard}
            <VisaStatusCard
              steps={[
                { id: "fee", label: "Visa fee", document: null },
                { id: "eval", label: "EMGS evaluation (eVAL)", document: null },
                {
                  id: "approval",
                  label: "Visa approval letter",
                  document: null,
                },
              ]}
            />
          </TwoColumn>
        ),
        commission: commissionCard,
        activity: (
          <ActivityTimeline events={EVENTS} total={EVENTS.length} now={NOW} />
        ),
      }}
    >
      <WithdrawApplicationDialog
        open={withdrawOpen}
        onClose={() => setWithdrawOpen(false)}
        onConfirm={() => setWithdrawOpen(false)}
      />
    </ApplicationDetailsLayout>
  );
}

/** Full-page route: back link, theme switcher and the preview on the canvas. */
export default function ApplicationDetailsPattern() {
  return (
    <div className="ub-canvas-light min-h-screen">
      <div className="mx-auto flex max-w-ub-dashboard items-center justify-between gap-4 px-4 py-4 md:px-6">
        <Link
          href="/design-system#content"
          className="inline-flex items-center gap-2 text-ub-label-md text-ub-text-link hover:underline"
        >
          <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden="true" />
          Design system
        </Link>
        <ThemeSwitcher className="hidden w-64 md:grid" />
      </div>
      <main className="px-4 pb-10 md:px-6">
        <ApplicationDetailsPreview />
      </main>
    </div>
  );
}

/** Style guide demo: the whole page inside the gallery, with a link to open it full size. */
export function ApplicationDetailsDemo() {
  return (
    <Demo
      name="Application Details"
      path="features/applications/components"
      description="The Student profile / Application Details page (brief §6) built only from the feature components, with mock data. Header with one Primary action, alerts, tracker, then Overview · Documents · Offer & visa · Commission · Activity. The tabs work; the Withdraw dialog opens from the overflow menu."
      code={`<ApplicationDetailsLayout
  header={<ApplicationHeader studentName="Nur Aisyah Binti Kamal" reference="UBX-2026-0412" stageId="institution-review" primaryAction={next} />}
  alerts={<ApplicationAlerts alerts={alerts} />}
  tracker={<ApplicationTrackerCard stage={resolveStage(stageInput)} nextStep={view.nextStep} />}
  activeTab={tab}
  onTabChange={setTab}
  panels={{ overview, documents, "offer-visa": offerVisa, commission, activity }}
  primaryAction={next}
/>`}
    >
      <div className="mb-4 flex justify-end">
        <Link
          href="/design-system/patterns/application-details"
          className="inline-flex items-center gap-1.5 text-ub-label-md text-ub-text-link hover:underline"
        >
          Open full page
          <ExternalLink
            className="h-4 w-4 rtl:-scale-x-100"
            aria-hidden="true"
          />
        </Link>
      </div>
      <div className="ub-canvas-light overflow-hidden rounded-ub-xl p-4 md:p-6">
        <ApplicationDetailsPreview embedded />
      </div>
    </Demo>
  );
}
