"use client";

import React, { useMemo, useState } from "react";
import { Landmark, Pencil, Plus, XCircle } from "lucide-react";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/fields/InputField";
import SelectField from "components/form/fields/SelectField";
import ToggleInput from "components/form/toggle/ToggleInput";
import { Skeleton } from "components/ui/skeleton";
import { AsyncStateView, getAsyncStatus } from "components/ui/async";
import { useToast } from "components/context/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import { getApiErrorCode, getApiErrorDetails } from "utils/parseApiError";
import { useBanks } from "features/banks/hooks";
import type { PartnerDetails } from "features/partners/types";
import { usePartnerBankAccount, useCreatePartnerBankAccount, useUpdatePartnerBankAccount } from "../../hooks";
import type { CreatePartnerBankAccountPayload } from "../../types";
import { ISO_COUNTRIES } from "constants/lists";

const CURRENCY_OPTIONS = [
  { value: "RM", label: "RM — Malaysian Ringgit" },
  { value: "USD", label: "USD — US Dollar" },
];
const COUNTRY_OPTIONS = ISO_COUNTRIES.map((c) => ({ value: c.code, label: `${c.name} (${c.code})` }));

const ERROR_MESSAGES: Record<string, string> = {
  bank_account_not_found: "This bank account no longer exists — it may have been removed elsewhere.",
  bank_account_not_current: "This account was changed elsewhere — refresh and try again.",
};

interface Props {
  partner: PartnerDetails;
}

interface FormData {
  useCuratedBank: boolean;
  bank_id: string;
  intl_bank_name: string;
  intl_bank_country: string;
  intl_bank_swift: string;
  account_holder_name: string;
  account_number: string;
  iban: string;
  currency: string;
  beneficiary_address: string;
  beneficiary_phone: string;
  beneficiary_id_number: string;
  bank_branch_address: string;
  bank_branch_code: string;
  intermediary_bank_name: string;
  intermediary_bank_swift: string;
}

const EMPTY_FORM: FormData = {
  useCuratedBank: true,
  bank_id: "",
  intl_bank_name: "",
  intl_bank_country: "",
  intl_bank_swift: "",
  account_holder_name: "",
  account_number: "",
  iban: "",
  currency: "RM",
  beneficiary_address: "",
  beneficiary_phone: "",
  beneficiary_id_number: "",
  bank_branch_address: "",
  bank_branch_code: "",
  intermediary_bank_name: "",
  intermediary_bank_swift: "",
};

function DetailRow({ label, value }: { label: string; value?: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-slate-900">{value || "—"}</p>
    </div>
  );
}

// Mirrors the 6-cell detail grid below so loading doesn't shift the layout
// once the real account (or lack of one) arrives.
function BankAccountSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 p-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i}>
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-1.5 h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

/**
 * Partner Bank Account — the partner's payout account. At most one active
 * account per partner: a read-only summary with "Edit", or an "Add Bank
 * Account" prompt when none exists yet. Add and edit share one form — PATCH
 * always creates a new row and retires the old one, so "Edit" really means
 * "Replace".
 */
