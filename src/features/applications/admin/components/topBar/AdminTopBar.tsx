"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, FilePlus2, RefreshCw } from "lucide-react";
import HoldPopup from "features/applications/admin/components/popups/Hold";
import UpdateStatus from "features/applications/admin/components/popups/UpdateStatus";
import UpdateCorrectionRequest from "features/applications/shared/UpdateCorrectionRequest";
import { useApplicationActions } from "features/applications/hooks";
import Button from "components/ui/buttons/Button";

interface Props {
  application: any;
  onRefetch?: () => void;
}

export default function AdminTopBar({ application, onRefetch }: Props) {
  const router = useRouter();

  const [showHoldPopup, setShowHoldPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [showCorrectionPopup, setShowCorrectionPopup] = useState(false);

  // can_update_correction_request is computed by the backend from the same
  // rules the PATCH enforces — just read it, don't re-derive it here.
  const { actions, refetch: refetchActions } = useApplicationActions(application?.id);

  const studentName = application?.student?.name ?? "Application";

  const handleConfirmUpdate = () => {
    setShowUpdatePopup(false);
    refetchActions();
    onRefetch?.();
  };

  const handleCorrectionUpdated = () => {
    refetchActions();
    onRefetch?.();
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-6 py-3.5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-sm">
          <button
            onClick={() => router.push("/admin/applications")}
            className="flex items-center gap-1 text-slate-500 transition-colors hover:text-slate-800"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Applications</span>
          </button>
          <ChevronRight className="hidden h-3.5 w-3.5 text-slate-300 sm:block" />
          <span className="hidden max-w-[200px] truncate font-medium text-slate-800 sm:block">
            {studentName}
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {actions?.can_update_correction_request && (
            <Button
              onClick={() => setShowCorrectionPopup(true)}
              icon={<FilePlus2 className="h-4 w-4" />}
              text="Update Request"
              bgColor="bg-white"
              textColor="text-slate-700"
              borderColor="border-slate-200"
              hoverTextColor="hover:text-slate-700"
              hoverBorderColor="hover:border-slate-300"
              className="hover:bg-slate-50"
            />
          )}

          <Button
            onClick={() => setShowHoldPopup(true)}
            icon={<Clock className="h-4 w-4" />}
            text="Hold"
            bgColor="bg-amber-50"
            textColor="text-amber-700"
            borderColor="border-amber-200"
            hoverTextColor="hover:text-amber-700"
            hoverBorderColor="hover:border-amber-300"
            className="hover:bg-amber-100"
          />

          <Button
            onClick={() => setShowUpdatePopup(true)}
            icon={<RefreshCw className="h-4 w-4" />}
            text="Update Status"
            bgColor="bg-blue-600"
            textColor="text-white"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-white"
            hoverBorderColor="hover:border-blue-600"
            className="hover:bg-blue-700"
          />
        </div>
      </div>

      <HoldPopup
        isOpen={showHoldPopup}
        onClose={() => setShowHoldPopup(false)}
        onConfirm={() => setShowHoldPopup(false)}
        applicationId={application?.id}
        currentStatus={application?.lifecycle_status}
        onRefetch={onRefetch}
      />

      {actions && showCorrectionPopup && (
        <UpdateCorrectionRequest
          isOpen={showCorrectionPopup}
          onClose={() => setShowCorrectionPopup(false)}
          applicationId={application.id}
          statusName={actions.status}
          currentReason={actions.correction_reason}
          documentTypes={actions.document_types ?? []}
          onUpdated={handleCorrectionUpdated}
        />
      )}

      {application && showUpdatePopup && (
        <UpdateStatus
          isOpen={showUpdatePopup}
          onClose={() => setShowUpdatePopup(false)}
          onConfirm={handleConfirmUpdate}
          application={application}
        />
      )}
    </>
  );
}
