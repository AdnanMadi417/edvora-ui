"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark } from "lucide-react";
import FormPage from "components/ub/forms/layout/FormPage";
import { FormSection } from "components/ub/feedback/dialogs/FormModal";
import Alert from "components/ub/feedback/notifications/Alert";
import InputField from "components/ub/forms/text/InputField";
import SelectField from "components/ub/forms/selection/SelectField";
import ToggleInput from "components/ub/forms/choices/ToggleInput";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { useCreateBank } from "../hooks";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { ISO_COUNTRIES } from "constants/lists";

const COUNTRY_OPTIONS = ISO_COUNTRIES.map((c) => ({
  value: c.code,
  label: `${c.name} (${c.code})`,
}));

interface Props {
  /** Where "Back" navigates to, and a successful create redirects to —
   *  defaults to the admin route. The data-entry page passes its own base
   *  path. */
  basePath?: string;
}

interface FormData {
  country: string;
  code: string;
  swift_code: string;
  name: string;
  is_active: boolean;
}

function validateCountry(value: string): string {
  if (!value.trim()) return "Country is required";
  return "";
}

function validateCode(value: string): string {
  if (!value.trim()) return "Bank code is required";
  return "";
}

function validateName(value: string): string {
  if (!value.trim()) return "Bank name is required";
  return "";
}

// Add-a-bank page — admin/data-entry only. Adds a new entry to the Banks
// reference list (GET /banks, used to populate the bank picker on a
// partner's account form).
export default function CreateBankPage({
  basePath = "/admin/advisors/banks",
}: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const { createBank, loading } = useCreateBank();

  const [formData, setFormData] = useState<FormData>({
    country: "",
    code: "",
    swift_code: "",
    name: "",
    is_active: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === "country" ? String(value).toUpperCase() : value,
    }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const isFormValid =
    !validateCountry(formData.country) &&
    !validateCode(formData.code) &&
    !validateName(formData.name);

  const handleBack = () => router.push(basePath);

  const handleCreate = async () => {
    const newErrors: Record<string, string> = {
      country: validateCountry(formData.country),
      code: validateCode(formData.code),
      name: validateName(formData.name),
    };
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key]) delete newErrors[key];
    });
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setApiError(null);
      const bank = await createBank({
        country: formData.country.trim().toUpperCase(),
        code: formData.code.trim(),
        swift_code: formData.swift_code.trim() || undefined,
        name: formData.name.trim(),
        is_active: formData.is_active,
      });
      showToast("Bank created successfully.", "success");
      router.push(`${basePath}/${bank.id}`);
    } catch (error: unknown) {
      if (getApiErrorCode(error) === "bank_already_exists") {
        setErrors((prev) => ({
          ...prev,
          code: "A bank with this country and code already exists.",
        }));
        return;
      }
      setApiError(parseApiError(error, "Please try again."));
    }
  };

  return (
    <FormPage
      stickyActions
      title="Add bank"
      description="Add a bank to the reference list used for advisor payout accounts."
      icon={Landmark}
      onSubmit={handleCreate}
      onCancel={handleBack}
      cancelLabel="Back"
      submitLabel="Add bank"
      submitting={loading}
      submitDisabled={!isFormValid}
    >
      <FormSection
        id="bank-details"
        title="Bank details"
        description="Use the bank's official name and identifiers."
      >
        <SelectField
          label="Country"
          field="country"
          options={COUNTRY_OPTIONS}
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => {
            const err = validateCountry(formData.country);
            if (err) setErrors((prev) => ({ ...prev, country: err }));
          }}
        />
        <InputField
          label="Bank code"
          field="code"
          placeholder="e.g. MBB0228"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => {
            const err = validateCode(formData.code);
            if (err) setErrors((prev) => ({ ...prev, code: err }));
          }}
        />
        <InputField
          label="SWIFT Code"
          field="swift_code"
          placeholder="e.g. MBBEMYKL"
          required={false}
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />
        <InputField
          label="Bank name"
          field="name"
          placeholder="e.g. Malayan Banking Berhad (Maybank)"
          required
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => {
            const err = validateName(formData.name);
            if (err) setErrors((prev) => ({ ...prev, name: err }));
          }}
        />
      </FormSection>
      <FormSection id="bank-availability" title="Availability" columns={1}>
        <ToggleInput
          label="Status"
          field="is_active"
          formData={formData}
          errors={{}}
          updateFormData={updateFormData}
          enabledText="Active"
          disabledText="Inactive"
          enabledDescription="Shown in the bank picker on advisor account forms."
          disabledDescription="Hidden from the bank picker."
        />
      </FormSection>
      {apiError && (
        <Alert tone="danger" title="Couldn't create bank">
          {apiError}
        </Alert>
      )}
    </FormPage>
  );
}
