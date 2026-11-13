"use client";

// Page-level container for Application Details, shared by the Advisor,
// account manager and admin routes. It owns the data hooks (visa case,
// activity feed, downloads) and composes the Layer B components; each role
// passes only what differs: its Primary action, overflow menu, extra panels
// and dialogs.

import { useMemo, useState, type ReactNode } from "react";
import { Headset } from "lucide-react";
import Breadcrumbs from "components/ub/navigation/links/Breadcrumbs";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { useVisaCase } from "hooks/useVisaCase";
import { useApplicationTimeline } from "features/applications/hooks";
import { toApplicationView, isTemplate, type DocumentItem, type ViewerActor } from "features/applications/model/applicationView";
import { toTimelineEvents } from "features/applications/model/activity";
import type { ApplicationDetailsTab } from "features/applications/shared/applicationDetailTabs";
import {
  ActivityTimeline,
  ApplicationAlerts,
  ApplicationDetailsLayout,
  ApplicationHeader,
  ApplicationSummaryCard,
  ApplicationTrackerCard,
  CommissionCard,
  DocumentChecklist,
  OfferCard,
  OverviewGrid,
  StudentBackgroundCard,
  StudentInfoCard,
  TwoColumn,
  VisaStatusCard,
  buildApplicationAlerts,
  offerStatusOf,
} from "features/applications/components";
import type { HeaderAction, OverflowAction } from "features/applications/components/ApplicationHeader";
import { usePageTitle } from "components/ub/navigation/layout/pageTitle";


/** Unibexs' official Respond.io support line, the same for every role. */
export const SUPPORT_WHATSAPP_URL = "https://wa.me/601172591101";

/** wa.me link for a phone number, or null when it has no digits. */
export const whatsappLink = (phone: string | null) => {
  const digits = phone?.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
};

export interface ApplicationDetailsScreenProps {
  application: any;
  viewer: ViewerActor;
  /** List page for the breadcrumb, e.g. "/admin/applications". */
  backHref: string;
  primaryAction?: HeaderAction | null;
  overflowActions?: OverflowAction[];
  /** Correction/rejection reason from the actions payload, shown as an alert. */
  correctionReason?: string | null;
  /** Shows the "Action needed" flag on the stage tag. */
  actionNeeded?: boolean;
  /** Top of the Overview main column, e.g. the Advisor's next-step panel. */
  nextStepPanel?: ReactNode;
  /** After the document checklists, e.g. the Advisor's offer-letter forms. */
  documentsExtra?: ReactNode;
  /** After the offer and visa cards. */
  offerVisaExtra?: ReactNode;
  /** Commission tab content (the role's CommissionCard with actions, pay-in, payout, dispute); defaults to the plain card. */
  commissionDetail?: ReactNode;
  /** Replace action on documents that need replacing (roles allowed to upload). */
  onReplaceDocument?: (doc: DocumentItem) => void;
  /** Dialogs and popups. */
  children?: ReactNode;
}

