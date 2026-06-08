"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Pencil } from "lucide-react";
import { usePartnerDetails, useUpdatePartner, useAssignPartnerManager } from "../hooks";
import { useAccountManagers } from "features/account-managers/hooks";
import Loading from "components/loading/Loading";
import EmptyData from "components/emptyData/EmptyTableData";
import InputField from "components/form/InputField";
import PasswordField from "components/form/PasswordField";
import ToggleInput from "components/form/toggle/ToggleInput";
import SelectField from "components/form/SelectField";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import { COUNTRIES, PARTNER_TYPE } from "constants/lists";

const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

interface Props {
  id: string;
}

export default function EditPartnerDetails({ id }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { partner, isPartnerLoading } = usePartnerDetails(id);
  const { updatePartner, isUpdatingPartner } = useUpdatePartner();
  const { assignManager, loading: assignLoading, error: assignError } = useAssignPartnerManager();
  const { accountManagers } = useAccountManagers();

  const [formData, setFormData] = useState<any>({
    name: "", country: "", email: "", type: "", phone: "",
    manager_id: "", assigned_manager_name: "",
    is_verified: false, is_active: true,
  });

  useEffect(() => {
    if (partner) {
      setFormData({
        name: partner.name || "",
        country: partner.country || "",
        email: partner.email || "",
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
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const isFormChanged = () => {
    if (!partner) return false;
    return (
      formData.name.trim() !== partner.name?.trim() ||
      formData.country.trim() !== partner.country?.trim() ||
      formData.email.trim() !== partner.email?.trim() ||
      formData.type !== partner.type ||
      (formData.manager_id || "") !== (partner.assigned_manager_id || "") ||
      formData.phone.trim() !== partner.phone?.trim() ||
      formData.is_active !== partner.is_active ||
      formData.is_verified !== partner.is_verified ||
      (formData.password?.trim() ?? "") !== ""
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.type.trim()) newErrors.type = "Partner type is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    if (formData.password && !PASSWORD_REGEX.test(formData.password))
      newErrors.password = "Password must be at least 8 characters with 1 letter and 1 number";
    if (formData.password && formData.confirm_password && formData.password !== formData.confirm_password)
      newErrors.confirm_password = "Passwords do not match";
    return newErrors;
  };

  const isFormValid =
    formData.name.trim() !== "" &&
    formData.country.trim() !== "" &&
    formData.type.trim() !== "" &&
    formData.phone.trim() !== "" &&
    (!formData.password?.trim() || (!errors.password && !errors.confirm_password));

  const handleUpdate = async () => {
    const newErrors = validateForm();
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await updatePartner(id, formData);
      if (formData.manager_id) {
        await assignManager(id, { manager_id: formData.manager_id });
      }
      showToast("Partner updated successfully", "success");
      setTimeout(() => router.push("/admin/partners"), 3000);
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message || "Please try again.";
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  if (isPartnerLoading || assignLoading) return <Loading text="Loading partner details..." />;
  if (!partner || assignError) return <EmptyData />;

  return (
    <div className="mt-6 max-w-5xl mx-auto">
      <div className="rounded-md border bg-card shadow-sm">
        <div className="flex justify-between border-b p-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                {partner.name ? partner.name.slice(0, 2).toUpperCase() : "NA"}
              </div>
              <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-md border-2 border-white ${partner.is_active ? "bg-emerald-500" : "bg-slate-300"}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{partner.name}</h2>
              <p className="text-sm text-slate-500">{partner.country}</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/admin/partners")}
            className="group flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Back to partners</span>
          </button>
        </div>

        <div className="space-y-2 px-6 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField label="Partner Name" field="name" required formData={formData} errors={errors} updateFormData={updateFormData} />
            <InputField label="Email Address" field="email" type="email" required formData={formData} errors={errors} updateFormData={updateFormData} />
            <SearchableDropdown label="Country" field="country" options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))} formData={formData} errors={errors} updateFormData={updateFormData} />
            <SelectField label="Partner Type" field="type" options={PARTNER_TYPE.map((p) => ({ value: p.value, label: p.label }))} formData={formData} errors={errors} updateFormData={updateFormData} />
            <InputField label="Phone Number" field="phone" placeholder="eg. 011-8243 9432" required formData={formData} errors={errors} updateFormData={updateFormData} />
            <SelectField label="Assigned Manager" field="manager_id" options={accountManagers.map((m) => ({ label: m.name, value: m.id }))} formData={formData} errors={errors} updateFormData={updateFormData} />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ToggleInput label="Verified" field="is_verified" formData={formData} errors={{}} updateFormData={updateFormData} />
            <ToggleInput label="Account Active" field="is_active" formData={formData} errors={{}} updateFormData={updateFormData} />
            <PasswordField label="Password" field="password" placeholder="At least 8 characters, letters & numbers" required formData={formData} errors={errors} updateFormData={updateFormData} />
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t px-6 py-5">
          <Button onClick={() => router.push("/admin/partners")} icon={<ChevronLeft className="h-5 w-5" />} text="Back" bgColor="bg-slate-50" textColor="text-slate-700" borderColor="border-slate-600" hoverTextColor="hover:text-slate-800" hoverBorderColor="hover:border-slate-700" />
          <Button icon={<Pencil className="h-5 w-5" />} text={isUpdatingPartner ? "Saving..." : "Save Changes"} bgColor="bg-blue-50" textColor="text-blue-700" borderColor="border-blue-600" hoverTextColor="hover:text-blue-800" hoverBorderColor="hover:border-blue-700" onClick={handleUpdate} disabled={isUpdatingPartner || !isFormChanged() || !isFormValid} />
        </div>
      </div>
    </div>
  );
}
