"use client";

import { useState } from "react";
import { CheckCircle2, ClipboardCheck, CreditCard, FileUp, Plane, Upload, type LucideIcon } from "lucide-react";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { getDocumentDownloadUrl } from "services/documentService";
import { submitOfferLetterDecision } from "services/offerLetterService";
import { parseApiError } from "utils/parseApiError";
import { useApplicationActions } from "features/applications/hooks";
import { usePartnerProfile } from "features/partners/hooks/profile/usePartnerProfile";
import { useHealthDeclarationFormDownload } from "features/applications/shared/useHealthDeclarationFormDownload";
import { useVisaPaymentMethods } from "hooks/usePaymentMethods";
import { useVisaCase } from "hooks/useVisaCase";
import ApplicationDetailsScreen from "features/applications/details/ApplicationDetailsScreen";
import type { HeaderAction } from "features/applications/components/ApplicationHeader";
import RequiredAction from "features/applications/partner/components/popups/RequiredAction";
import ProgramDecision from "features/applications/partner/components/popups/ProgramDecision";
import VisaPaymentConfirmation from "features/applications/partner/components/popups/VisaPaymentConfirmation";
import ArrivalDate from "features/applications/partner/components/popups/ArrivalDate";
import EmgsEvalUpload from "features/applications/partner/components/popups/EmgsEvaluationUpload";
import EVisaUpload from "features/applications/partner/components/popups/EVisaUpload";
import ApplicationCommission from "./ApplicationCommission";
import ApplicationFormsSection from "./ApplicationFormsSection";
import MDACSection from "./MDACSection";
import PartnerNextStepPanel, { type TemplateFile } from "./PartnerNextStepPanel";
import { REJECTED_FORM_CONFIG } from "./rejectedForms";
import { partnerNextAction, VISA_PAYMENT_CODES, type PartnerActionKey } from "./partnerNextAction";

interface ApplicationDetailsProps {
  application: any;
  onRefetch?: () => Promise<void>;
}

// correction_reason sticks around on the actions payload from whichever
// status last set it -- only show it while the application is actually
// sitting in a rejected status, not after it's moved on.
const REJECTED_STATUS_CODES = new Set([
  "PAYMENT_REJECTED",
  "APPLICATION_FORM_REJECTED",
  "APPLICATION_FORM_2_REJECTED",
  "HEALTH_DECLARATION_REJECTED",
  "SIGNED_OFFER_LETTER_REJECTED",
  "ENGLISH_FORM_REJECTED",
]);

type Popup = "required" | "program" | "visa-payment" | "arrival" | "emgs" | "evisa" | "reupload" | null;

