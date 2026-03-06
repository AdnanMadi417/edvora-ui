"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save } from "lucide-react";

import { usePartnerDetails } from "hooks/partners/usePartnerDetails";
import { useUpdatePartner } from "hooks/partners/useUpdatePartner";
import { useAccountManagerList } from "hooks/account-managers/useAccountManagerList";

import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";

import InputField from "components/form/InputField";
import ToggleInput from "components/form/toggle/ToggleInput";
import SelectField from "components/form/SelectField";

import { COUNTRIES, PARTNER_TYPE } from "constants/lists";

import Button from "components/ui/buttons/Button";
import { useToast } from '../../../context/ToastContext';
import { useAssignPartnerManager } from '../../../../hooks/partners/useAssignPartnerManager';

interface PartnerDetailsProps {
  id: string;
}

const EditPartnerDetails = ({ id }: PartnerDetailsProps) => {
  const router = useRouter();
  const { showToast } = useToast();

  const { partner, isPartnerLoading } = usePartnerDetails(id);
  const { updatePartner, isUpdatingPartner } = useUpdatePartner();
  const { accountManagers } = useAccountManagerList();

  const [formData, setFormData] = useState<any>({
    name: "",
    country: "",
    type: "",
    phone: "",
    assigned_manager_name: "",
    is_verified: false,
    is_active: true,
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || "",
        country: partner.country || "",
        type: partner.type || "",
        phone: partner.phone || "",
        manager_id: partner.assigned_manager_id || "",
        assigned_manager_name: partner.assigned_manager_name || "",
        is_verified: partner.is_verified,
        is_active: partner.is_active,
      });
    }
  }, [partner]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormValid =
    formData.name && formData.country && formData.type && formData.phone;

  const handleBack = () => {
    router.push("/admin/partners");
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { assignManager, loading, error } = useAssignPartnerManager();

  const handleUpdate = async () => {
    try {
      await updatePartner(id, formData);

      if (formData.manager_id) {
        await assignManager(id, {
          manager_id: formData.manager_id,
        });
      }

      showToast("success: Partner updated successfully");

      setTimeout(() => router.push("/admin/partners"), 3000);

    } catch (error) {
      showToast("error: Update failed");
    }
  };
  if (isPartnerLoading) {
    return <Loading text="Loading partner details..." />;
  }

  if (!partner) {
    return <EmptyData />;
  }

  return (
    <div className="mt-6">
      <div className="rounded-md border bg-card shadow-sm">
        <div className="flex justify-between border-b p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                {partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
              </div>

              <span
                className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${
                  partner.is_active ? "bg-emerald-500" : "bg-slate-300"
                }`}
              />
            </div>

            <div>
              <h2 className="text-lg font-semibold">{partner.name}</h2>
              <p className="text-sm text-slate-500">{partner.country}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={handleBack}
              className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span className="hidden sm:inline">Back to partners</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
              label="Partner Name"
              field="name"
              required
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
            />

            <SelectField
              label="Country"
              field="country"
              options={COUNTRIES.map((c) => ({
                value: c.code,
                label: c.name,
              }))}
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
            />

            <SelectField
              label="Partner Type"
              field="type"
              options={PARTNER_TYPE.map((p) => ({
                value: p.value,
                label: p.label,
              }))}
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
            />

            <InputField
              label="Phone Number"
              field="phone"
              required
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
            />

            <SelectField
              label="Assigned Manager"
              field="manager_id"
              options={accountManagers.map((m) => ({
                label: m.name,
                value: m.id,
              }))}
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
            />

          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ToggleInput
              label="Verified"
              field="is_verified"
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
            />

            <ToggleInput
              label="Account Active"
              field="is_active"
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-5">
          <Button
            onClick={handleBack}
            disabled={isUpdatingPartner}
            icon={<ChevronLeft className="h-5 w-5" />}
            text="Back"
            bgColor="bg-slate-50"
            textColor="text-slate-700"
            borderColor="border-slate-600"
            hoverTextColor="hover:text-slate-800"
            hoverBorderColor="hover:border-slate-700"
          />

          <Button
            icon={<Save className="h-5 w-5" />}
            text={isUpdatingPartner ? "Updating..." : "Update Partner"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleUpdate}
            disabled={isUpdatingPartner || !isFormValid}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPartnerDetails;
