"use client";

import React, { useEffect, useState } from "react";
import { GraduationCap, XCircle } from "lucide-react";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";

import SelectField from "components/form/SelectField";

import { useAssignUniversityType } from "hooks/knowledge-hub/config-universities/useAssignUniversityType";
import { useUniversityTypes } from "hooks/knowledge-hub/config-universities/useUniversityTypesQuery";

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
      setFormData({
        university_type_id:
          initialData.university_type_id || "",
      });
    }
  }, [initialData]);

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
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
        university_type_id:
          formData.university_type_id || null,
      });

      showToast("University type assigned successfully", "success");

      onClose();
    } catch (err: any) {
      const apiErrors = err?.response?.data?.detail;

      if (Array.isArray(apiErrors)) {
        const newErrors: Record<string, string> = {};

        apiErrors.forEach((e: any) => {
          if (e?.loc?.[1]) {
            newErrors[e.loc[1]] = e.msg;
          }
        });

        setErrors(newErrors);
      }

      showToast("Failed to assign university type", "error");
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
        onClick={e => e.stopPropagation()}
      >
        <ModalHeader
          title="Assign University Type"
          description="Select university type for this university"
          icon={GraduationCap}
          onClose={onClose}
        />

        <div className="space-y-6 px-6 py-6">
          <SelectField
            label="University Type"
            field="university_type_id"
            required
            options={universityTypes.map(type => ({
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
            disabled={loading}
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
            disabled={loading || !isFormValid}
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