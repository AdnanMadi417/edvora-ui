"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Award } from "lucide-react";
import { useCreateQualificationsType } from "features/knowledge-hub/qualifications/hooks";
import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation";
import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/fields/InputField";

interface CreateQualificationTypeProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateQualificationType({ isOpen, onClose }: CreateQualificationTypeProps) {
  const { createQualificationType, loading } = useCreateQualificationsType();
  const { showToast } = useToast();
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setFormData({ name: "" });
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
      await createQualificationType({ name: formData.name });
      showToast("Qualification Type created successfully.", "success");
      setTimeout(() => router.refresh(), 1500);
      onClose();
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Failed to create Qualification Type. ${backendMessage}`, "error");
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"}`} onClick={(e) => e.stopPropagation()}>
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader title="Create New Qualification Type" description="Add a new Qualification into the knowledge hub." icon={Award} iconBg="bg-blue-50" iconColor="text-blue-600" iconBorder="border-blue-200" titleColor="text-gray-900" onClose={onClose} />
          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-6 py-6">
            <InputField label="Qualification Type" field="name" placeholder="e.g. Foundation" required formData={formData} errors={errors} updateFormData={updateFormData} />
          </div>
          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
            <Button onClick={onClose} disabled={loading} icon={<XCircle className="h-5 w-5" />} text={loading ? "Cancelling..." : "Cancel"} bgColor="bg-slate-50" textColor="text-slate-700" borderColor="border-slate-600" hoverTextColor="hover:text-slate-800" hoverBorderColor="hover:border-slate-700" />
            <Button onClick={handleCreate} disabled={loading || !formData.name.trim()} icon={<Award className="h-5 w-5" />} text={loading ? "Creating..." : "Create Qualification Type"} bgColor="bg-blue-50" textColor="text-blue-700" borderColor="border-blue-600" hoverTextColor="hover:text-blue-800" hoverBorderColor="hover:border-blue-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
