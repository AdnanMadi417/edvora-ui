"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, MICRO_DURATION } from "components/ub/core/motion/FadeIn";
import SectionCard from "components/ub/data/cards/SectionCard";
import InstitutionTypeField from "components/ub/forms/choices/InstitutionTypeField";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarPlus,
  ChevronLeft,
  ArrowLeft,
  Pencil,
  Landmark,
  Trash2,
  CreditCard,
} from "lucide-react";

import { useToast } from "components/ub/feedback/notifications/ToastContext";
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
import InputField from "components/ub/forms/text/InputField";
import RichTextEditor from "components/ub/forms/text/RichTextEditor";
import SelectField from "components/ub/forms/selection/SelectField";
import IntakeMonthsField from "features/programs/components/shared/form/IntakeMonthsField";
import ToggleInput from "components/ub/forms/choices/ToggleInput";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";
import ImageUpload from "components/ub/forms/uploads/ImageUpload";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";
import { getDocumentDownloadUrl } from "services/documentService";
import Button from "components/ub/core/buttons/Button";
import Loading from "components/ub/feedback/states/Loading";
import IconButton from "components/ub/core/buttons/IconButton";
import EmptyData from "components/ub/feedback/states/EmptyTableData";
import NoMessagesFound from "components/ub/feedback/states/NoMessagesFound";
import {
  validateUniversity,
  isUniversityComplete,
  universityFieldMap,
} from "./validateUniversity";

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
  is_public: boolean;
  has_language_center: boolean;
  is_hidden: boolean;
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
  is_public: false,
  has_language_center: false,
  is_hidden: false,
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
  is_public: formData.is_public,
  has_language_center: formData.has_language_center,
  is_hidden: formData.is_hidden,
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

