"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  ChevronLeft,
  ArrowLeft,
  Pencil,
  Landmark,
  Trash2,
} from "lucide-react";

import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";
import { CURRENCY } from "constants/lists";
import {
  useAssignUniversityType,
  useUniversityDetails,
  useUpdateUniversity,
  useDeleteBranch,
  useUniversityPaymentMethods,
  useUpdateUniversityPaymentMethod,
  useAssignUniversityPaymentMethod,
  useDeleteUniversityPaymentMethod,
  useUniversityTypes,
} from "features/universities/hooks";
import { useAllPaymentMethods } from "features/knowledge-hub/payment-methods/hooks";
import { useStates } from "features/programs/hooks";
import InputField from "components/form/fields/InputField";
import TextareaField from "components/form/fields/TextareaField";
import RichTextEditor from "components/form/fields/RichTextEditor";
import SelectField from "components/form/fields/SelectField";
import IntakeMonthsField from "features/programs/components/shared/form/IntakeMonthsField";
import ToggleInput from "components/form/toggle/ToggleInput";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import ImageUploadField from "components/form/upload/ImageUploadField";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import { getDocumentDownloadUrl } from "services/documentService";
import Button from "components/ui/buttons/Button";
import Loading from "components/loading/Loading";
import IconButton from "components/ui/buttons/IconButton";
import EmptyData from "components/emptyData/EmptyTableData";
import NoMessagesFound from "components/emptyData/NoMessagesFound";
import { validateUniversity, isUniversityComplete, universityFieldMap } from "./validateUniversity";

// ─── Types ───────────────────────────────────────────────────────────────────

type Branch = {
  id?: string;
  name: string;
  location: string;
  state_id: string;
};

type FormData = {
  name: string;
  country: string;
  description: string;
  intake_months: number[];
  is_active: boolean;
  university_type_id: string;
  branches: Branch[];
};

type PaymentRow = {
  id: string;
  university_id: string;
  payment_method_id: string;
  instructions: string;
  currency: string;
  is_active: boolean;
};

type AddPaymentForm = {
  payment_method_id: string;
  currency: string;
  instructions: string;
};

