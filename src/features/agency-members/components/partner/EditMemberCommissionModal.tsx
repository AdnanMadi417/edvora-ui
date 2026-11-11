"use client";

import React, { useState, useEffect } from "react";
import { XCircle, Percent } from "lucide-react";

import { useUpdateMemberCommission } from "../../hooks";
import type { AgencyMember } from "../../types";

import ModalHeader from "components/ub/feedback/dialogs/ModalHeader";
import Button from "components/ub/core/buttons/Button";
import ToggleInput from "components/ub/forms/choices/ToggleInput";
import CommissionPercentageField from "components/ub/forms/numeric/CommissionPercentageField";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";

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

  const handleApiError = useApiFormErrors({
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) => showToast(`Failed to update commission settings. ${message}`, "error"),
  });

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
      if (Number.isNaN(pct) || pct < 1 || pct > 100) {
        const e = { commission_display_percentage: "Enter a percentage between 1 and 100" };
        setErrors(e);
        scrollToFirstError(e);
        return;
      }
    }

    try {
      await updateMemberCommission(member.partner_id, {
        commission_visible: formData.commission_visible,
        ...(formData.commission_visible && { commission_display_percentage: Number(formData.commission_display_percentage) }),
      });
      showToast("Commission settings updated successfully.", "success");
      onClose();
      onSuccess?.();
    } catch (error: unknown) {
      handleApiError(error, "Please try again.");
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
        <div className="overflow-hidden rounded-ub-xl border border-ub-border-overlay bg-ub-modal shadow-ub-xl">
          <ModalHeader
            title="Edit Commission Settings"
            description={member ? `Update commission visibility for "${member.name}".` : undefined}
            icon={Percent}
            iconBg="bg-ub-tone-brand-bg"
            iconColor="text-ub-text-link"
            iconBorder="border-ub-tone-brand-border"
            titleColor="text-ub-text-primary"
            onClose={onClose}
          />

          <div className="max-h-[60vh] space-y-2 overflow-y-auto px-6 py-6">
            <ToggleInput
              label="Show Commission to This Member"
              field="commission_visible"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              enabledText="Visible to member"
              disabledText="Hidden from member"
              enabledDescription="This member can see their commission details."
              disabledDescription="This member cannot see their commission details."
            />
            {formData.commission_visible && (
              <CommissionPercentageField
                field="commission_display_percentage"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                disabled={loading}
              />
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-ub-border px-6 py-4 sm:flex-row sm:justify-end">
            <Button
              className="w-full sm:w-auto"
              onClick={onClose}
              disabled={loading}
              icon={<XCircle className="h-5 w-5" />}
              text="Cancel"
              variant="secondary"
            />

            <Button
              className="w-full sm:w-auto"
              onClick={handleSave}
              disabled={loading}
              icon={<Percent className="h-5 w-5" />}
              text={loading ? "Saving..." : "Save Changes"}
              variant="primary"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
