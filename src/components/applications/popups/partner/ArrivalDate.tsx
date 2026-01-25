"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Plane, Upload, Trash2, CheckCircle } from 'lucide-react';
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import api from "../../../../lib/useApi";
import { useToast } from "../../../context/ToastContext";
import { InputField } from "components/form";


interface ArrivalDateConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: string;
}

export default function ArrivalDateConfirmation({
                                                  isOpen,
                                                  onClose,
                                                  applicationId,
                                                }: ArrivalDateConfirmationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [arrivalDate, setArrivalDate] = useState<string>("");
  const [ticketFile, setTicketFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();

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
    if (!formData.arrival_date) {
      showToast("Please select an arrival date", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      let ticketData = null;
      if (ticketFile) {
        showToast("Uploading travel ticket...", "info");

        const presigned = await getPresignedUploads([ticketFile], "travel_ticket");
        const results = await uploadFilesToSpaces([ticketFile], presigned);
        const uploaded = results?.[0];

        if (!uploaded?.file_key || !uploaded?.public_url) {
          throw new Error("Travel ticket upload failed");
        }

        ticketData = {
          ticket_file_key: uploaded.file_key,
          ticket_file_url: uploaded.public_url,
        };
      }

      await api.patch(`/applications/${applicationId}/arrival-date`, {
        arrival_date: formData.arrival_date,
        ...ticketData,
      });

      showToast("Arrival date submitted successfully", "success");
      setTimeout(() => window.location.reload(), 2000);
      handleClose();
    } catch (err) {
      console.error(err);
      showToast("Failed to submit arrival date", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ arrival_date: "" });
    setTicketFile(null);
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
                <div className="flex h-12 w-12 items-center justify-center rounded-full border border-blue-200 bg-gradient-to-br from-blue-50 to-blue-50">
                  <Plane className="h-6 w-6 text-blue-600" strokeWidth={2.5} />
                </div>
                <div>
                  <h5 className="text-h4 font-bold text-gray-900 sm:text-lg">
                    Confirm Arrival Date
                  </h5>
                  <p className="mt-1 text-caption text-text-muted">
                    Select your planned arrival date and upload your travel ticket.
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close dialog"
                className="group flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition-all duration-200 hover:bg-gray-100 hover:text-gray-600"
              >
                <XCircle className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>
          </div>

          <div className="max-h-[65vh] space-y-6 overflow-y-auto px-6 py-5">

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

            <div className="space-y-2">
              <label className="block font-medium text-gray-900">Travel Ticket</label>
              <label
                htmlFor="ticket_file"
                className="flex cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 text-center transition hover:border-blue-500 hover:bg-blue-50/30"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Upload className="h-6 w-6" />
                </div>
                <p className="font-medium text-gray-900">Upload Travel Ticket</p>
                <p className="mt-1 text-xs text-gray-500">PDF, JPG, PNG — Max 5MB</p>
                <input
                  id="ticket_file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  disabled={isSubmitting}
                  onChange={(e) => setTicketFile(e.target.files?.[0] || null)}
                />
              </label>

              {ticketFile && (
                <div className="flex items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2">
                  <span className="truncate text-sm text-text-muted">{ticketFile.name}</span>
                  <button
                    type="button"
                    onClick={() => setTicketFile(null)}
                    className="flex items-center justify-center gap-2 rounded-full border border-red-600 text-red-600  px-4 py-2 text-sm font-medium transition hover:border-red-700 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 px-6 py-4">
            <div className="flex justify-end gap-3">
              <button
                onClick={handleClose}
                className="flex items-center justify-center gap-2 rounded-full border border-gray-600 text-gray-600  px-4 py-2 text-sm font-medium transition hover:border-gray-700 hover:text-gray-700 disabled:opacity-50"
              >
                <XCircle className="h-4 w-4" />
                Cancel
              </button>
              <button
                disabled={!formData.arrival_date || isSubmitting}
                onClick={handleConfirm}
                className="flex items-center justify-center gap-2 rounded-full border border-blue-600 bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium transition hover:border-blue-700 hover:bg-blue-200 disabled:opacity-50"
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
