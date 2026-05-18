"use client";

import React, { useEffect, useState } from "react";
import { Layers, GraduationCap, XCircle } from "lucide-react";

import { useAssignUniversityType, useUniversityTypes } from "features/universities/hooks";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import SelectField from "components/form/SelectField";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  universityId: string | null;
  initialData?: {
    university_type_id?: string | null;
  } | null;
}

export default function AssignUniversityTypeModal({
  isOpen,
  onClose,
  universityId,
  initialData,
}: Props) {
  const { assignUniversityType, loading } =
    useAssignUniversityType(universityId);

  const { showToast } = useToast();

  const { universities: universityTypes } = useUniversityTypes();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    university_type_id: "" as string | "",
  });
  const [initialFormData, setInitialFormData] = useState({
    university_type_id: "" as string | "",
  });

  const normalizePayload = (data: typeof formData) => ({
    university_type_id: data.university_type_id || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFormValid = formData.university_type_id.trim() !== "";

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialData) {
      const initial = {
        university_type_id: initialData.university_type_id || "",
      };

      setFormData(initial);
      setInitialFormData(initial);
    }
  }, [initialData]);

  const isFormChanged = React.useMemo(() => {
    const current = normalizePayload(formData);
    const initial = normalizePayload(initialFormData);

    return JSON.stringify(current) !== JSON.stringify(initial);
  }, [formData, initialFormData]);

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

  const handleSubmit = async () => {
    if (!isFormValid) {
      setErrors({
        university_type_id: "University type is required",
      });

      return;
    }

    try {
      await assignUniversityType({
        university_type_id: formData.university_type_id || null,
      });

      showToast("University type assigned successfully", "success");

      location.reload();

      onClose();
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
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          icon={Layers}
          title="Assign University Type"
          description="Select the university type for this institution"
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          iconBorder="border-blue-200"
          titleColor="text-gray-900"
          onClose={onClose}
        />

        <div className="space-y-6 px-6 py-6">
          <SelectField
            label="University Type"
            field="university_type_id"
            required
            options={universityTypes.map((type) => ({
              value: String(type.id),
              label: type.name,
            }))}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />
        </div>

        <div className="flex justify-end gap-3 border-t px-6 py-4">
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
            disabled={loading || !isFormValid || !isFormChanged}
            icon={<GraduationCap className="h-5 w-5" />}
            text={loading ? "Saving..." : "Save Type"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
          />
        </div>
      </div>
    </div>
  );
}
