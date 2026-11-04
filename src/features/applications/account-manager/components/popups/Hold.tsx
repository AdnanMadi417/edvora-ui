"use client";

import React, { useState, useEffect } from "react";
import { XCircle, CheckCircle, Pause } from "lucide-react";

import api from "lib/useApi";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import Combobox from "components/ub/forms/selection/Combobox";
import Alert from "components/ub/feedback/notifications/Alert";
import FormModal from "components/ub/feedback/dialogs/FormModal";

interface HoldPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (status: string) => void;
  applicationId?: string;
  currentStatus?: string;
  onRefetch?: () => void;
}

const statusOptions = [
  { label: "Active", value: "1" },
  { label: "Hold", value: "2" },
  { label: "Cancel", value: "3" },
];

const statusMap: Record<string, string> = {
  "1": "active",
  "2": "hold",
  "3": "cancel",
};

export default function HoldPopup({
  isOpen,
  onClose,
  onConfirm,
  applicationId,
  currentStatus,
  onRefetch,
}: HoldPopupProps) {
  const [status, setStatus] = useState("1");
  const { showToast } = useToast();
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (isOpen) setStatus(currentStatus);
  }, [isOpen, currentStatus]);


  const handleConfirm = async () => {
    if (!applicationId) return;

    try {
      setIsConfirming(true);
      await api.patch(`/applications/${applicationId}/lifecycle-status`, {
        status: statusMap[status],
      });

      showToast("Application status updated.");
      onConfirm(statusMap[status]);
      onClose();
      onRefetch?.();
    } catch (error: any) {
      console.error("Failed to update lifecycle status", error);
      showToast("Failed to update application status.");
    } finally {
      setIsConfirming(false);
    }
  };
  const handleClose = () => {
    onClose();
  };

  return (
    <FormModal
      open={isOpen}
      onClose={handleClose}
      size="md"
      icon={Pause}
      title="Update Application Status"
      description="Select the desired lifecycle status."
      onSubmit={handleConfirm}
      submitLabel="Confirm"
      submitIcon={<CheckCircle className="h-4 w-4" aria-hidden="true" />}
      submitting={isConfirming}
      submitDisabled={status === currentStatus}
    >
      <div className="grid gap-4">
        <Alert tone="warning">This action will update the application's lifecycle status.</Alert>
        <p className="flex items-center gap-2 text-ub-label-md text-ub-text-secondary">
          {currentStatus === "1" && <CheckCircle className="h-4 w-4" aria-hidden="true" />}
          {currentStatus === "2" && <Pause className="h-4 w-4" aria-hidden="true" />}
          {currentStatus === "3" && <XCircle className="h-4 w-4" aria-hidden="true" />}
          <span>Application status: {statusMap[currentStatus || "1"]}</span>
        </p>
        <Combobox label="Lifecycle Status" options={statusOptions} value={status ?? null} onChange={(v) => setStatus(v ?? "")} required />
      </div>
    </FormModal>
  );
}
