"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { Clock, FilePlus2, RefreshCw } from "lucide-react";
import HoldPopup from "features/applications/account-manager/components/popups/Hold";
import UpdateStatus from "features/applications/account-manager/components/popups/UpdateStatus";
import UpdateCorrectionRequest from "features/applications/shared/UpdateCorrectionRequest";
import { useApplicationActions } from "features/applications/hooks";
import { useManagerReuploadDocument } from "features/applications/hooks/files/useManagerReuploadDocument";
import ApplicationDetailsScreen from "features/applications/details/ApplicationDetailsScreen";
import type { DocumentItem } from "features/applications/model/applicationView";
import { ALLOWED_FILE_TYPES } from "services/uploadService";
import ApplicationCommission from "./ApplicationCommission";

interface ApplicationDetailsProps {
  application: any;
  onRefetch?: () => void;
}

/**
 * Account manager view: Update status is the Primary action; Hold and the
 * correction request sit in the overflow menu; files the backend flags with
 * can_manager_reupload can be replaced from the document rows.
 */
export default function ApplicationDetails({ application, onRefetch }: ApplicationDetailsProps) {
  const [showHold, setShowHold] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  const { actions, refetch: refetchActions } = useApplicationActions(application?.id);
  const { reuploadDocument } = useManagerReuploadDocument();
  const fileInput = useRef<HTMLInputElement>(null);
  const [replaceTarget, setReplaceTarget] = useState<string | null>(null);

  const refresh = () => {
    refetchActions();
    onRefetch?.();
  };

  const startReplace = (doc: DocumentItem) => {
    setReplaceTarget(doc.id);
    fileInput.current?.click();
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !replaceTarget) return;
    try {
      await reuploadDocument(file, application.id, replaceTarget);
      onRefetch?.();
    } catch (err) {
      console.error("Re-upload failed:", err);
    } finally {
      setReplaceTarget(null);
    }
  };

  return (
    <ApplicationDetailsScreen
      application={application}
      viewer="3"
      backHref="/account-manager/applications"
      correctionReason={actions?.correction_reason}
      primaryAction={{ label: "Update status", icon: RefreshCw, onClick: () => setShowUpdate(true) }}
      overflowActions={[
        ...(actions?.can_update_correction_request ? [{ label: "Update correction request", icon: FilePlus2, onClick: () => setShowCorrection(true) }] : []),
        { label: "Put on hold", icon: Clock, onClick: () => setShowHold(true) },
      ]}
      onReplaceDocument={startReplace}
      commissionDetail={<ApplicationCommission application={application} />}
    >
      <input ref={fileInput} type="file" accept={ALLOWED_FILE_TYPES.extensions.join(",")} className="hidden" onChange={onFile} aria-hidden="true" tabIndex={-1} />
      <HoldPopup
        isOpen={showHold}
        onClose={() => setShowHold(false)}
        onConfirm={() => setShowHold(false)}
        applicationId={application?.id}
        currentStatus={application?.lifecycle_status}
        onRefetch={onRefetch}
      />
      {actions && showCorrection && (
        <UpdateCorrectionRequest
          isOpen={showCorrection}
          onClose={() => setShowCorrection(false)}
          applicationId={application.id}
          statusName={actions.status}
          currentReason={actions.correction_reason}
          documentTypes={actions.document_types ?? []}
          onUpdated={refresh}
        />
      )}
      {application && showUpdate && (
        <UpdateStatus
          isOpen={showUpdate}
          onClose={() => setShowUpdate(false)}
          onConfirm={() => {
            setShowUpdate(false);
            refresh();
          }}
          application={application}
        />
      )}
    </ApplicationDetailsScreen>
  );
}
