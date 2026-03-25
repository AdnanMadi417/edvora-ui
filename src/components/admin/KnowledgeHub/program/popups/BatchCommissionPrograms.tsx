"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Percent } from "lucide-react";

import { useBatchUpdatePrograms } from "hooks/knowledge-hub/programs/useBatchUpdatePrograms";
import { useCommissionTypes } from "hooks/knowledge-hub/commission/useCommissionTypes";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/InputField";
import SelectField from "components/form/SelectField";

import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation";

interface CreateBranchProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProgramIds: string[];
  onSuccess?: () => void;
}

export interface ProgramCommissionPayload {
  program_ids: string[];

  commission_amount?: number;
  commission_type_id?: string;
  commission_notes?: string;
}

export default function CreateBranch({
  isOpen,
  onClose,
  selectedProgramIds,
  onSuccess,
}: CreateBranchProps) {
  const { batchUpdatePrograms, loading } = useBatchUpdatePrograms();
  const { showToast } = useToast();
  const { commissionTypes, commissionTypesLoading } = useCommissionTypes();
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    program_ids: [] as string[],
    commission_amount: "",
    commission_type_id:
      "" ||
      "Commission paid 30 days after student completes first semester of each academic year.",
    commission_notes: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid =
    formData.commission_amount !== "" &&
    formData.commission_type_id !== "" &&
    !loading;

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        program_ids: selectedProgramIds || [],
        commission_amount: "",
        commission_type_id: "",
        commission_notes: "",
      });

      setErrors({});
    }
  }, [isOpen, selectedProgramIds]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCreate = async () => {
    try {
      const amount =
        formData.commission_amount !== ""
          ? Number(formData.commission_amount)
          : undefined;

      const payload = {
        program_ids: selectedProgramIds,
        commission_type_id: formData.commission_type_id || undefined,
        commission_notes: formData.commission_notes?.trim() || undefined,
        ...(amount !== undefined && !isNaN(amount)
          ? { commission_amount: amount }
          : {}),
      };

      await batchUpdatePrograms(payload);

      showToast("Programs updated successfully.", "success");

      setTimeout(() => {
        router.push("/admin/knowledge-hub/programs");
        onClose();
        onSuccess?.();
      }, 2000);

    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.message || "Please try again.";
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Bulk Commission Update"
            description="Update commission values for multiple programs at once."
            icon={Percent}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
            <InputField
              label="Commission Amount"
              field="commission_amount"
              type="number"
              placeholder="e.g. 10"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            <SelectField
              label="Commission Type"
              field="commission_type_id"
              required
              options={commissionTypes.map((f) => ({
                value: String(f.id),
                label: f.name,
              }))}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            <InputField
              label="Commission Notes"
              field="commission_notes"
              placeholder="Optional notes..."
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              required={false}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button
              onClick={onClose}
              icon={<XCircle className="h-5 w-5" />}
              text={"Cancel"}
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              onClick={handleCreate}
              disabled={!isFormValid || loading}
              icon={<Percent className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update Commission"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
