"use client";

import React, { useState, useEffect } from "react";
import { XCircle, DollarSign } from "lucide-react";

import { useBatchUpdatePrograms } from "features/programs/hooks";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import ArrayObjectField from "components/form/ArrayObjectField";

import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation";

interface CreateFeesProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProgramIds: string[];
  onSuccess?: () => void;
}

export default function CreateFees({
  isOpen,
  onClose,
  selectedProgramIds,
  onSuccess,
}: CreateFeesProps) {
  const { batchUpdatePrograms, loading } = useBatchUpdatePrograms();
  const { showToast } = useToast();
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    program_ids: [] as string[],
    yearly_fees: [] as Array<{ year: number; fee: string }>,
    one_time_fees: [] as Array<{ description: string; fee: string }>,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid = !loading;

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
        yearly_fees: [],
        one_time_fees: [],
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
      const payload = {
        program_ids: selectedProgramIds,
        yearly_fees: formData.yearly_fees.length > 0 ? formData.yearly_fees : undefined,
        one_time_fees: formData.one_time_fees.length > 0 ? formData.one_time_fees : undefined,
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
            title="Bulk Tuition Fee Update"
            description="Update Tuition Fee values for multiple programs at once."
            icon={DollarSign}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">

          <ArrayObjectField
            label="Yearly Fees"
            subLabel="Year"
            field="yearly_fees"
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            fields={[
              {
                key: 'year',
                label: 'Year',
                type: 'text',
                placeholder: 'Year',
              },
              {
                key: 'fee',
                label: 'Fee',
                type: 'number',
                placeholder: 'Fee',
              },
            ]}
            getDefaultRow={(currentArray: unknown[]) => ({ year: currentArray.length + 1, fee: "" })}
          />

          <ArrayObjectField
            label="One Time Fees"
            subLabel="Fees"
            field="one_time_fees"
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            fields={[
              {
                key: 'description',
                label: 'Description',
                type: 'text',
                placeholder: 'One Time Fees',
              },
              {
                key: 'fee',
                label: 'Fee',
                type: 'number',
                placeholder: 'Fee',
              },
            ]}
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
              icon={<DollarSign className="h-5 w-5" />}
              text={loading ? "Updating..." : "Update Tuition Fee"}
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