type LogoState = {
  file: File | null;
  uploading: boolean;
  progress: number;
  fileKey: string;
  fileUrl: string;
  existingUrl: string;
  existingKey: string;
  modified: boolean;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const INITIAL_FORM: FormData = {
  name: "",
  country: "",
  description: "",
  intake_months: [],
  branches: [],
  is_active: true,
  university_type_id: "",
};

const INITIAL_LOGO: LogoState = {
  file: null,
  uploading: false,
  progress: 0,
  fileKey: "",
  fileUrl: "",
  existingUrl: "",
  existingKey: "",
  modified: false,
};

const INITIAL_ADD_PAYMENT: AddPaymentForm = {
  payment_method_id: "",
  currency: "",
  instructions: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalizePayload = (formData: FormData) => ({
  name: formData.name.trim(),
  country: formData.country.trim(),
  description: formData.description,
  intake_months: formData.intake_months.filter((m) => Number.isInteger(m)),
  is_active: formData.is_active,
  university_type_id: formData.university_type_id,
  branches: formData.branches
    .filter((b) => b.name && b.location && b.state_id)
    .map((b) => ({
      id: b.id,
      name: b.name.trim(),
      location: b.location.trim(),
      state_id: b.state_id,
    })),
});

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  id: string;
  /** Where "Back" and a successful save should navigate to. Defaults to this university's admin details page. */
  redirectPath?: string;
}

const UniversityEdit = ({ id, redirectPath = `/admin/universities/${id}` }: Props) => {
  const { showToast } = useToast();
  const router = useRouter();

  const { university, branches, universityLoading, refetch: refetchUniversity } = useUniversityDetails(id);
  const { universityPaymentMethods, refetch: refetchPayments } = useUniversityPaymentMethods(id);
  const { paymentMethods } = useAllPaymentMethods();
  const { assignUniversityType } = useAssignUniversityType(id);
  const { universities: universityTypes } = useUniversityTypes();
  const { updateUniversityPaymentMethod } = useUpdateUniversityPaymentMethod();
  const { assignPaymentMethod } = useAssignUniversityPaymentMethod();
  const { deleteUniversityPaymentMethod } = useDeleteUniversityPaymentMethod();
  const { deleteBranch } = useDeleteBranch();
  const { states } = useStates();
  const { updateUniversity, updateLoading } = useUpdateUniversity(id);

  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
  const [initialFormData, setInitialFormData] = useState<FormData | null>(null);
  const [paymentRows, setPaymentRows] = useState<PaymentRow[]>([]);
  const [addPaymentForm, setAddPaymentForm] = useState<AddPaymentForm>(INITIAL_ADD_PAYMENT);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [logo, setLogo] = useState<LogoState>(INITIAL_LOGO);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  const handleSaveApiError = useApiFormErrors({
    fieldMap: universityFieldMap,
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) => showToast(`Update failed. ${message}`, "error"),
  });

  const handleAssignApiError = useApiFormErrors({
    setErrors: (patch) => {
      setPaymentErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) => showToast(`Failed to assign payment method. ${message}`, "error"),
  });

  const stateOptions = useMemo(
    () => states?.map((c) => ({ value: String(c.id), label: c.name })) ?? [],
    [states]
  );

  // ─── Seed form from API ────────────────────────────────────────────────────

  useEffect(() => {
    if (!university) return;

    const data: FormData = {
      name: university.name ?? "",
      country: university.country ?? "",
      description: university.description ?? "",
      intake_months: [...(university.intake_months ?? [])],
      branches: (branches ?? []).map((b: any) => ({
        id: b.id,
        name: b.name ?? "",
        location: b.location ?? "",
        state_id: b.state_id ? String(b.state_id) : "",
      })),
      is_active: university.is_active ?? true,
      university_type_id: university.university_type_id
        ? String(university.university_type_id)
        : "",
    };

    setFormData(data);
    setInitialFormData(data);
    setLogo((prev) => ({ ...prev, existingKey: university.logo_file_key ?? "" }));

    if (university.logo_file_key) {
      getDocumentDownloadUrl(university.logo_file_key)
        .then((url) => setLogo((prev) => ({ ...prev, existingUrl: url })))
        .catch(() => setLogo((prev) => ({ ...prev, existingUrl: "" })));
    }
  }, [university, branches]);

  useEffect(() => {
    if (!universityPaymentMethods) return;
    setPaymentRows(
      universityPaymentMethods.map((m) => ({
        id: m.id,
        university_id: m.university_id,
        payment_method_id: m.payment_method_id,
        instructions: m.instructions,
        currency: m.currency,
        is_active: m.is_active,
      }))
    );
  }, [universityPaymentMethods]);

  // ─── Validation ───────────────────────────────────────────────────────────

  const validateField = useCallback(
    (field: string) => {
      const { errors: allErrors } = validateUniversity(formData as any);
      setErrors((prev) => ({ ...prev, [field]: allErrors[field] ?? "" }));
    },
    [formData]
  );

  const updateFormData = (field: string, value: any) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const isFormValid = useMemo(() => isUniversityComplete(formData as any), [formData]);

  // ID-based comparison so deletions don't corrupt the diff
  const isFormChanged = useMemo(() => {
    if (!initialFormData) return false;

    const universityChanged =
      JSON.stringify(normalizePayload(formData)) !==
      JSON.stringify(normalizePayload(initialFormData));

    const paymentChanged = paymentRows.some((row) => {
      const original = universityPaymentMethods?.find((m) => m.id === row.id);
      if (!original) return true;
      return (
        row.payment_method_id !== original.payment_method_id ||
        row.currency !== original.currency ||
        row.instructions !== original.instructions ||
        row.is_active !== original.is_active
      );
    });

    return universityChanged || logo.modified || paymentChanged;
  }, [formData, initialFormData, logo.modified, paymentRows, universityPaymentMethods]);

  // ─── Branches ─────────────────────────────────────────────────────────────

  const handleAddBranch = () => {
    setFormData((prev) => ({
      ...prev,
      branches: [...prev.branches, { name: "", location: "", state_id: "" }],
    }));
  };

  const updateBranchField = (index: number, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      branches: prev.branches.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
    }));
  };

  const handleRemoveBranch = async (index: number) => {
    const branch = formData.branches[index];
    if (!branch) return;
    try {
      if (branch.id) {
        await deleteBranch(id, branch.id);
        showToast("Branch deleted successfully.", "success");
      }
      setFormData((prev) => ({
        ...prev,
        branches: prev.branches.filter((_, i) => i !== index),
      }));
      refetchUniversity();
    } catch (error: unknown) {
      showToast(
        `Failed to delete branch. ${parseApiError(error, "Please try again.")}`,
        "error"
      );
    }
  };

  // ─── Logo ─────────────────────────────────────────────────────────────────

  const handleLogoSelect = async (file: File) => {
    setLogo((prev) => ({
      ...prev,
      file,
      modified: true,
      uploading: true,
      progress: 0,
      fileKey: "",
      fileUrl: "",
    }));
    try {
      const presigned = await getPresignedUploads([file], "university-logos");
      const results = await uploadFilesToSpaces([file], presigned, (_, pct) => {
        setLogo((prev) => ({ ...prev, progress: pct }));
      });
      const uploaded = results?.[0];
      if (!uploaded?.file_key || !uploaded?.public_url) {
        showToast("Logo upload failed. Please try again.", "error");
        setLogo((prev) => ({ ...prev, file: null, uploading: false }));
        return;
      }
      setLogo((prev) => ({
        ...prev,
        fileKey: uploaded.file_key,
        fileUrl: uploaded.public_url,
        progress: 100,
      }));
      showToast("Logo uploaded successfully.", "success");
    } catch (err: unknown) {
      showToast(parseApiError(err, "Logo upload failed."), "error");
      setLogo((prev) => ({ ...prev, file: null }));
    } finally {
      setLogo((prev) => ({ ...prev, uploading: false }));
    }
  };

  // ─── Payment methods ──────────────────────────────────────────────────────

  const updatePaymentRow = (methodId: string, field: string, value: any) => {
    setPaymentRows((prev) =>
      prev.map((p) => (p.id === methodId ? { ...p, [field]: value } : p))
    );
  };

  const savePaymentRow = async (method: PaymentRow) => {
    try {
      await updateUniversityPaymentMethod(method.university_id, method.id, {
        payment_method_id: method.payment_method_id,
        instructions: method.instructions ?? "",
        currency: method.currency ?? "",
        is_active: method.is_active ?? true,
      });
    } catch {
      // hook already shows the error toast
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      await deleteUniversityPaymentMethod(id, methodId);
      setPaymentRows((prev) => prev.filter((p) => p.id !== methodId));
      showToast("Payment method deleted successfully.", "success");
      refetchPayments();
    } catch (error: unknown) {
      showToast(
        `Failed to delete payment method. ${parseApiError(error, "Please try again.")}`,
        "error"
      );
    }
  };

  const handleAssign = async () => {
    if (!addPaymentForm.payment_method_id) {
      setPaymentErrors({ payment_method_id: "Payment method is required" });
      return;
    }
    try {
      await assignPaymentMethod(id, {
        payment_method_id: addPaymentForm.payment_method_id,
        instructions: addPaymentForm.instructions.trim() || undefined,
        currency: addPaymentForm.currency.trim() || undefined,
        is_active: true,
      });
      showToast("Payment method assigned successfully.", "success");
      setAddPaymentForm(INITIAL_ADD_PAYMENT);
      setPaymentErrors({});
      setShowAddPayment(false);
      refetchPayments();
    } catch (err: unknown) {
      handleAssignApiError(err, "Failed to assign payment method.");
    }
  };

  // ─── Main save ────────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (logo.uploading) {
      showToast("Please wait for the logo to finish uploading.", "error");
      return;
    }

    const { isValid, errors: validationErrors } = validateUniversity(formData as any);
    if (!isValid) {
      setErrors(validationErrors);
      scrollToFirstError(validationErrors);
      return;
    }

    try {
      const logo_file_key = logo.file ? logo.fileKey : logo.existingKey;
      const logo_file_url = logo.file ? logo.fileUrl : logo.existingUrl;

      await updateUniversity({ ...normalizePayload(formData), logo_file_key, logo_file_url });

      if (formData.university_type_id) {
        await assignUniversityType({ university_type_id: formData.university_type_id });
      }

      // Save only rows that actually changed, in parallel
      const changedRows = paymentRows.filter((row) => {
        const original = universityPaymentMethods?.find((m) => m.id === row.id);
        if (!original) return true;
        return (
          row.payment_method_id !== original.payment_method_id ||
          row.currency !== original.currency ||
          row.instructions !== original.instructions ||
          row.is_active !== original.is_active
        );
      });

      if (changedRows.length) {
        await Promise.all(changedRows.map(savePaymentRow));
      }

      showToast("University updated successfully.", "success");
      router.push(redirectPath);
    } catch (error: unknown) {
      handleSaveApiError(error, "Please try again.");
    }
  };

  const handleBack = () => router.push(redirectPath);

  // ─── Render ───────────────────────────────────────────────────────────────

  if (universityLoading) return <Loading text="Loading university details..." />;
  if (!university) return <EmptyData />;

  return (
    <div className="mt-6 max-w-5xl mx-auto rounded-md border bg-white">

      {/* Header */}
      <div className="flex justify-between border-b p-6">
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <ImageUploadField
              label=""
              field="logo"
              imageOnly
              simpleFile={logo.file}
              onSimpleFileChange={handleLogoSelect}
              onSimpleRemove={() =>
                setLogo((prev) => ({ ...prev, file: null, fileKey: "", fileUrl: "" }))
              }
              simpleUploading={logo.uploading}
              simpleProgress={logo.progress}
              existingUrl={logo.existingUrl}
              onExistingRemove={() =>
                setLogo((prev) => ({ ...prev, existingUrl: "", existingKey: "", modified: true }))
              }
              errors={errors}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{university.name}</h2>
            <p className="text-sm text-slate-500">{university.country}</p>
            {logo.file && !logo.uploading && (
              <span className="mt-1 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                Logo ready — click Save Changes
              </span>
            )}
          </div>
        </div>

      </div>

      {/* University details */}
      <div className="space-y-5 px-6 py-6">
        <h3 className="text-sm font-semibold uppercase text-slate-500">Edit University</h3>

        <div className="block">
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <InputField
              label="University Name"
              field="name"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("name")}
            />
            <InputField
              label="Country"
              field="country"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("country")}
            />
            <div className="md:col-span-2">
              <TextareaField
                label="Description"
                field="description"
                placeholder="Brief university description..."
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                required={false}
              />
            </div>
          </div>

          <IntakeMonthsField
            field="intake_months"
            label="Intake Months"
            required={false}
            formData={formData}
            errors={errors}
            updateFormData={updateFormData}
          />

          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <SelectField
              label="University Type"
              field="university_type_id"
              required
              options={universityTypes.map((type) => ({
                value: String(type.id),
                label: type.name,
              }))}
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              onBlur={() => validateField("university_type_id")}
            />
          </div>

          <ToggleInput
            label="University Status"
            field="is_active"
            formData={formData}
            errors={{}}
            updateFormData={updateFormData}
            enabledText="Active"
            disabledText="Inactive"
            enabledDescription="This university is visible and available for applications."
            disabledDescription="This university is hidden and unavailable for new applications."
          />
        </div>
      </div>

      {/* Branches */}
      <div className="border-t px-6 py-6" data-field="branches">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase text-slate-500">Branches</h3>
          <IconButton
            icon={<CalendarPlus className="h-4 w-4" />}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleAddBranch}
          />
        </div>

        {errors.branches && (
          <p className="mb-3 text-xs text-red-600">{errors.branches}</p>
        )}

        <div className="grid grid-cols-1 gap-4">
          {formData.branches.map((branch, index) => (
            <div
              key={branch.id ?? index}
              className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-semibold text-slate-700">Branch {index + 1}</h4>
                <IconButton
                  icon={<Trash2 className="h-4 w-4" />}
                  disabled={formData.branches.length === 1}
                  bgColor="bg-red-50"
                  textColor="text-red-700"
                  borderColor="border-red-200"
                  hoverTextColor="hover:text-red-800"
                  hoverBorderColor="hover:border-red-300"
                  onClick={() => handleRemoveBranch(index)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InputField
                  label="Branch Name"
                  placeholder="e.g Branch Name"
                  field="name"
                  dataField={`branches[${index}].name`}
                  formData={branch}
                  errors={{ name: errors[`branches[${index}].name`] }}
                  updateFormData={(f, v) => {
                    setErrors((prev) => {
                      const n = { ...prev };
                      delete n[`branches[${index}].name`];
                      return n;
                    });
                    updateBranchField(index, f, v);
                  }}
                  onBlur={() => validateField(`branches[${index}].name`)}
                />
                <InputField
                  label="Location"
                  placeholder="e.g Location"
                  field="location"
                  dataField={`branches[${index}].location`}
                  formData={branch}
                  errors={{ location: errors[`branches[${index}].location`] }}
                  updateFormData={(f, v) => {
                    setErrors((prev) => {
                      const n = { ...prev };
                      delete n[`branches[${index}].location`];
                      return n;
                    });
                    updateBranchField(index, f, v);
                  }}
                  onBlur={() => validateField(`branches[${index}].location`)}
                />
                <SearchableDropdown
                  label="State"
                  field="state_id"
                  dataField={`branches[${index}].state_id`}
                  options={stateOptions}
                  formData={{ state_id: branch.state_id }}
                  errors={{ state_id: errors[`branches[${index}].state_id`] }}
                  updateFormData={(f, v) => {
                    setErrors((prev) => {
                      const n = { ...prev };
                      delete n[`branches[${index}].state_id`];
                      return n;
                    });
                    updateBranchField(index, f, v);
                  }}

                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment methods */}
      <div className="space-y-6 border-t px-6 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="mb-4 text-sm font-semibold uppercase text-slate-500">Payment Methods</h3>
          <IconButton
            icon={<Landmark className="h-4 w-4" />}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={() => {
              setAddPaymentForm(INITIAL_ADD_PAYMENT);
              setPaymentErrors({});
              setShowAddPayment((prev) => !prev);
            }}
          />
        </div>

        <div className="grid grid-cols-1 space-y-6">
          {paymentRows.map((method, index) => (
            <div
              key={method.id}
              className="space-y-4 rounded-md border bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-semibold text-slate-700">
                  Payment Method {index + 1}
                </h4>
                <IconButton
                  icon={<Trash2 className="h-4 w-4" />}
                  bgColor="bg-red-50"
                  textColor="text-red-700"
                  borderColor="border-red-200"
                  hoverTextColor="hover:text-red-800"
                  hoverBorderColor="hover:border-red-300"
                  onClick={() => handleDeletePaymentMethod(method.id)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SelectField
                  label="Payment Method"
                  field="payment_method_id"
                  required
                  options={paymentMethods.map((m) => ({
                    value: String(m.id),
                    label: m.name,
                  }))}
                  formData={method}
                  errors={{}}
                  updateFormData={(field, value) => updatePaymentRow(method.id, field, value)}
                />
                <SelectField
                  label="Currency"
                  field="currency"
                  formData={method}
                  errors={{}}
                  options={CURRENCY.map((c) => ({ value: c.value, label: c.label }))}
                  updateFormData={(field, value) => updatePaymentRow(method.id, field, value)}
                  required={false}
                />
                <div className="md:col-span-2">
                  <RichTextEditor
                    label="Instructions"
                    field="instructions"
                    formData={method}
                    errors={{}}
                    updateFormData={(field, value) => updatePaymentRow(method.id, field, value)}
                    required={false}
                  />
                </div>
              </div>

              <ToggleInput
                label="Payment Method Status"
                field="is_active"
                formData={method}
                errors={{}}
                updateFormData={(field, value) => updatePaymentRow(method.id, field, value)}
                enabledText="Active"
                disabledText="Inactive"
                enabledDescription="This payment method is available for use."
                disabledDescription="This payment method is hidden from selection."
              />
            </div>
          ))}

          {paymentRows.length === 0 && (
            <NoMessagesFound
              title="No payment methods assigned"
              subtitle="Assign a payment method to allow universities to accept payments."
            />
          )}
        </div>

        {showAddPayment && (
          <div className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SearchableDropdown
                label="Payment Method"
                field="payment_method_id"
                required
                options={paymentMethods.map((p) => ({
                  value: String(p.id),
                  label: p.name,
                }))}
                disabledOptions={universityPaymentMethods.map((p) =>
                  String(p.payment_method_id)
                )}
                formData={addPaymentForm}
                errors={paymentErrors}
                updateFormData={(field, value) =>
                  setAddPaymentForm((prev) => ({ ...prev, [field]: value }))
                }
              />
              <SelectField
                label="Currency"
                field="currency"
                options={CURRENCY.map((c) => ({ value: c.value, label: c.label }))}
                formData={addPaymentForm}
                errors={paymentErrors}
                required={false}
                updateFormData={(field, value) =>
                  setAddPaymentForm((prev) => ({ ...prev, [field]: value }))
                }
              />
              <div className="md:col-span-2">
                <RichTextEditor
                  label="Instructions"
                  field="instructions"
                  placeholder="Optional payment instructions..."
                  formData={addPaymentForm}
                  errors={paymentErrors}
                  required={false}
                  updateFormData={(field, value) =>
                    setAddPaymentForm((prev) => ({ ...prev, [field]: value }))
                  }
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                onClick={() => {
                  setShowAddPayment(false);
                  setAddPaymentForm(INITIAL_ADD_PAYMENT);
                  setPaymentErrors({});
                }}
                text="Cancel"
                bgColor="bg-slate-50"
                textColor="text-slate-700"
                borderColor="border-slate-600"
                hoverTextColor="hover:text-slate-800"
                hoverBorderColor="hover:border-slate-700"
              />
              <Button
                onClick={handleAssign}
                icon={<Landmark className="h-4 w-4" />}
                text="Assign"
                bgColor="bg-blue-50"
                textColor="text-blue-700"
                borderColor="border-blue-600"
                hoverTextColor="hover:text-blue-800"
                hoverBorderColor="hover:border-blue-700"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex gap-3 border-t border-slate-200 px-6 py-4">
        <Button
          onClick={handleBack}
          icon={<ArrowLeft className="h-5 w-5" />}
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
          disabled={logo.uploading || updateLoading || !isFormChanged || (isFormChanged && !isFormValid)}
          icon={<Pencil className="h-5 w-5" />}
          text={updateLoading ? "Updating..." : "Save Changes"}
          bgColor="bg-blue-600"
          textColor="text-white"
          borderColor="border-blue-600"
          hoverTextColor="hover:text-white"
          hoverBorderColor="hover:border-blue-700"
          className="flex-1 hover:bg-blue-700"
        />
      </div>

    </div>
  );
};

export default UniversityEdit;
