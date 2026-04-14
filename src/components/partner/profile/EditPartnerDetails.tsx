"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Save } from "lucide-react";

import {
  usePartnerProfile,
  PartnerDetails,
} from "hooks/partners/usePartnerProfile";
import { useUpdatePartnerProfile } from "hooks/partners/useUpdatePartnerProfile";

import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";

import InputField from "components/form/InputField";
import SelectField from "components/form/SelectField";
import SearchableDropdown from "components/form/search/SearchableDropdown";

import { COUNTRIES, PARTNER_TYPE } from "constants/lists";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";

interface EditPartnerProfileProps {}

const EditPartnerProfile: React.FC<EditPartnerProfileProps> = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const { partner, isPartnerLoading, partnerError } = usePartnerProfile();
  const { updateProfile, loading: isUpdating } = useUpdatePartnerProfile();

  const [formData, setFormData] = useState<Partial<PartnerDetails>>({});

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        country: partner.country,
        type: partner.type,
        phone: partner.phone,
        is_verified: partner.is_verified,
        is_active: partner.is_active,
      });
    }
  }, [partner]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const isFormChanged = () => {
    if (!partner) return false;

    return (
      formData.type !== partner.type ||
      formData.country.trim() !== partner.country?.trim() ||
      formData.phone.trim() !== partner.phone?.trim()
    );
  };

  const isFormValid =
    !!formData.name &&
    !!formData.country &&
    !!formData.type &&
    !!formData.phone;

  const handleBack = () => router.push("/partner/profile");

  const handleUpdate = async () => {
    try {
      await updateProfile({
        type: formData.type!,
        country: formData.country!,
        phone: formData.phone!,
      });

      showToast("Profile updated successfully", "success");
      router.push("/partner/profile");

    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  if (isPartnerLoading) return <Loading text="Loading profile..." />;
  if (partnerError || !partner) return <EmptyData />;

  return (
    <div className="mx-auto mt-6 max-w-5xl">
      <div className="rounded-md border bg-card shadow-sm">
        <div className="flex justify-between border-b px-6 py-5">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                {partner.name?.slice(0, 2).toUpperCase() || "NA"}
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
        </div>

        <div className="grid grid-cols-1 gap-4 px-6 py-5 md:grid-cols-2">
          <SearchableDropdown
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
            label="Country"
            field="type"
            options={PARTNER_TYPE.map((type) => ({
              value: type.value,
              label: type.label,
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
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-5">
          <Button
            onClick={handleBack}
            disabled={isUpdating}
            icon={<ChevronLeft className="h-5 w-5" />}
            text="Back"
            bgColor="bg-slate-50"
            textColor="text-slate-700"
            borderColor="border-slate-600"
          />

          <Button
            icon={<Save className="h-5 w-5" />}
            text={isUpdating ? "Updating..." : "Update Profile"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            onClick={handleUpdate}
            disabled={isUpdating || !isFormValid || !isFormChanged()}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPartnerProfile;
