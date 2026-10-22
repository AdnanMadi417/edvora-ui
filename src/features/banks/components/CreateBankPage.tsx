"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Landmark, XCircle } from "lucide-react";
import InputField from "components/form/fields/InputField";
import SelectField from "components/form/fields/SelectField";
import ToggleInput from "components/form/toggle/ToggleInput";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import { useCreateBank } from "../hooks";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { ISO_COUNTRIES } from "constants/lists";

const COUNTRY_OPTIONS = ISO_COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.code})` }));

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
export default function CreateBankPage({ basePath = "/admin/advisors/banks" }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const { createBank, loading } = useCreateBank();

  const [formData, setFormData] = useState<FormData>({ country: "", code: "", swift_code: "", name: "", is_active: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: field === "country" ? String(value).toUpperCase() : value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const isFormValid = !validateCountry(formData.country) && !validateCode(formData.code) && !validateName(formData.name);

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
        setErrors((prev) => ({ ...prev, code: "A bank with this country and code already exists." }));
        return;
      }
      setApiError(parseApiError(error, "Please try again."));
    }
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto">
      <div className="rounded-md border bg-white shadow-sm">
        <div className="flex items-center gap-4 border-b p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Add Bank</h2>
            <p className="text-sm text-slate-500">Adds a new entry to the bank reference list.</p>
          </div>
        </div>

        <div className="space-y-4 border-t border-slate-200 px-6 py-6">
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
            label="Bank Code"
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
            label="Bank Name"
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

          {apiError && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-4">
              <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">Failed to create bank</p>
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 border-t border-slate-200 px-6 py-4">
          <Button
            onClick={handleBack}
            disabled={loading}
            icon={<ChevronLeft className="h-5 w-5" />}
            text="Back"
            bgColor="bg-white"
            textColor="text-slate-600"
            borderColor="border-slate-300"
            hoverTextColor="hover:text-slate-800"
            hoverBorderColor="hover:border-slate-400"
            className="flex-1 hover:bg-slate-50"
          />
          <Button
            onClick={handleCreate}
            disabled={loading || !isFormValid}
            icon={<Landmark className="h-5 w-5" />}
            text={loading ? "Adding..." : "Add Bank"}
            bgColor="bg-blue-600"
            textColor="text-white"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-white"
            hoverBorderColor="hover:border-blue-700"
            className="flex-1 hover:bg-blue-700"
          />
        </div>
      </div>
    </div>
  );
}
