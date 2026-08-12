"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Percent } from "lucide-react";

import { useUpdateMemberCommission } from "../../hooks";
import type { AgencyMember } from "../../types";

import ModalHeader from "components/ui/modal/ModalHeader";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/fields/InputField";
import ToggleInput from "components/form/toggle/ToggleInput";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";

interface EditMemberCommissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  member: AgencyMember | null;
}

export default function EditMemberCommissionModal({
  isOpen,
  onClose,
  onSuccess,
  member,
}: EditMemberCommissionModalProps) {
  const { updateMemberCommission, loading } = useUpdateMemberCommission();
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);
  const [formData, setFormData] = useState({ commission_visible: true, commission_display_percentage: 100 });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && member) {
      setIsVisible(true);
      setFormData({
        commission_visible: member.commission_visible,
        commission_display_percentage: member.commission_display_percentage,
      });
      setErrors({});
    } else if (!isOpen) {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, member]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => { const n = { ...prev }; delete n[field]; return n; });
    }
  };

  const handleSave = async () => {
    if (!member) return;

    if (formData.commission_visible) {
      const pct = Number(formData.commission_display_percentage);
      if (Number.isNaN(pct) || pct < 0 || pct > 100) {
        setErrors({ commission_display_percentage: "Enter a percentage between 0 and 100" });
        return;
      }
    }

    try {
      await updateMemberCommission(member.id, {
        commission_visible: formData.commission_visible,
        commission_display_percentage: formData.commission_visible ? Number(formData.commission_display_percentage) : 0,
      });
      showToast("Commission settings updated successfully.", "success");
      onClose();
      onSuccess?.();
    } catch (error: any) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to update commission settings. ${backendMessage}`, "error");
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
          isOpen ? "translate-y-0 scale-100 opacity-100" : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Edit Commission Settings"
            description={member ? `Update commission visibility for "${member.name}".` : undefined}
            icon={Percent}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            iconBorder="border-blue-200"
            titleColor="text-gray-900"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-2 overflow-y-auto px-6 py-6">
            <ToggleInput
              label="Show Commission to This Member"
              field="commission_visible"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
            {formData.commission_visible && (
              <InputField
                label="Commission Display Percentage"
                field="commission_display_percentage"
                type="number"
                placeholder="100"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                disabled={loading}
                helperText="What percentage of the commission this member sees."
              />
            )}
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-200 px-6 py-4">
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
              onClick={handleSave}
              disabled={loading}
              icon={<Percent className="h-5 w-5" />}
              text={loading ? "Saving..." : "Save Changes"}
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
