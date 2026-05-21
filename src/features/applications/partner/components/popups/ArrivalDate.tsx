"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Plane, CheckCircle, AlertCircle } from 'lucide-react';
import { InputField } from "components/form";
import StatusFileUpload from "components/form/filesUpload/StatusFileUpload";
import { useArrivalDateUpload } from "hooks/applications/files/useArrivalDateUpload";


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
  const [isVisible, setIsVisible] = useState(false);
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
  };

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
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

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg md:max-w-xl transform transition-all duration-300 ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white text-sm shadow-2xl ring-1 ring-black/5">

          <div className="relative border-b border-gray-200 px-6 pb-4 pt-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-md border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50">
                  <Plane className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="text-h4 font-bold text-gray-900 sm:text-lg">
                    Confirm Arrival Date
                  </h5>
                  <p className="mt-1 text-caption text-slate-500">
                    Select your planned arrival date and upload your travel ticket.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 items-center justify-center rounded-md text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-5">

            {(fileError || eVisaError) && (
              <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                <p className="text-sm text-red-700">{fileError || eVisaError}</p>
              </div>
            )}

            <div className="space-y-2">
              <InputField
                label="Arrival Date"
                field="arrival_date"
                type="date"
                required
                formData={formData}
                errors={formErrors}
                updateFormData={updateFormData}
              />
            </div>

            <StatusFileUpload
              label="Travel Ticket"
              description="Upload your flight ticket or booking confirmation"
              id="ticket_file"
              file={ticketFile}
              required
              onFileChange={setTicketFile}
              onRemove={() => setTicketFile(null)}
              onError={setFileError}
              disabled={isSubmitting}
            />

            <StatusFileUpload
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

          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="flex items-center justify-center gap-2 rounded-md border border-gray-600 text-gray-600  px-4 py-2 text-sm font-medium transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
              <button
                disabled={!formData.arrival_date || !ticketFile || !!fileError || !!eVisaError || isSubmitting}
                onClick={handleConfirm}
                className="flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium transition hover:border-blue-700 hover:bg-blue-200 disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                {isSubmitting ? "Submitting..." : "Confirm Arrival"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
