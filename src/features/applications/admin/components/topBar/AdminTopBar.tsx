"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Clock, RefreshCw } from "lucide-react";
import HoldPopup from "features/applications/admin/components/popups/Hold";
import UpdateStatus from "features/applications/admin/components/popups/UpdateStatus";

interface Props {
  application: any;
  onRefetch?: () => void;
}

export default function AdminTopBar({ application, onRefetch }: Props) {
  const router = useRouter();

  const [showHoldPopup, setShowHoldPopup] = useState(false);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);

  const studentName = application?.student?.name ?? "Application";

  const handleConfirmUpdate = () => {
    setShowUpdatePopup(false);
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
          <button
            onClick={() => setShowHoldPopup(true)}
            className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition-all hover:border-amber-300 hover:bg-amber-100"
          >
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Hold</span>
          </button>

          <button
            onClick={() => setShowUpdatePopup(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-blue-700"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Update Status</span>
          </button>
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
