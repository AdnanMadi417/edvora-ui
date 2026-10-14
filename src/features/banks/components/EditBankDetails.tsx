"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Landmark, Pencil, XCircle } from "lucide-react";
import { Skeleton } from "components/ui/skeleton";
import { AsyncStateView, getAsyncStatus } from "components/ui/async";
import InputField from "components/form/fields/InputField";
import SelectField from "components/form/fields/SelectField";
import ToggleInput from "components/form/toggle/ToggleInput";
import Button from "components/ui/buttons/Button";
import { useToast } from "components/context/ToastContext";
import { useBank, useUpdateBank } from "../hooks";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import { ISO_COUNTRIES } from "constants/lists";

const COUNTRY_OPTIONS = ISO_COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.code})` }));

interface Props {
  id: string;
  /** Where "Back" and a successful save navigate to — defaults to this
   *  bank's admin details page. The data-entry page passes its own base
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

// Mirrors the field block below (4 inputs + a toggle) so loading doesn't
// shift the layout once the bank (or the "not found" state) arrives.
function EditBankFormSkeleton() {
  return (
    <div className="space-y-4 border-t border-slate-200 px-6 py-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-10 w-full rounded-lg" />
        </div>
      ))}
      <Skeleton className="h-16 w-full rounded-lg" />
    </div>
  );
}

// Edit page for a single bank (PATCH /banks/{id}, a true partial update —
// this form always sends every field though, since the only way to retire
// a bank is toggling is_active here: there's no delete endpoint, the DB
// RESTRICTs deleting a bank that still has partner_bank_accounts pointing
// at it).
export default function EditBankDetails({ id, basePath = "/admin/partners/banks" }: Props) {
  const router = useRouter();
  const { showToast } = useToast();
  const { bank, loading: loadingBank, error: bankError, refetch } = useBank(id);
  const status = getAsyncStatus(loadingBank, bankError, bank, (b) => b === null);
  const { updateBank, loading } = useUpdateBank();

  const [formData, setFormData] = useState<FormData>({ country: "", code: "", swift_code: "", name: "", is_active: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (!bank) return;
    setFormData({
      country: bank.country,
      code: bank.code,
      swift_code: bank.swift_code ?? "",
      name: bank.name,
      is_active: bank.is_active,
    });
  }, [bank]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: field === "country" ? String(value).toUpperCase() : value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const isFormValid = !validateCountry(formData.country) && !validateCode(formData.code) && !validateName(formData.name);

  const isChanged =
    bank &&
    (formData.country !== bank.country ||
      formData.code !== bank.code ||
      formData.swift_code !== (bank.swift_code ?? "") ||
      formData.name !== bank.name ||
      formData.is_active !== bank.is_active);

  const handleBack = () => router.push(basePath);

  const handleSave = async () => {
    if (!bank) return;
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
      await updateBank(bank.id, {
        country: formData.country.trim().toUpperCase(),
        code: formData.code.trim(),
        swift_code: formData.swift_code.trim() || null,
        name: formData.name.trim(),
        is_active: formData.is_active,
      });
      showToast("Bank updated successfully.", "success");
      router.push(`${basePath}/${id}`);
    } catch (error: unknown) {
      const code = getApiErrorCode(error);
      if (code === "bank_already_exists") {
        setErrors((prev) => ({ ...prev, code: "A bank with this country and code already exists." }));
        return;
      }
      if (code === "bank_not_found") {
        setApiError("This bank no longer exists — it may have been removed elsewhere.");
        return;
      }
      setApiError(parseApiError(error, "Please try again."));
    }
  };

  return (
    <div className="mt-6 max-w-5xl mx-auto">
      <div className="rounded-md border bg-card shadow-sm">
        <div className="flex items-center gap-4 border-b p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700">
            <Landmark className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Edit Bank</h2>
            <p className="text-sm text-slate-500">
              Retiring a bank (toggle Inactive) just hides it from the picker — it can&apos;t be deleted while any partner account
              references it.
            </p>
          </div>
        </div>

        <AsyncStateView
          status={status}
          skeleton={<EditBankFormSkeleton />}
          errorMessage={bankError ?? undefined}
          onRetry={refetch}
          emptyTitle="Bank not found"
          emptySubtitle="It may have been removed, or the link is out of date."
          emptyIcon={Landmark}
          emptyAction={
            <Button
              onClick={handleBack}
              icon={<ChevronLeft className="h-4 w-4" />}
              text="Back to Banks"
              bgColor="bg-white"
              textColor="text-slate-600"
              borderColor="border-slate-300"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-400"
            />
          }
        >
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
            required
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
            onBlur={() => {
              const err = validateCode(formData.code);
              if (err) setErrors((prev) => ({ ...prev, code: err }));
            }}
          />
          <InputField label="SWIFT Code" field="swift_code" required={false} formData={formData} errors={errors} updateFormData={updateFormData} />
          <InputField
            label="Bank Name"
            field="name"
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
            enabledDescription="Shown in the bank picker on partner account forms."
            disabledDescription="Hidden from the bank picker."
          />

          {apiError && (
            <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-4">
              <XCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-800">Failed to update bank</p>
                <p className="text-sm text-red-700">{apiError}</p>
              </div>
            </div>
          )}
        </div>
        </AsyncStateView>

        {status === "success" && (
          <div className="flex gap-2 border-t border-slate-200 px-6 py-4">
            <Button
              onClick={handleBack}
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
              onClick={handleSave}
              disabled={loading || !isChanged || !isFormValid}
              icon={<Pencil className="h-5 w-5" />}
              text={loading ? "Saving..." : "Save Changes"}
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              className="flex-1 hover:bg-blue-700"
            />
          </div>
        )}
      </div>
    </div>
  );
}
