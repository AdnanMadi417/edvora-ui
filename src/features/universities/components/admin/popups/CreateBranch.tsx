"use client";

import React, { useState, useEffect } from "react";
import { XCircle, GitBranch } from "lucide-react";
import { useToast } from "components/ub/feedback/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import { useCreateBranch } from "features/universities/hooks";
import { useStates } from "features/programs/hooks/useStates";
import ModalHeader from "components/ub/feedback/ModalHeader";
import Button from "components/ub/core/Button";
import InputField from "components/ub/forms/InputField";
import SelectField from "components/ub/forms/SelectField";

interface CreateBranchProps {
  isOpen: boolean;
  onClose: () => void;
  universityId: string;
  onSuccess?: () => void;
}

export default function CreateBranch({ isOpen, onClose, universityId, onSuccess }: CreateBranchProps) {
  const { createBranch, branchLoading } = useCreateBranch();
  const { states } = useStates();
  const { showToast } = useToast();

  const stateOptions = states?.map((c) => ({ value: String(c.id), label: c.name })) || [];

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ name: "", location: "", state_id: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleApiError = useApiFormErrors({
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) => showToast(`Failed to create branch. ${message}`, "error"),
  });

  const isFormValid = formData.name.trim() && formData.location.trim() && formData.state_id;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData({ name: "", location: "", state_id: "" });
      setErrors({});
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCreate = async () => {
    try {
      const newBranch = await createBranch(universityId, formData);
      showToast("Branch created successfully.", "success");
      onClose();
      onSuccess?.();
      return newBranch;
    } catch (error: unknown) {
      handleApiError(error, "Please try again.");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"}`} onClick={(e) => e.stopPropagation()}>
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader title="Create New Branch" description="Add a new branch to this university." icon={GitBranch} iconBg="bg-blue-50" iconColor="text-blue-600" iconBorder="border-blue-200" titleColor="text-gray-900" onClose={onClose} />
          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
            <InputField label="Branch Name" field="name" placeholder="e.g. Main Campus" required formData={formData} errors={errors} updateFormData={updateFormData} />
            <InputField label="Location" field="location" placeholder="e.g. Kuala Lumpur" required formData={formData} errors={errors} updateFormData={updateFormData} />
            <SelectField label="State" field="state_id" required options={stateOptions} formData={formData} errors={errors} updateFormData={updateFormData} />
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button onClick={onClose} disabled={branchLoading} icon={<XCircle className="h-5 w-5" />} text={branchLoading ? "Cancelling..." : "Cancel"} bgColor="bg-slate-50" textColor="text-slate-700" borderColor="border-slate-600" hoverTextColor="hover:text-slate-800" hoverBorderColor="hover:border-slate-700" />
            <Button onClick={handleCreate} disabled={branchLoading || !isFormValid} icon={<GitBranch className="h-5 w-5" />} text={branchLoading ? "Creating..." : "Create Branch"} bgColor="bg-blue-50" textColor="text-blue-700" borderColor="border-blue-600" hoverTextColor="hover:text-blue-800" hoverBorderColor="hover:border-blue-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
