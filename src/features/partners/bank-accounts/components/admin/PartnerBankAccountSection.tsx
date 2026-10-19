"use client";

import React, { useMemo, useState } from "react";
import { History, Landmark, Pencil, Plus, XCircle } from "lucide-react";
import Button from "components/ui/buttons/Button";
import InputField from "components/form/fields/InputField";
import SelectField from "components/form/fields/SelectField";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import { Skeleton } from "components/ui/skeleton";
import { AsyncStateView, getAsyncStatus } from "components/ui/async";
import { useToast } from "components/context/ToastContext";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import { getApiErrorCode } from "utils/parseApiError";
import { useBanks } from "features/banks/hooks";
import type { PartnerDetails } from "features/partners/types";
import { usePartnerBankAccount, useCreatePartnerBankAccount, useUpdatePartnerBankAccount } from "../../hooks";
import type { CreatePartnerBankAccountPayload } from "../../types";
import PartnerBankAccountHistory from "./PartnerBankAccountHistory";
import { validateAccountNumber, validateIban } from "../../constants/accountNumberRules";

const CURRENCY_OPTIONS = [
  { value: "RM", label: "RM — Malaysian Ringgit" },
  { value: "USD", label: "USD — US Dollar" },
];

const ERROR_MESSAGES: Record<string, string> = {
  bank_account_not_found: "This bank account no longer exists — it may have been removed elsewhere.",
  bank_account_not_current: "This account was changed elsewhere — refresh and try again.",
};

interface Props {
  partner: PartnerDetails;
}

interface FormData {
  bank_id: string;
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
  bank_id: "",
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
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isMalaysia = partner.country.trim().toLowerCase() === "malaysia";
  const saving = creating || updating;
  const status = getAsyncStatus(loading, error, account, (a) => a === null);

  const bankLookup = useMemo(() => new Map(allBanks.map((b) => [b.id, b])), [allBanks]);
  const bankOptions = useMemo(
    () => allBanks.filter((b) => b.is_active).map((b) => ({ value: b.id, label: b.name })),
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
  };

  const openAdd = () => {
    setFormData(EMPTY_FORM);
    setErrors({});
    setMode("form");
  };

  const openEdit = () => {
    if (!account) return;
    setFormData({
      bank_id: account.bank_id ?? "",
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
    setMode("form");
  };

  const validate = (): Record<string, string> => {
    const next: Record<string, string> = {};
    if (!formData.bank_id) next.bank_id = "Select a bank";
    if (!formData.account_holder_name.trim()) next.account_holder_name = "Account holder name is required";

    const selectedBankCode = bankLookup.get(formData.bank_id)?.code;
    const accountNumberError = validateAccountNumber(formData.account_number, selectedBankCode);
    if (accountNumberError) next.account_number = accountNumberError;

    const ibanError = validateIban(formData.iban);
    if (ibanError) next.iban = ibanError;

    if (!formData.currency) next.currency = "Currency is required";
    // Wire details are required whenever the PARTNER is international,
    // regardless of whether the bank itself is curated or manually
    // entered — the curated list isn't Malaysia-only, and the backend
    // requires these fields for any non-Malaysian partner either way.
    if (!isMalaysia) {
      if (!formData.beneficiary_address.trim()) next.beneficiary_address = "Required for international accounts";
      if (!formData.beneficiary_phone.trim()) next.beneficiary_phone = "Required for international accounts";
      if (!formData.bank_branch_address.trim()) next.bank_branch_address = "Required for international accounts";
      if (!formData.bank_branch_code.trim()) next.bank_branch_code = "Required for international accounts";
    }
    return next;
  };

  const buildPayload = (): CreatePartnerBankAccountPayload => ({
    bank_id: formData.bank_id,
    // Explicitly cleared, not omitted — an account that was previously
    // manually-entered still has these set on the existing row, and PATCH
    // leaves an omitted field untouched (see type comment).
    intl_bank_name: null,
    intl_bank_country: null,
    intl_bank_swift: null,
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
            {!isMalaysia && account && (
              <>
                <DetailRow label="Beneficiary Address" value={account.beneficiary_address} />
                <DetailRow label="Beneficiary Phone" value={account.beneficiary_phone} />
                <DetailRow label="Bank Branch Address" value={account.bank_branch_address} />
                <DetailRow label="Bank Branch Code" value={account.bank_branch_code} />
              </>
            )}
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-200 p-6">
            <Button
              onClick={() => setShowHistory(true)}
              icon={<History className="h-4 w-4" />}
              text="History"
              bgColor="bg-white"
              textColor="text-slate-600"
              borderColor="border-slate-300"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-400"
            />
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
            <SearchableDropdown
              label="Bank"
              field="bank_id"
              placeholder="Search for a bank..."
              options={bankOptions}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />
          </div>

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

          {!isMalaysia && (
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

      <PartnerBankAccountHistory
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        partnerId={partner.id}
      />
    </div>
  );
}
