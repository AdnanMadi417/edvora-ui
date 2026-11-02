"use client";

import { useState } from "react";
import { Clock, FilePlus2, RefreshCw } from "lucide-react";
import HoldPopup from "features/applications/admin/components/popups/Hold";
import UpdateStatus from "features/applications/admin/components/popups/UpdateStatus";
import UpdateCorrectionRequest from "features/applications/shared/UpdateCorrectionRequest";
import { useApplicationActions } from "features/applications/hooks";
import ApplicationDetailsScreen from "features/applications/details/ApplicationDetailsScreen";
import ApplicationCommission from "./ApplicationCommission";

interface ApplicationDetailsProps {
  application: any;
  onRefetch?: () => void;
}

/** Admin view: Update status is the Primary action; Hold and the correction request sit in the overflow menu. */
export default function ApplicationDetails({ application, onRefetch }: ApplicationDetailsProps) {
  const [showHold, setShowHold] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [showCorrection, setShowCorrection] = useState(false);
  // can_update_correction_request is computed by the backend from the same
  // rules the PATCH enforces — just read it, don't re-derive it here.
  const { actions, refetch: refetchActions } = useApplicationActions(application?.id);

  const refresh = () => {
    refetchActions();
    onRefetch?.();
  };

  return (
    <ApplicationDetailsScreen
      application={application}
      viewer="3"
      backHref="/admin/applications"
      correctionReason={actions?.correction_reason}
      primaryAction={{ label: "Update status", icon: RefreshCw, onClick: () => setShowUpdate(true) }}
      overflowActions={[
        ...(actions?.can_update_correction_request ? [{ label: "Update correction request", icon: FilePlus2, onClick: () => setShowCorrection(true) }] : []),
        { label: "Put on hold", icon: Clock, onClick: () => setShowHold(true) },
      ]}
      commissionDetail={<ApplicationCommission application={application} onRefetch={onRefetch} />}
    >
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
