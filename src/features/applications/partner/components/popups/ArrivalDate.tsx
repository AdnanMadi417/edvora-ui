"use client";

import Alert from "components/ub/feedback/notifications/Alert";
import Input from "components/ub/forms/text/Input";
import FormModal from "components/ub/feedback/dialogs/FormModal";
import React, { useState, useEffect } from "react";
import { XCircle, Plane, CheckCircle, AlertCircle } from 'lucide-react';
import DocumentUpload from "components/ub/forms/uploads/DocumentUpload";
import { useArrivalDateUpload } from "features/applications/hooks";


interface ArrivalDateConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
  onRefetch?: () => void;
}

export default function ArrivalDateConfirmation({
                                                  isOpen,
                                                  onClose,
                                                  applicationId,
                                                  onRefetch,
                                                }: ArrivalDateConfirmationProps) {
  const [arrivalDate, setArrivalDate] = useState<string>("");
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [eVisaFile, setEVisaFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [eVisaError, setEVisaError] = useState("");
  const { submitArrivalDate, isSubmitting } = useArrivalDateUpload();

  const [formData, setFormData] = useState({
    arrival_date: "",
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateDate = (): boolean => {
    const val = formData.arrival_date;
    if (!val) { setFormErrors({ arrival_date: "Arrival date is required" }); return false; }
    const selected = new Date(val);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) { setFormErrors({ arrival_date: "Arrival date cannot be in the past" }); return false; }
    setFormErrors({});
    return true;
  };

  const handleConfirm = async () => {
    if (!validateDate()) return;
    try {
      await submitArrivalDate(applicationId, formData.arrival_date, ticketFile, eVisaFile);
      handleClose();
      onRefetch?.();
    } catch {
      // error handled inside hook
    }
  };

  const handleClose = () => {
    setFormData({ arrival_date: "" });
    setTicketFile(null);
    setEVisaFile(null);
    setFileError("");
    setEVisaError("");
    onClose();
  };


  return (
    <FormModal
      open={isOpen}
      onClose={handleClose}
      size="md"
      icon={Plane}
      title="Confirm arrival date"
      description="Select your planned arrival date and upload your travel ticket."
      onSubmit={handleConfirm}
      submitLabel="Confirm arrival"
      submitting={isSubmitting}
      submitDisabled={!formData.arrival_date || !ticketFile || !!fileError || !!eVisaError}
    >
      <div className="grid gap-4">

          <div className="space-y-6">

            {(fileError || eVisaError) && (
              <Alert tone="danger">{fileError || eVisaError}</Alert>
            )}

            <div className="space-y-2">
              <Input label="Arrival date" type="date" onBlur={() => {
                  const val = formData.arrival_date;
                  if (!val) return;
                  const selected = new Date(val);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  if (selected < today)
                    setFormErrors({ arrival_date: "Arrival date cannot be in the past" });
                }} value={String(formData.arrival_date ?? "")} onChange={(v) => updateFormData("arrival_date", v)} error={formErrors.arrival_date || undefined} required />
            </div>

            <DocumentUpload
              label="Travel ticket"
              description="Upload your flight ticket or booking confirmation"
              id="ticket_file"
              file={ticketFile}
              required
              onFileChange={setTicketFile}
              onRemove={() => setTicketFile(null)}
              onError={setFileError}
              disabled={isSubmitting}
            />

            <DocumentUpload
              label="E-Visa Document (if required)"
              description="Upload your e-visa if entry requires one — check with immigration before travelling"
              id="e_visa_file"
              file={eVisaFile}
              onFileChange={setEVisaFile}
              onRemove={() => setEVisaFile(null)}
              onError={setEVisaError}
              disabled={isSubmitting}
            />
          </div>
      </div>
    </FormModal>
  );
}