export default function ApplicationDetailsScreen({
  application,
  viewer,
  backHref,
  primaryAction = null,
  overflowActions = [],
  correctionReason,
  actionNeeded,
  nextStepPanel,
  documentsExtra,
  offerVisaExtra,
  commissionDetail,
  onReplaceDocument,
  children,
}: ApplicationDetailsScreenProps) {
  const [tab, setTab] = useState<ApplicationDetailsTab>("overview");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { showToast } = useToast();
  const view = useMemo(() => toApplicationView(application, viewer), [application, viewer]);
  usePageTitle(view.student.name);
  const { visaCase } = useVisaCase(application?.id || "");
  const timeline = useApplicationTimeline(application?.id, application?.updated_at);
  const events = useMemo(() => toTimelineEvents(timeline.items, { forAdvisor: viewer === "2" }), [timeline.items, viewer]);

  const download = async (doc: DocumentItem) => {
    if (!doc.fileKey || downloadingId) return;
    try {
      setDownloadingId(doc.id);
      window.open(await getDocumentDownloadUrl(doc.fileKey), "_blank", "noopener");
    } catch {
      showToast(`Couldn't download ${doc.name}. Try again.`, "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const studentDocs = view.documents.filter((d) => !isTemplate(d));
  // Templates are files to download, not submissions, so they never read "Verified".
  const templates = view.documents.filter(isTemplate).map((d) => ({ ...d, state: "uploaded" as const, stateLabel: "To download" }));
  const offerVisaDocs = [view.offerLetter, view.visa.evaluation, view.visa.visaLetter].filter(Boolean) as DocumentItem[];
  const replaceCount = studentDocs.filter((d) => d.state === "needs-replacing").length;
  const resolved = view.stage.resolved;
  const visaFee = visaCase?.visa_fee_amount ? { amount: Number(visaCase.visa_fee_amount), currency: "RM" } : null;
  const offerStatus = offerStatusOf(view.stage.statusCode, !!view.offerLetter);
  const find = (re: RegExp) => view.documents.find((d) => re.test(d.name)) ?? null;
  const visaStepInputs = [
    { id: "fee", label: "Visa fee", document: find(/visa payment receipt/i) },
    { id: "eval", label: "EMGS evaluation (eVAL)", document: view.visa.evaluation },
    { id: "approval", label: "Visa approval letter", document: view.visa.visaLetter },
    ...(view.visa.eVisaRequired ? [{ id: "evisa", label: "e-Visa", document: find(/^e-?visa$/i) }] : []),
  ];

  const header = (
    <ApplicationHeader
      titleAs="h1"
      breadcrumbs={<Breadcrumbs items={[{ label: "Applications", href: backHref }, { label: view.student.name }]} />}
      studentName={view.student.name}
      photoUrl={view.student.photoUrl}
      reference={view.reference}
      stageId={resolved?.stage?.id}
      stageLabel={view.stage.apiName}
      actionNeeded={actionNeeded ?? resolved?.attention}
      institution={view.institution}
      programme={view.programme}
      intake={view.intake}
      primaryAction={primaryAction}
      overflowActions={[...overflowActions, { label: "Contact Unibexs support", icon: Headset, onClick: () => window.open(SUPPORT_WHATSAPP_URL, "_blank", "noopener") }]}
    />
  );

  const offerCard = <OfferCard status={offerStatus} offerLetter={view.offerLetter} visaFee={visaFee} visaFeeNote={visaCase?.notes} onDownload={download} downloadingId={downloadingId} />;
  const commissionCard = <CommissionCard commission={view.commission} />;

  const panels: Record<ApplicationDetailsTab, ReactNode> = {
    overview: (
      <OverviewGrid
        main={
          <>
            {nextStepPanel}
            <ApplicationSummaryCard
              programme={view.programme}
              institution={view.institution}
              qualificationLevel={view.qualificationLevel}
              intake={view.intake}
              durationMonths={view.durationMonths}
              tuition={view.tuition}
              submittedAt={view.submittedAt}
              advisorName={view.advisorName}
            />
            <DocumentChecklist documents={studentDocs} limit={4} onViewAll={() => setTab("documents")} onDownload={download} onReplace={onReplaceDocument} downloadingId={downloadingId} />
            {offerCard}
          </>
        }
        aside={
          <>
            <StudentInfoCard
              email={view.student.email}
              phone={view.student.phone}
              nationality={view.student.nationality}
              passportNumber={view.student.passportNumber}
              birthday={view.student.birthday}
              gender={view.student.gender}
              address={view.student.address}
              whatsappUrl={whatsappLink(view.student.phone)}
            />
            {commissionCard}
          </>
        }
      />
    ),
    documents: (
      <div className="grid gap-4 md:gap-6">
        <DocumentChecklist documents={studentDocs} title="Student documents" onDownload={download} onReplace={onReplaceDocument} downloadingId={downloadingId} />
        {offerVisaDocs.length > 0 && <DocumentChecklist documents={offerVisaDocs} title="Offer & visa" onDownload={download} onReplace={onReplaceDocument} downloadingId={downloadingId} />}
        {templates.length > 0 && <DocumentChecklist documents={templates} title="From the Unibexs system" description="Templates and invoices to download." onDownload={download} downloadingId={downloadingId} readOnly />}
        <StudentBackgroundCard education={view.student.education} englishTests={view.student.englishTests} emergencyContacts={view.student.emergencyContacts} />
        {documentsExtra}
      </div>
    ),
    "offer-visa": (
      <div className="grid gap-4 md:gap-6">
        <TwoColumn>
          {/* The visa fee sits with the visa steps here; the Overview keeps it on the Offer card. */}
          <OfferCard status={offerStatus} offerLetter={view.offerLetter} onDownload={download} downloadingId={downloadingId} />
          <VisaStatusCard steps={visaStepInputs} started={!!view.offerLetter || !!visaCase} visaFee={visaFee} visaFeeNote={visaCase?.notes} onDownload={download} downloadingId={downloadingId} />
        </TwoColumn>
        {offerVisaExtra}
      </div>
    ),
    commission: (
      <div className="grid gap-4 md:gap-6">
        {commissionDetail ?? commissionCard}
        {view.commissionDocuments.length > 0 && <DocumentChecklist documents={view.commissionDocuments} title="Commission documents" onDownload={download} downloadingId={downloadingId} readOnly />}
      </div>
    ),
    activity: (
      <ActivityTimeline
        events={events}
        total={timeline.total}
        loading={timeline.loading}
        error={timeline.error}
        unavailableMessage={timeline.errorCode === "application_inactive" ? "Activity is only available while the application is active." : null}
        onRetry={timeline.refetch}
        hasMore={timeline.hasMore}
        loadingMore={timeline.loadingMore}
        onLoadMore={timeline.loadMore}
      />
    ),
  };

  return (
    <ApplicationDetailsLayout
      header={header}
      alerts={<ApplicationAlerts alerts={buildApplicationAlerts(view, correctionReason)} />}
      tracker={(navigation) => <ApplicationTrackerCard stage={resolved} nextStep={view.nextStep} statusName={view.stage.statusName} navigation={navigation} />}
      activeTab={tab}
      onTabChange={setTab}
      tabCounts={{ documents: replaceCount }}
      panels={panels}
      primaryAction={primaryAction}
    >
      {children}
    </ApplicationDetailsLayout>
  );
}