/** Advisor view: the next action is the Primary button; the step's details sit above the summary. */
export default function ApplicationDetails({ application, onRefetch }: ApplicationDetailsProps) {
  const { actions, refetch: refetchActions } = useApplicationActions(application?.id);
  const { showToast } = useToast();
  const [popup, setPopup] = useState<Popup>(null);
  const [accepting, setAccepting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const { download: downloadHealthDeclaration, downloading: downloadingHealth } = useHealthDeclarationFormDownload();
  const { methods, loading: paymentLoading } = useVisaPaymentMethods(application?.id);
  const { visaCase } = useVisaCase(application?.id || "");

  // An agency admin viewing one of their members' applications (D8): read
  // only, the member does the uploads and forms. Commission confirm/dispute
  // stays available -- those are the agency admin's to do.
  const { partner: viewer } = usePartnerProfile();
  const ownerId: string | undefined = application?.partner?.id;
  const isTeamView = !!viewer?.id && !!ownerId && ownerId !== viewer.id;

  const refresh = async () => {
    await onRefetch?.();
    refetchActions();
  };
  const close = () => setPopup(null);

  const statusCode: string | undefined = actions?.status_code || application?.status_code || application?.stage?.statuses?.[0]?.code;
  const rejectedForm = statusCode ? REJECTED_FORM_CONFIG[statusCode] : undefined;
  const hasRequiredDocs = !!actions?.document_types?.some((d: any) => d.is_required_for_current_upload);
  const correctionReason = statusCode && REJECTED_STATUS_CODES.has(statusCode) ? actions?.correction_reason : undefined;

  const key = partnerNextAction({
    statusCode,
    readOnly: isTeamView,
    hasActions: !!actions,
    hasRequiredDocs,
    hasDocumentTypes: !!actions?.document_types?.length,
    hasOfferLetter: !!application?.offer_letter_document,
    isRejectedForm: !!rejectedForm,
  });

  const acceptOffer = async () => {
    if (!application?.id || accepting) return;
    try {
      setAccepting(true);
      await submitOfferLetterDecision(application.id, { decision: "accept", notes: "" });
      showToast("Offer accepted.", "success");
      await refresh();
    } catch (err: unknown) {
      showToast(parseApiError(err, "Couldn't accept the offer. Try again."), "error");
    } finally {
      setAccepting(false);
    }
  };

  const ACTIONS: Record<PartnerActionKey, { label: string; icon: LucideIcon; run: () => void }> = {
    "reupload-form": { label: `Re-upload ${rejectedForm?.label ?? "form"}`, icon: FileUp, run: () => setPopup("reupload") },
    "required-docs": { label: "Upload required documents", icon: Upload, run: () => setPopup("required") },
    "arrival-form": { label: "Upload arrival form", icon: Upload, run: () => setPopup("required") },
    "program-decision": { label: "Submit programme decision", icon: ClipboardCheck, run: () => setPopup("program") },
    "visa-payment": { label: "Pay visa fee", icon: CreditCard, run: () => setPopup("visa-payment") },
    "accept-offer": { label: "Accept offer", icon: CheckCircle2, run: acceptOffer },
    "confirm-arrival": { label: "Confirm arrival", icon: Plane, run: () => setPopup("arrival") },
    evisa: { label: "Upload e-Visa", icon: FileUp, run: () => setPopup("evisa") },
    "payment-proof": { label: "Upload payment proof", icon: FileUp, run: () => setPopup("required") },
    emgs: { label: "Upload EMGS evaluation", icon: FileUp, run: () => setPopup("emgs") },
  };
  const primaryAction: HeaderAction | null = key ? { label: ACTIONS[key].label, icon: ACTIONS[key].icon, onClick: ACTIONS[key].run, loading: key === "accept-offer" && accepting } : null;

  const downloadFile = async (fileKey: string) => {
    if (downloading) return;
    try {
      setDownloading(true);
      window.open(await getDocumentDownloadUrl(fileKey), "_blank", "noopener");
    } catch {
      showToast("Couldn't download the template. Try again.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const docKey = (name: string) => application?.documents?.find((d: any) => d.document_type === name)?.file_key ?? null;
  const formHint = "Download, complete, and re-upload when your account manager asks.";
  const candidates: (TemplateFile | false | undefined)[] = [
    { key: "visa-invoice", name: "Visa invoice", hint: "Invoice for the visa payment. Keep it for your records.", fileKey: docKey("Visa Invoice") },
    actions?.is_application_form_required && { key: "app-form", name: "Application form template", hint: formHint, fileKey: docKey("Application Form Template") },
    actions?.is_application_form_2_required && { key: "app-form-2", name: "Application form 2 template", hint: formHint, fileKey: docKey("Application Form 2 Template") },
    actions?.is_english_form_required && { key: "english-form", name: "English form template", hint: formHint, fileKey: docKey("English Form Template") },
    actions?.is_health_declaration_form_required && { key: "health", name: "Health declaration form", hint: "Required for visa processing (Lampiran B).", onDownload: downloadHealthDeclaration },
    actions?.is_signed_offer_letter_required && { key: "offer-sign", name: "Offer letter (to sign)", hint: "Download, sign, and upload the signed copy with your payment.", fileKey: application?.offer_letter_document?.file_key },
  ];
  const paymentTemplates = candidates.filter((t): t is TemplateFile => !!t && (!!t.fileKey || !!t.onDownload));
  const arrivalTemplate = application?.arrival_documents?.find((d: any) => d.document_type === "Arrival Form Template");

  const panelMode = isTeamView
    ? "team-view"
    : key === "arrival-form"
      ? "arrival-form"
      : statusCode && VISA_PAYMENT_CODES.has(statusCode)
        ? "visa-payment"
        : key === "emgs"
          ? "emgs"
          : null;

  return (
    <ApplicationDetailsScreen
      application={application}
      viewer="2"
      backHref="/partner/applications"
      primaryAction={primaryAction}
      correctionReason={correctionReason}
      actionNeeded={!!key}
      nextStepPanel={
        <PartnerNextStepPanel
          mode={panelMode}
          ownerName={application?.partner?.name}
          visaFeeAmount={visaCase?.visa_fee_amount ? Number(visaCase.visa_fee_amount) : null}
          visaFeeNote={visaCase?.notes}
          paymentMethods={methods}
          paymentMethodsLoading={paymentLoading}
          templates={panelMode === "arrival-form" ? (arrivalTemplate?.file_key ? [{ key: "arrival", name: "Arrival form template", hint: "Provided by your account manager.", fileKey: arrivalTemplate.file_key }] : []) : paymentTemplates}
          onDownloadFile={downloadFile}
          downloading={downloading || downloadingHealth}
        />
      }
      documentsExtra={<ApplicationFormsSection application={application} actions={actions} onRefetch={refresh} readOnly={isTeamView} />}
      offerVisaExtra={<MDACSection />}
      commissionDetail={<ApplicationCommission application={application} actions={actions} onRefetch={refresh} />}
    >
      {popup === "required" && <RequiredAction isOpen onClose={close} applicationId={application.id} onRefetch={refresh} />}
      {popup === "arrival" && <ArrivalDate isOpen onClose={close} applicationId={application.id} onRefetch={refresh} />}
      {popup === "emgs" && <EmgsEvalUpload isOpen onClose={close} applicationId={application.id} onRefetch={refresh} />}
      {popup === "evisa" && <EVisaUpload isOpen onClose={close} applicationId={application.id} onRefetch={refresh} />}
      {popup === "visa-payment" && <VisaPaymentConfirmation isOpen onClose={close} applicationId={application.id} actions={actions} onRefetch={refresh} />}
      {popup === "program" && (
        <ProgramDecision
          isOpen
          onClose={close}
          applicationId={application.id}
          universityId={application.program?.university?.id || ""}
          correctionReason={actions?.correction_reason ?? undefined}
          onRefetch={refresh}
        />
      )}
      {popup === "reupload" && rejectedForm && (
        <rejectedForm.Popup
          isOpen
          onClose={close}
          applicationId={application.id}
          correctionReason={actions?.correction_reason}
          onRefetch={() => {
            close();
            refresh();
          }}
        />
      )}
    </ApplicationDetailsScreen>
  );
}