export default function PartnerBankAccountSection({ partner }: Props) {
  const { showToast } = useToast();
  const { account, loading, error, refetch } = usePartnerBankAccount(partner.id);
  const { banks: allBanks } = useBanks({ include_inactive: true });
  const { createAccount, loading: creating } = useCreatePartnerBankAccount();
  const { updateAccount, loading: updating } = useUpdatePartnerBankAccount();

  const [mode, setMode] = useState<"view" | "form">("view");
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [bankSuggestion, setBankSuggestion] = useState<{ bank_id: string; bank_name: string } | null>(null);

  const isMalaysia = partner.country.trim().toLowerCase() === "malaysia";
  const saving = creating || updating;
  const status = getAsyncStatus(loading, error, account, (a) => a === null);

  const bankLookup = useMemo(() => new Map(allBanks.map((b) => [b.id, b])), [allBanks]);
  const bankOptions = useMemo(
    () => allBanks.filter((b) => b.is_active).map((b) => ({ value: b.id, label: `${b.name} (${b.code})` })),
    [allBanks]
  );

  const handleApiError = useApiFormErrors({
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) => showToast(message, "error"),
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    setBankSuggestion(null);
  };

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setErrors({});
    setBankSuggestion(null);
    setMode("form");
  };

  const openEdit = () => {
    if (!account) return;
    setFormData({
      useCuratedBank: !!account.bank_id,
      bank_id: account.bank_id ?? "",
      intl_bank_name: account.intl_bank_name ?? "",
      intl_bank_country: account.intl_bank_country ?? "",
      intl_bank_swift: account.intl_bank_swift ?? "",
      account_holder_name: account.account_holder_name,
      account_number: account.account_number,
      iban: account.iban ?? "",
      currency: account.currency,
      beneficiary_address: account.beneficiary_address ?? "",
      beneficiary_phone: account.beneficiary_phone ?? "",
      beneficiary_id_number: account.beneficiary_id_number ?? "",
      bank_branch_address: account.bank_branch_address ?? "",
      bank_branch_code: account.bank_branch_code ?? "",
      intermediary_bank_name: account.intermediary_bank_name ?? "",
      intermediary_bank_swift: account.intermediary_bank_swift ?? "",
    });
    setErrors({});
    setBankSuggestion(null);
    setMode("form");
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (formData.useCuratedBank) {
      if (!formData.bank_id) next.bank_id = "Select a bank";
    } else {
      if (!formData.intl_bank_name.trim()) next.intl_bank_name = "Bank name is required";
      if (!formData.intl_bank_country.trim()) next.intl_bank_country = "Bank country is required";
      if (!formData.intl_bank_swift.trim()) next.intl_bank_swift = "SWIFT code is required";
    }
    if (!formData.account_holder_name.trim()) next.account_holder_name = "Account holder name is required";
    if (!formData.account_number.trim()) next.account_number = "Account number is required";
    if (!formData.currency) next.currency = "Currency is required";
    // Only a manually-entered international bank needs wire details — a
    // curated bank (Malaysia today) never does, regardless of the
    // partner's own country.
    if (!isMalaysia && !formData.useCuratedBank) {
      if (!formData.beneficiary_address.trim()) next.beneficiary_address = "Required for international accounts";
      if (!formData.beneficiary_phone.trim()) next.beneficiary_phone = "Required for international accounts";
      if (!formData.bank_branch_address.trim()) next.bank_branch_address = "Required for international accounts";
      if (!formData.bank_branch_code.trim()) next.bank_branch_code = "Required for international accounts";
    }
    return next;
  };

  const buildPayload = (): CreatePartnerBankAccountPayload => ({
    ...(formData.useCuratedBank
      ? { bank_id: formData.bank_id }
      : {
          intl_bank_name: formData.intl_bank_name.trim(),
          intl_bank_country: formData.intl_bank_country.trim().toUpperCase(),
          intl_bank_swift: formData.intl_bank_swift.trim(),
        }),
    account_holder_name: formData.account_holder_name.trim(),
    account_number: formData.account_number.trim(),
    iban: formData.iban.trim() || undefined,
    currency: formData.currency,
    beneficiary_address: formData.beneficiary_address.trim() || undefined,
    beneficiary_phone: formData.beneficiary_phone.trim() || undefined,
    beneficiary_id_number: formData.beneficiary_id_number.trim() || undefined,
    bank_branch_address: formData.bank_branch_address.trim() || undefined,
    bank_branch_code: formData.bank_branch_code.trim() || undefined,
    intermediary_bank_name: formData.intermediary_bank_name.trim() || undefined,
    intermediary_bank_swift: formData.intermediary_bank_swift.trim() || undefined,
  });

  const applySuggestion = () => {
    if (!bankSuggestion) return;
    setFormData((prev) => ({
      ...prev,
      useCuratedBank: true,
      bank_id: bankSuggestion.bank_id,
      intl_bank_name: "",
      intl_bank_country: "",
      intl_bank_swift: "",
    }));
    setBankSuggestion(null);
  };

  const handleSave = async () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      scrollToFirstError(validationErrors);
      return;
    }

    try {
      if (account) {
        const { currency, ...payload } = buildPayload();
        await updateAccount(partner.id, account.id, payload);
        showToast("Bank account updated.", "success");
      } else {
        await createAccount(partner.id, buildPayload());
        showToast("Bank account added.", "success");
      }
      setMode("view");
      refetch();
    } catch (err: unknown) {
      const code = getApiErrorCode(err);

      if (code === "bank_already_curated") {
        const details = getApiErrorDetails(err) as { bank_id?: string; bank_name?: string } | null;
        if (details?.bank_id) {
          setBankSuggestion({ bank_id: details.bank_id, bank_name: details.bank_name || "this bank" });
          return;
        }
      }
      if (code === "bank_account_already_active") {
        showToast("This partner already has an active bank account — showing it now.", "error");
        setMode("view");
        refetch();
        return;
      }
      if (code && ERROR_MESSAGES[code]) {
        showToast(ERROR_MESSAGES[code], "error");
        setMode("view");
        refetch();
        return;
      }
      handleApiError(err, "Failed to save bank account. Please try again.");
    }
  };

  const bankDisplayName = account?.bank_id ? bankLookup.get(account.bank_id)?.name ?? "Curated bank" : account?.intl_bank_name;
  const bankDisplaySwift = account?.bank_id ? bankLookup.get(account.bank_id)?.swift_code : account?.intl_bank_swift;

  return (
    <div className="" data-testid="partner-bank-account">
      <div className="mb-1 flex items-center gap-2 px-6 pt-6">
        <Landmark className="h-4 w-4 text-slate-500" />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Bank Account</p>
      </div>

      {mode === "view" && (
        <AsyncStateView
          status={status}
          skeleton={<BankAccountSkeleton />}
          errorMessage={error ?? undefined}
          onRetry={refetch}
          emptyTitle="No payout bank account yet"
          emptySubtitle="Add one so this partner can be paid."
          emptyIcon={Landmark}
          emptyAction={
            <Button
              onClick={openAdd}
              icon={<Plus className="h-4 w-4" />}
              text="Add Bank Account"
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
            />
          }
        >
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 p-6">
            <DetailRow label="Bank" value={bankDisplayName} />
            <DetailRow label="SWIFT Code" value={bankDisplaySwift} />
            <DetailRow label="Account Holder" value={account?.account_holder_name} />
            <DetailRow label="Account Number" value={account?.account_number} />
            <DetailRow label="IBAN" value={account?.iban} />
            <DetailRow label="Currency" value={account?.currency} />
            {!isMalaysia && account && !account.bank_id && (
              <>
                <DetailRow label="Beneficiary Address" value={account.beneficiary_address} />
                <DetailRow label="Beneficiary Phone" value={account.beneficiary_phone} />
                <DetailRow label="Bank Branch Address" value={account.bank_branch_address} />
                <DetailRow label="Bank Branch Code" value={account.bank_branch_code} />
              </>
            )}
          </div>

          <div className="flex justify-end border-t border-slate-200 p-6">
            <Button
              onClick={openEdit}
              icon={<Pencil className="h-4 w-4" />}
              text="Edit"
              bgColor="bg-white"
              textColor="text-slate-600"
              borderColor="border-slate-300"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-400"
            />
          </div>
        </AsyncStateView>
      )}

      {mode === "form" && (
        <div className="grid grid-cols-1 gap-x-4 p-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <ToggleInput
              label="Bank Selection"
              field="useCuratedBank"
              formData={formData}
              errors={{}}
              updateFormData={updateFormData}
              enabledText="Pick from list"
              disabledText="Bank isn't listed"
              enabledDescription="Choose a bank from the curated list."
              disabledDescription="Enter the bank's details manually."
            />
          </div>

          {formData.useCuratedBank ? (
            <div className="md:col-span-2">
              <SelectField label="Bank" field="bank_id" options={bankOptions} formData={formData} errors={errors} updateFormData={updateFormData} />
            </div>
          ) : (
            <>
              <InputField label="Bank Name" field="intl_bank_name" formData={formData} errors={errors} updateFormData={updateFormData} />
              <SelectField
                label="Bank Country"
                field="intl_bank_country"
                options={COUNTRY_OPTIONS}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField label="SWIFT Code" field="intl_bank_swift" formData={formData} errors={errors} updateFormData={updateFormData} />
            </>
          )}

          {bankSuggestion && (
            <div className="mb-4 flex items-center justify-between gap-2 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 md:col-span-2">
              <span>&quot;{bankSuggestion.bank_name}&quot; is already in the curated bank list.</span>
              <Button
                onClick={applySuggestion}
                text={`Use ${bankSuggestion.bank_name}`}
                bgColor="bg-white"
                textColor="text-blue-700"
                borderColor="border-blue-600"
                hoverTextColor="hover:text-blue-800"
                hoverBorderColor="hover:border-blue-700"
              />
            </div>
          )}

          <InputField label="Account Holder Name" field="account_holder_name" formData={formData} errors={errors} updateFormData={updateFormData} />
          <InputField label="Account Number" field="account_number" formData={formData} errors={errors} updateFormData={updateFormData} />
          <InputField label="IBAN" field="iban" required={false} formData={formData} errors={errors} updateFormData={updateFormData} />
          <SelectField
            label="Currency"
            field="currency"
            options={CURRENCY_OPTIONS}
            disabled={!!account}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          {!isMalaysia && !formData.useCuratedBank && (
            <>
              <InputField label="Beneficiary Address" field="beneficiary_address" formData={formData} errors={errors} updateFormData={updateFormData} />
              <InputField label="Beneficiary Phone" field="beneficiary_phone" formData={formData} errors={errors} updateFormData={updateFormData} />
              <InputField
                label="Beneficiary ID Number"
                field="beneficiary_id_number"
                required={false}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField label="Bank Branch Address" field="bank_branch_address" formData={formData} errors={errors} updateFormData={updateFormData} />
              <InputField label="Bank Branch Code" field="bank_branch_code" formData={formData} errors={errors} updateFormData={updateFormData} />
              <InputField
                label="Intermediary Bank Name"
                field="intermediary_bank_name"
                required={false}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Intermediary Bank SWIFT"
                field="intermediary_bank_swift"
                required={false}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 md:col-span-2">
            <Button
              onClick={() => setMode("view")}
              disabled={saving}
              icon={<XCircle className="h-4 w-4" />}
              text="Cancel"
              bgColor="bg-white"
              textColor="text-slate-600"
              borderColor="border-slate-300"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-400"
            />
            <Button
              onClick={handleSave}
              disabled={saving}
              icon={<Landmark className="h-4 w-4" />}
              text={saving ? "Saving..." : "Save"}
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              className="hover:bg-blue-700"
            />
          </div>
        </div>
      )}
    </div>
  );
}
