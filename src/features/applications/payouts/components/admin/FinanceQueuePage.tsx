"use client";

import React, { useEffect, useState } from "react";
import { Wallet, Search, X, Receipt, AlertCircle, CheckCircle } from "lucide-react";

import SearchInput from "components/form/filter/SearchInput";
import { InputField, SelectField, SearchableDropdown } from "components/form";
import StatusFileUpload from "components/form/upload/StatusFileUpload";
import Button from "components/ui/buttons/Button";
import { TableWrapper, TableSkeletonRows, TableEmptyRow, TableErrorRow } from "components/ui/table";
import { getAsyncStatus } from "components/ui/async";
import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";

import { usePartners } from "features/partners/hooks/usePartners";
import type { Partner } from "features/partners/types";
import { usePartnerBankAccount } from "features/partners/bank-accounts";
import { useAllStageStatuses } from "features/applications/hooks";
import { useAdminApplications } from "features/applications/admin/hooks/useAdminApplications";
import { useRecordBulkPayout, usePaymentMethods } from "../../hooks";

export default function FinanceQueuePage() {
  const { showToast } = useToast();

  // --- Partner picker ---
  const [partnerSearch, setPartnerSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(partnerSearch.trim()), 400);
    return () => clearTimeout(t);
  }, [partnerSearch]);

  const { partners, loading: partnersLoading } = usePartners(
    debouncedSearch.length >= 2 && !selectedPartner ? { search: debouncedSearch, page_size: 10 } : {}
  );
  const showPartnerResults = !selectedPartner && debouncedSearch.length >= 2;

  // --- Commission-ready applications for the selected partner ---
  const { stageStatuses } = useAllStageStatuses();
  const commissionReadyStatus = stageStatuses.find((s) => s.name === "Commission Ready");

  const {
    items: applications,
    loading: appsLoading,
    error: appsError,
    refetch: refetchApplications,
  } = useAdminApplications({
    status: "all",
    partner_id: selectedPartner?.id,
    stage_status_id: commissionReadyStatus?.id,
    limit: 100,
  });

  // Defensive client-side filter — the list endpoint may not yet support
  // partner_id/stage_status_id filtering server-side.
  const readyApplications = applications.filter(
    (a) => a.partner_id === selectedPartner?.id && a.status === "Commission Ready"
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [lineAmounts, setLineAmounts] = useState<Record<string, string>>({});

  useEffect(() => {
    setSelectedIds(new Set());
    setLineAmounts({});
  }, [selectedPartner?.id]);

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === readyApplications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(readyApplications.map((a) => a.id)));
    }
  };

  const status = getAsyncStatus(appsLoading, appsError, readyApplications, (r) => r.length === 0);

  // --- Bulk payout form ---
  const { account: partnerBankAccount } = usePartnerBankAccount(selectedPartner?.id ?? "");
  const { recordBulkPayout, loading: recording } = useRecordBulkPayout();
  const { paymentMethods } = usePaymentMethods();
  const paymentMethodOptions = paymentMethods.map((m) => ({ value: m.id, label: m.name }));

  const [formData, setFormData] = useState({
    payment_method_id: "",
    bank_reference: "",
    paid_at: "",
    currency: "RM",
  });
  const [formErrors, setFormErrors] = useState<any>({});
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev: any) => ({ ...prev, [field]: undefined }));
  };

  const selectedApplications = readyApplications.filter((a) => selectedIds.has(a.id));

  const validate = () => {
    const errors: any = {};
    if (!formData.payment_method_id.trim()) errors.payment_method_id = "Payment method is required";
    if (!formData.bank_reference.trim()) errors.bank_reference = "Bank reference is required";
    if (!formData.paid_at) errors.paid_at = "Payment date is required";

    const badLine = selectedApplications.some((a) => {
      const amount = lineAmounts[a.id];
      return !amount || Number(amount) <= 0;
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return false;
    if (selectedApplications.length === 0) {
      showToast("Select at least one application.", "error");
      return false;
    }
    if (badLine) {
      showToast("Enter a valid amount for every selected application.", "error");
      return false;
    }
    if (!partnerBankAccount) {
      showToast("This partner has no active bank account on file.", "error");
      return false;
    }
    if (!receiptFile) {
      showToast("Please upload the payout receipt.", "error");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!selectedPartner || !validate() || !partnerBankAccount || !receiptFile) return;

    try {
      setUploading(true);
      const [presigned] = await getPresignedUploads([receiptFile], "finance-payouts");
      const [uploaded] = await uploadFilesToSpaces([receiptFile], [presigned], (_, percent) =>
        setUploadProgress(percent)
      );
      setUploading(false);

      await recordBulkPayout(selectedPartner.id, {
        bank_account_id: partnerBankAccount.id,
        payment_method_id: formData.payment_method_id.trim(),
        bank_reference: formData.bank_reference.trim(),
        paid_at: formData.paid_at,
        currency: formData.currency,
        receipt_file_key: uploaded.file_key,
        receipt_file_url: uploaded.public_url,
        lines: selectedApplications.map((a) => ({
          application_id: a.id,
          paid_amount: lineAmounts[a.id],
        })),
      });

      showToast("Payout recorded successfully.", "success");
      setSelectedIds(new Set());
      setLineAmounts({});
      setFormData({ payment_method_id: "", bank_reference: "", paid_at: "", currency: "RM" });
      setReceiptFile(null);
      setUploadProgress(0);
      refetchApplications();
    } catch (err: unknown) {
      setUploading(false);
      showToast(parseApiError(err, "Failed to record payout."), "error");
    }
  };

  const isSubmitting = recording || uploading;

  return (
    <section className="mx-auto mt-5 max-w-5xl">
      <div className="rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center gap-x-4 rounded-t-xl border-b px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <Wallet className="text-blue-700" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Finance Queue</h3>
            <p className="text-sm text-slate-500">
              Pick a partner, select their Commission Ready applications, and pay them out together.
            </p>
          </div>
        </div>

        <div className="space-y-6 p-6">
          {/* Partner picker */}
          {!selectedPartner ? (
            <div className="relative">
              <SearchInput
                value={partnerSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPartnerSearch(e.target.value)}
                placeholder="Search for a partner by name or email..."
              />
              {showPartnerResults && (
                <div className="absolute z-10 mt-2 w-full max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {partnersLoading ? (
                    <p className="p-4 text-sm text-slate-500">Searching...</p>
                  ) : partners.length === 0 ? (
                    <p className="p-4 text-sm text-slate-500">No partners found.</p>
                  ) : (
                    partners.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPartner(p);
                          setPartnerSearch("");
                        }}
                        className="flex w-full flex-col items-start px-4 py-3 text-left hover:bg-slate-50"
                      >
                        <span className="text-sm font-medium text-slate-900">{p.name}</span>
                        <span className="text-xs text-slate-500">{p.email}</span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">{selectedPartner.name}</p>
                <p className="text-xs text-slate-500">{selectedPartner.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPartner(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-blue-100"
                aria-label="Change partner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {!selectedPartner && !showPartnerResults && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-12 text-center">
              <Search className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">Search for a partner to see their Commission Ready applications.</p>
            </div>
          )}

          {/* Commission-ready applications table */}
          {selectedPartner && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-p2 font-semibold text-slate-900">Commission Ready Applications</p>
                  {readyApplications.length > 0 && (
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      {selectedIds.size === readyApplications.length ? "Deselect all" : "Select all"}
                    </button>
                  )}
                </div>

                <TableWrapper>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="w-10 px-6 py-4" />
                        <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Student</th>
                        <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Program</th>
                        <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">University</th>
                        <th className="px-6 py-4 text-start font-semibold tracking-wider text-slate-900">Paid Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {status === "loading" && <TableSkeletonRows columns={5} rows={3} />}
                      {status === "error" && (
                        <TableErrorRow colSpan={5} message={appsError ?? undefined} onRetry={refetchApplications} />
                      )}
                      {status === "empty" && (
                        <TableEmptyRow
                          colSpan={5}
                          title="No Commission Ready applications"
                          subtitle="This partner has no applications waiting to be paid out."
                          icon={<Wallet className="h-8 w-8 text-slate-400" />}
                        />
                      )}
                      {status === "success" &&
                        readyApplications.map((a) => {
                          const isSelected = selectedIds.has(a.id);
                          return (
                            <tr key={a.id} className={isSelected ? "bg-blue-50/50" : undefined}>
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelected(a.id)}
                                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                />
                              </td>
                              <td className="px-6 py-4 text-sm font-medium text-slate-900">{a.student_name}</td>
                              <td className="px-6 py-4 text-sm text-slate-700">{a.program_name}</td>
                              <td className="px-6 py-4 text-sm text-slate-700">{a.university_name}</td>
                              <td className="px-6 py-4">
                                <input
                                  type="number"
                                  disabled={!isSelected}
                                  value={lineAmounts[a.id] ?? ""}
                                  onChange={(e) =>
                                    setLineAmounts((prev) => ({ ...prev, [a.id]: e.target.value }))
                                  }
                                  placeholder="Amount"
                                  className="h-9 w-28 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-slate-50"
                                />
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </TableWrapper>
              </div>

              {/* Bulk payout form */}
              {selectedIds.size > 0 && (
                <div className="space-y-4 rounded-lg border border-slate-200 p-5">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-slate-400" />
                    <p className="text-p2 font-semibold text-slate-900">
                      Record Payout for {selectedIds.size} {selectedIds.size === 1 ? "Application" : "Applications"}
                    </p>
                  </div>

                  <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                    {partnerBankAccount ? (
                      <>
                        <span className="font-medium text-slate-900">Paying to:</span>{" "}
                        {partnerBankAccount.intl_bank_name} · {partnerBankAccount.account_number}
                      </>
                    ) : (
                      <span className="text-red-600">This partner has no active bank account on file.</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
                    <SearchableDropdown
                      label="Payment Method"
                      field="payment_method_id"
                      placeholder="Search for a payment method..."
                      options={paymentMethodOptions}
                      formData={formData}
                      errors={formErrors}
                      updateFormData={updateFormData}
                    />
                    <InputField
                      label="Bank Reference"
                      field="bank_reference"
                      placeholder="e.g. BULK-REF-001"
                      formData={formData}
                      errors={formErrors}
                      updateFormData={updateFormData}
                    />
                    <InputField
                      label="Payment Date"
                      field="paid_at"
                      type="date"
                      formData={formData}
                      errors={formErrors}
                      updateFormData={updateFormData}
                    />
                    <SelectField
                      label="Currency"
                      field="currency"
                      options={[
                        { value: "RM", label: "RM" },
                        { value: "USD", label: "USD" },
                      ]}
                      formData={formData}
                      errors={formErrors}
                      updateFormData={updateFormData}
                    />
                  </div>

                  <StatusFileUpload
                    id="finance-queue-receipt"
                    label="Upload Payout Receipt"
                    description="Upload proof of payment (receipt or transfer confirmation)"
                    file={receiptFile}
                    onFileChange={setReceiptFile}
                    onRemove={() => setReceiptFile(null)}
                    uploading={uploading}
                    progress={uploadProgress}
                    disabled={isSubmitting}
                    required
                  />

                  <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 p-4">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-xs leading-relaxed text-amber-800">
                      All-or-nothing — if any application is invalid, nothing is recorded.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      icon={<CheckCircle className="h-4 w-4" />}
                      text={isSubmitting ? "Recording..." : "Record Payout"}
                      bgColor="bg-blue-100"
                      textColor="text-blue-700"
                      borderColor="border-blue-600"
                      hoverTextColor="hover:text-blue-700"
                      hoverBorderColor="hover:border-blue-700"
                      className="hover:bg-blue-200"
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
