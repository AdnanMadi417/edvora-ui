"use client";

import React, { useState, useEffect } from "react";
import { Edit2 } from "lucide-react";

import ModalHeader from "../../../ui/modal/ModalHeader";
import AssignBtn from "../../../ui/buttons/Button";
import { useToast } from "components/context/ToastContext";

import { useAssignPartnerManager } from "hooks/partners/useAssignPartnerManager";
import SelectField from "../../../form/SelectField";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  partnerId: string;
  managerOptions: { label: string; value: string }[];
  currentManagerId?: string;
}

export default function AssignManagerModal({
  isOpen,
  onClose,
  partnerId,
  managerOptions,
  currentManagerId,
}: Props) {
  const { showToast } = useToast();

  const [isVisible, setIsVisible] = useState(false);

  const [formData, setFormData] = useState({
    manager_id: "",
  });
  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { assignManager, loading, error } = useAssignPartnerManager();

  useEffect(() => {
    if (isOpen) setIsVisible(true);
    else setTimeout(() => setIsVisible(false), 300);
  }, [isOpen]);

    useEffect(() => {
      if (isOpen && currentManagerId) {
        setFormData({
          manager_id: currentManagerId,
        });
      } else if (isOpen) {
        setFormData({
          manager_id: "",
        });
        setErrors({});
      }
    }, [isOpen, currentManagerId]);

  const closeModal = () => onClose();

  const handleSubmit = async () => {
    if (!formData.manager_id) {
      setErrors({ manager_id: "Please select manager" });
      showToast("error: Please select manager");
      return;
    }

    try {
      await assignManager(partnerId, {
        manager_id: formData.manager_id,
      });

      showToast("success: Manager assigned successfully");
      onClose();

      setTimeout(() => location.reload(), 300);
    } catch {
      showToast("error: Failed to assign manager");
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-overlay p-4 backdrop-blur-sm"
      onClick={closeModal}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`w-full max-w-lg transform transition-all duration-300 md:max-w-xl ${
          isOpen
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-4 scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden rounded-2xl bg-white text-sm shadow-2xl ring-1 ring-black/5">
          <ModalHeader
            title="Assign Manager"
            description="Select and assign an account manager"
            icon={Edit2}
            iconBg="bg-amber-50"
            iconColor="text-amber-700"
            iconBorder="border-amber-300"
            titleColor="text-gray-900"
            onClose={closeModal}
          />

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-4 py-5">
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <Edit2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <p className="text-p2 leading-relaxed text-slate-900">
                This action will request the admin to assign an account manager
                to the partner. Please select an account manager before
                proceeding .
              </p>
            </div>

            <SelectField
              label="Manager"
              field="manager_id"
              options={managerOptions}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex items-center justify-end border-t border-gray-200 px-6 py-4">
            <div className=" flex gap-2">
              <AssignBtn
                icon={<Edit2 className="h-5 w-5" />}
                text={loading ? "Assigning..." : "Assign Manager"}
                bgColor="bg-amber-50"
                textColor="text-amber-700"
                borderColor="border-amber-600"
                hoverTextColor="hover:text-amber-800"
                hoverBorderColor="hover:border-amber-700"
                onClick={handleSubmit}
                disabled={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