const UniversityEdit = ({
  id,
  redirectPath = `/admin/universities/${id}`,
}: Props) => {
  const { showToast } = useToast();
  const reducedMotion = useReducedMotion();
  const router = useRouter();

  const {
    university,
    branches,
    universityLoading,
    refetch: refetchUniversity,
  } = useUniversityDetails(id);
  const { universityPaymentMethods, refetch: refetchPayments } =
    useUniversityPaymentMethods(id);
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
  const [addPaymentForm, setAddPaymentForm] =
    useState<AddPaymentForm>(INITIAL_ADD_PAYMENT);
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [logo, setLogo] = useState<LogoState>(INITIAL_LOGO);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>(
    {}
  );

  const handleSaveApiError = useApiFormErrors({
    fieldMap: universityFieldMap,
    setErrors: (patch) => {
      setErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) =>
      showToast(`Update failed. ${message}`, "error"),
  });

  const handleAssignApiError = useApiFormErrors({
    setErrors: (patch) => {
      setPaymentErrors((prev) => ({ ...prev, ...patch }));
      scrollToFirstError(patch);
    },
    onUnmappedError: (message) =>
      showToast(`Failed to assign payment method. ${message}`, "error"),
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
      branches: (branches ?? []).map((b) => ({
        id: b.id,
        name: b.name ?? "",
        location: b.location ?? "",
        state_id: b.state_id ? String(b.state_id) : "",
      })),
      is_active: university.is_active ?? true,
      university_type_id: university.university_type_id
        ? String(university.university_type_id)
        : "",
      is_public: university.is_public ?? false,
      has_language_center: university.has_language_center ?? false,
      is_hidden: university.is_hidden ?? false,
    };

    setFormData(data);
    setInitialFormData(data);
    setLogo((prev) => ({
      ...prev,
      existingKey: university.logo_file_key ?? "",
    }));

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
        // Upper-cased to match the CURRENCY option values (UBX-395).
        currency: (m.currency ?? "").toUpperCase(),
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

  const isFormValid = useMemo(
    () => isUniversityComplete(formData as any),
    [formData]
  );

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
  }, [
    formData,
    initialFormData,
    logo.modified,
    paymentRows,
    universityPaymentMethods,
  ]);

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
      branches: prev.branches.map((b, i) =>
        i === index ? { ...b, [field]: value } : b
      ),
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
        currency: (method.currency ?? "").toUpperCase(),
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
        `Failed to delete payment method. ${parseApiError(
          error,
          "Please try again."
        )}`,
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

    const { isValid, errors: validationErrors } = validateUniversity(
      formData as any
    );
    if (!isValid) {
      setErrors(validationErrors);
      scrollToFirstError(validationErrors);
      return;
    }

    try {
      const logo_file_key = logo.file ? logo.fileKey : logo.existingKey;
      const logo_file_url = logo.file ? logo.fileUrl : logo.existingUrl;

      await updateUniversity({
        ...normalizePayload(formData),
        logo_file_key,
        logo_file_url,
      });

      if (formData.university_type_id) {
        await assignUniversityType({
          university_type_id: formData.university_type_id,
        });
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

  if (universityLoading)
    return <Loading text="Loading university details..." />;
  if (!university) return <EmptyData />;

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : MICRO_DURATION, ease: EASE }}
      className="mx-auto mt-6 w-full min-w-0 max-w-5xl space-y-5 break-words"
    >
      {/* Header */}
      <div className="flex flex-wrap justify-between gap-4 rounded-ub-xl border border-ub-border bg-ub-surface p-4 shadow-ub-xs sm:p-6">
        <div className="flex min-w-0 flex-wrap items-center gap-4">
          <div className="shrink-0">
            <ImageUpload
              label="University logo"
              id="logo"
              file={logo.file}
              onFileChange={handleLogoSelect}
              onRemove={() =>
                setLogo((prev) => ({
                  ...prev,
                  file: null,
                  fileKey: "",
                  fileUrl: "",
                }))
              }
              uploading={logo.uploading}
              progress={logo.progress}
              existingUrl={logo.existingUrl}
              onExistingRemove={() =>
                setLogo((prev) => ({
                  ...prev,
                  existingUrl: "",
                  existingKey: "",
                  modified: true,
                }))
              }
              error={errors.logo}
            />
          </div>
          <div>
            <h2 className="break-words text-ub-heading-md text-ub-text-primary">
              {university.name}
            </h2>
            <p className="text-sm text-ub-text-tertiary">
              {university.country}
            </p>
            {logo.file && !logo.uploading && (
              <span className="mt-1 inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                Logo ready — click Save Changes
              </span>
            )}
          </div>
        </div>
      </div>

      {/* University details */}
      <SectionCard
        title="Institution details"
        as="h2"
        description="Update the university profile, intakes and availability."
      >
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
              <RichTextEditor
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

          <InstitutionTypeField
            value={formData.is_public}
            onChange={(value) => updateFormData("is_public", value)}
          />

          <ToggleInput
            label="Language Center"
            field="has_language_center"
            formData={formData}
            errors={{}}
            updateFormData={updateFormData}
            enabledText="Yes"
            disabledText="No"
            enabledDescription="This university has a language center."
            disabledDescription="This university does not have a language center."
          />

          <ToggleInput
            label="Visibility"
            field="is_hidden"
            formData={formData}
            errors={{}}
            updateFormData={updateFormData}
            enabledText="Hidden"
            disabledText="Visible"
            enabledDescription="Hidden from advisors — only visible to data-entry and admin."
            disabledDescription="Visible to advisors."
          />
        </div>
      </SectionCard>

      {/* Branches */}
      <section
        aria-label="Campuses and branches"
        className="rounded-ub-xl border border-ub-border bg-ub-surface p-4 sm:p-6"
        data-field="branches"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-ub-heading-md text-ub-text-primary">Branches</h3>
          <IconButton
            title="Add branch"
            icon={<CalendarPlus className="h-4 w-4" />}
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
              className="space-y-5 rounded-ub-lg border border-ub-border bg-ub-surface p-5 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-ub-border pb-3">
                <h4 className="text-sm font-semibold text-ub-text-secondary">
                  Branch {index + 1}
                </h4>
                <IconButton
                  title={`Remove branch ${index + 1}`}
                  icon={<Trash2 className="h-4 w-4" />}
                  disabled={formData.branches.length === 1}
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
      </section>

      {/* Payment methods */}
      <section
        aria-label="University payment methods"
        className="space-y-6 rounded-ub-xl border border-ub-border bg-ub-surface p-4 sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="mb-4 text-ub-heading-md text-ub-text-primary">
            Payment Methods
          </h3>
          <IconButton
            title="Assign payment method"
            icon={<Landmark className="h-4 w-4" />}
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
              className="space-y-4 rounded-ub-lg border border-ub-border bg-ub-surface p-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-ub-border pb-3">
                <h4 className="text-sm font-semibold text-ub-text-secondary">
                  Payment Method {index + 1}
                </h4>
                <IconButton
                  title={`Remove payment method ${index + 1}`}
                  icon={<Trash2 className="h-4 w-4" />}
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
                  updateFormData={(field, value) =>
                    updatePaymentRow(method.id, field, value)
                  }
                />
                <SelectField
                  label="Currency"
                  field="currency"
                  formData={method}
                  errors={{}}
                  options={CURRENCY.map((c) => ({
                    value: c.value,
                    label: c.label,
                  }))}
                  updateFormData={(field, value) =>
                    updatePaymentRow(method.id, field, value)
                  }
                  required={false}
                />
                <div className="md:col-span-2">
                  <RichTextEditor
                    label="Instructions"
                    field="instructions"
                    formData={method}
                    errors={{}}
                    updateFormData={(field, value) =>
                      updatePaymentRow(method.id, field, value)
                    }
                    required={false}
                  />
                </div>
              </div>

              <ToggleInput
                label="Payment Method Status"
                field="is_active"
                formData={method}
                errors={{}}
                updateFormData={(field, value) =>
                  updatePaymentRow(method.id, field, value)
                }
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
              icon={<CreditCard className="h-8 w-8 text-slate-400" />}
            />
          )}
        </div>

        {showAddPayment && (
          <div className="space-y-5 rounded-ub-lg border border-ub-border bg-ub-surface p-5 shadow-sm">
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
                options={CURRENCY.map((c) => ({
                  value: c.value,
                  label: c.label,
                }))}
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
              />
              <Button
                onClick={handleAssign}
                icon={<Landmark className="h-4 w-4" />}
                text="Assign"
              />
            </div>
          </div>
        )}
      </section>

      {/* Footer */}
      <div className="sticky bottom-20 z-20 grid grid-cols-2 gap-3 rounded-ub-lg border border-ub-border bg-ub-surface-raised p-4 shadow-ub-md md:bottom-4">
        <Button
          onClick={handleBack}
          icon={<ArrowLeft className="h-5 w-5" />}
          text="Back"
          variant="secondary"
          className="min-h-[44px]"
        />
        <Button
          onClick={handleSave}
          disabled={
            logo.uploading ||
            updateLoading ||
            !isFormChanged ||
            (isFormChanged && !isFormValid)
          }
          icon={<Pencil className="h-5 w-5" />}
          text="Save changes"
          variant="primary"
          loading={updateLoading}
          className="min-h-[44px]"
        />
      </div>
    </motion.div>
  );
};

export default UniversityEdit;
