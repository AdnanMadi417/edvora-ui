"use client";

import React, { useState, useEffect } from "react";
import { XCircle, GitBranch } from "lucide-react";

import { useBatchUpdatePrograms } from "features/programs/hooks";
import { useBranches } from "features/universities/hooks";

import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import Button from "components/ub/core/buttons/Button";
import SelectField from "components/ub/forms/selection/SelectField";

import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface BatchBranchProgramsProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProgramIds: string[];
  universityId: string;
  onSuccess?: () => void;
}

export default function BatchBranchPrograms({
  isOpen,
  onClose,
  selectedProgramIds,
  universityId,
  onSuccess,
}: BatchBranchProgramsProps) {
  const { batchUpdatePrograms, loading } = useBatchUpdatePrograms();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState("");

  const { branches, branchesLoading } = useBranches(universityId);

  const isFormValid = selectedBranchId !== "" && !loading;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) setSelectedBranchId("");
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      await batchUpdatePrograms({
        program_ids: selectedProgramIds,
        branch_id: selectedBranchId,
      });

      showToast("Branch updated successfully.", "success");
      setTimeout(() => {
        onClose();
        onSuccess?.();
      }, 1500);
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  if (!isVisible) return null;

  const branchOptions = branches.map((b) => ({ value: b.id, label: b.name }));
  const formData = { branch_id: selectedBranchId };
  const errors = {};

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Bulk Branch Update"
            description={`Assign a branch to ${selectedProgramIds.length} selected program${selectedProgramIds.length !== 1 ? "s" : ""}.`}
            icon={GitBranch}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            iconBorder="border-violet-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="px-6 py-6">
            <SelectField
              label="Branch"
              field="branch_id"
              required
              options={branchOptions}
              formData={formData}
              errors={errors}
              updateFormData={(_field: string, value: string) => setSelectedBranchId(value)}
              disabled={branchesLoading}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              icon={<GitBranch className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update Branch"}
              bgColor="bg-violet-50"
              textColor="text-violet-700"
              borderColor="border-violet-600"
              hoverTextColor="hover:text-violet-800"
              hoverBorderColor="hover:border-violet-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
