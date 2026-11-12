"use client";

import CommissionFields from "features/programs/components/shared/CommissionFields";
import { BookOpen, CalendarPlus, Plus, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import { useRouter } from "next/navigation";

import { IELTS_BANDS, MONTHS } from "constants/lists";
import {
  DEFAULT_COMMISSION_CURRENCY,
  normalizeCommissionCurrency,
} from "features/programs/utils/commissionCurrency";
import { type Currency, type CourseType } from "features/programs/types";

import { useCreateProgram } from "features/programs/hooks";
import { useUniversities, useBranches } from "features/universities/hooks";
import { useAllFields } from "features/knowledge-hub/field-of-study/hooks";
import { useCommissionTypes } from "features/knowledge-hub/commission/hooks";
import { useAllQualifications } from "features/knowledge-hub/qualifications/hooks";

import InputField from "components/ub/forms/text/InputField";
import RichTextEditor from "components/ub/forms/text/RichTextEditor";
import SelectField from "components/ub/forms/selection/SelectField";
import YearlyFeesField from "features/programs/components/shared/YearlyFeesField";
import OneTimeFeesField from "features/programs/components/shared/OneTimeFeesField";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";
import ToggleInput from "components/ub/forms/choices/ToggleInput";
import SteppedFormPage from "components/ub/forms/layout/SteppedFormPage";
import DescriptionList from "components/ub/data/display/DescriptionList";
import SectionCard from "components/ub/data/cards/SectionCard";
import RichTextDisplay from "components/ub/data/display/RichTextDisplay";
import Amount from "components/ub/core/typography/Amount";
import Alert from "components/ub/feedback/notifications/Alert";
import { monthLabel } from "features/programs/utils/intakeMonths";
import IntakeMonthsField from "features/programs/components/shared/form/IntakeMonthsField";
import {
  useUnsavedChangesGuard,
  confirmDiscard,
} from "features/programs/components/shared/form/useUnsavedChangesGuard";
import {
  COURSE_TYPE_OPTIONS,
  isMasterOrPhd,
} from "features/programs/utils/courseType";
import { setFormPath } from "features/programs/components/shared/form/setFormPath";
import { useIsFormDirty } from "features/programs/components/shared/form/useIsFormDirty";

import IconButton from "components/ub/core/buttons/IconButton";
import { validateProgram } from "./validateProgram";
import { fieldGroup } from "components/ub/recipes";

export interface FormData {
  name: string;
  uni_id: string;
  branch_id: string;
  field_of_study_id: string;
  tuition_fee: number;
  intake_months: number[];
  duration: number;
  english_required_score: string;
  overview: string;
  curriculum: string;
  is_on_campus: boolean;
  is_online: boolean;
  has_scholarship: boolean;
  commission_amount: number;
  commission_currency: string;
  commission_type_id: string;
  commission_notes: string;
  expected_commission_from: string;
  expected_commission_to: string;
  qualification_id: string;
  // Only meaningful when the selected qualification is master/phd; cleared
  // otherwise.
  course_type: CourseType | null;
  yearly_fee_currency: string;
  yearly_fees: Array<{ year: number; fee: number }>;
  one_time_fees: Array<{ description: string; fee: number; currency: string }>;
  scholarships: Array<{
    type: number;
    coverage_percent: number;
    max_amount: number;
    name: string;
    description: string;
    conditions: string[];
  }>;
}

type FormErrors = Record<string, string>;
const stepForField = (field: string): number => {
  if (
    /^(tuition_fee|commission_|expected_commission_|yearly_fee|one_time_fee)/.test(
      field
    )
  )
    return 1;
  if (field === "intake_months" || field === "english_required_score") return 2;
  if (field.startsWith("scholarships") || field === "has_scholarship") return 3;
  return 0;
};

const emptyFormData: FormData = {
  name: "",
  uni_id: "",
  branch_id: "",
  field_of_study_id: "",
  tuition_fee: 0,
  intake_months: [],
  duration: 0,
  english_required_score: "0",
  overview: "",
  curriculum: "",
  is_on_campus: true,
  is_online: false,
  has_scholarship: false,
  commission_type_id: "",
  commission_currency: DEFAULT_COMMISSION_CURRENCY,
  commission_notes: "",
  commission_amount: 0,
  expected_commission_from: "",
  expected_commission_to: "",
  qualification_id: "",
  course_type: null,
  yearly_fee_currency: "MYR",
  yearly_fees: [],
  one_time_fees: [],
  scholarships: [],
};

interface Props {
  basePath?: string;
}

export default function RegisterProgram({
  basePath = "/admin/knowledge-hub",
}: Props = {}) {
  const { showToast } = useToast();
  const router = useRouter();

  const { createProgram, loading } = useCreateProgram();
  const { commissionTypes } = useCommissionTypes();

  const [errors, setErrors] = useState<FormErrors>({});
  const [currentStep, setCurrentStep] = useState(0);

  const [formData, setFormData] = useState<FormData>(emptyFormData);

  const { fields } = useAllFields();
  const { qualifications } = useAllQualifications();
  const { branches } = useBranches(formData.uni_id);
  const { universities } = useUniversities();

  // The dirty-check baseline starts as emptyFormData but tracks the same
  // auto-populated defaults formData does (e.g. commission_type_id below) —
  // otherwise a legitimate default that arrives after mount makes the form
  // look "changed" against a baseline that never learns about it, and
  // Cancel prompts "unsaved changes" on a completely untouched form.
  const [dirtyBaseline, setDirtyBaseline] = useState<FormData>(emptyFormData);
  const isDirty = useIsFormDirty(formData, dirtyBaseline);
  useUnsavedChangesGuard(isDirty);

  useEffect(() => {
    if (commissionTypes.length > 0) {
      const typeId = String(commissionTypes[0].id);
      setFormData((prev) => ({ ...prev, commission_type_id: typeId }));
      setDirtyBaseline((prev) => ({ ...prev, commission_type_id: typeId }));
    }
  }, [commissionTypes]);

  useEffect(() => {
    setFormData((prev) => {
      const stillValid = branches?.some(
        (branch) => String(branch.id) === String(prev.branch_id)
      );
      if (stillValid) return prev;
      const branchId = branches?.length === 1 ? String(branches[0].id) : "";
      return prev.branch_id === branchId
        ? prev
        : { ...prev, branch_id: branchId };
    });
    setErrors((prev) => {
      if (!prev.branch_id) return prev;
      const next = { ...prev };
      delete next.branch_id;
      return next;
    });
  }, [branches]);

  const validateStep = (step: number) => {
    const stepErrors = Object.fromEntries(
      Object.entries(validateProgram(formData).errors).filter(
        ([field]) => stepForField(field) === step
      )
    );
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const validateField = React.useCallback(
    (field: string, overrideValue?: any) => {
      const data =
        overrideValue !== undefined
          ? { ...formData, [field]: overrideValue }
          : formData;
      const { errors: allErrors } = validateProgram(data);
      setErrors((prev) => ({ ...prev, [field]: allErrors[field] }));
    },
    [formData]
  );

  const updateFormData = (field: string, value: any) => {
    setErrors((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(
          ([key]) => key !== field && !key.startsWith(`${field}[`)
        )
      )
    );

    setFormData((prev) => {
      const updated = setFormPath(prev, field, value);

      if (field === "is_on_campus" && value === true) updated.is_online = false;
      if (field === "is_online" && value === true) updated.is_on_campus = false;
      if (field === "is_on_campus" && value === false) updated.is_online = true;
      if (field === "is_online" && value === false) updated.is_on_campus = true;
      if (
        field === "has_scholarship" &&
        value === true &&
        updated.scholarships.length === 0
      ) {
        updated.scholarships = [
          {
            type: 1,
            coverage_percent: 0,
            max_amount: 0,
            name: "",
            description: "",
            conditions: [],
          },
        ];
      }
      if (field === "has_scholarship" && value === false)
        updated.scholarships = [];
      if (field === "qualification_id") {
        const nextQualification = qualifications.find(
          (q) => String(q.id) === String(value)
        );
        if (!isMasterOrPhd(nextQualification?.name)) updated.course_type = null;
      }

      return updated;
    });
  };

  const removeScholarship = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      scholarships: prev.scholarships.filter((_, i) => i !== index),
    }));
  };

  const addScholarship = () => {
    setFormData((prev) => ({
      ...prev,
      scholarships: [
        ...prev.scholarships,
        {
          type: 1,
          coverage_percent: 0,
          max_amount: 0,
          name: "",
          description: "",
          conditions: [],
        },
      ],
    }));
  };

  const buildPayload = () => ({
    ...formData,
    tuition_fee: Number(formData.tuition_fee || 0),
    duration: Number(formData.duration || 0),
    qualification_id: formData.qualification_id,
    // Recomputed from the current qualification rather than trusted from
    // formData alone — a previous university selection could leave a stale pairing.
    course_type: isMasterOrPhd(selectedQualification?.name)
      ? formData.course_type
      : null,
    commission_amount: Number(formData.commission_amount || 0),
    commission_currency: normalizeCommissionCurrency(
      formData.commission_currency
    ),
    expected_commission_from: formData.expected_commission_from
      ? Number(formData.expected_commission_from)
      : null,
    expected_commission_to: formData.expected_commission_to
      ? Number(formData.expected_commission_to)
      : null,
    yearly_fee_currency: (formData.yearly_fee_currency || "MYR") as Currency,
    yearly_fees: (formData.yearly_fees || []).map((y) => ({
      year: Number(y.year),
      fee: Number(y.fee),
    })),
    one_time_fees: (formData.one_time_fees || []).map((f: any) => ({
      description: f.description || "",
      fee: Number(f.fee || 0),
      currency: (f.currency || "MYR") as Currency,
    })),
    scholarships: formData.has_scholarship
      ? (formData.scholarships || [])
          .filter((s) => s.name && s.description)
          .map((s) => ({
            coverage_percent: Number(s.coverage_percent || 0),
            max_amount: Number(s.max_amount || 0),
            name: s.name,
            description: s.description,
            conditions: Array.isArray(s.conditions) ? s.conditions : [],
          }))
      : [],
  });

  const focusFirstError = (validationErrors: FormErrors) => {
    const first = Object.keys(validationErrors).find(
      (field) => validationErrors[field]
    );
    if (first) setCurrentStep(stepForField(first));
  };

  const handleSubmit = async () => {
    const { isValid, errors: validationErrors } = validateProgram(formData);
    if (!isValid) {
      setErrors(validationErrors);
      focusFirstError(validationErrors);
      showToast(
        "Please fix the highlighted fields before publishing.",
        "error"
      );
      return;
    }
    try {
      await createProgram(buildPayload());
      showToast("Program created successfully", "success");
      setTimeout(() => router.push(basePath), 1500);
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Failed to create program. ${backendMessage}`, "error");
    }
  };

  // ── Live preview data ──────────────────────────────────────────────────
  const selectedUniversity = universities?.find(
    (u) => String(u.id) === String(formData.uni_id)
  );
  const selectedBranch = branches?.find(
    (b) => String(b.id) === String(formData.branch_id)
  );
  const selectedQualification = qualifications?.find(
    (q) => String(q.id) === String(formData.qualification_id)
  );
  return (
    <>
      <SteppedFormPage
        title="Create program"
        description="Define the programme, set its fees and requirements, then review before publishing."
        icon={BookOpen}
        currentStep={currentStep}
        onStepChange={setCurrentStep}
        onCancel={() => confirmDiscard(isDirty, () => router.push(basePath))}
        onSubmit={handleSubmit}
        submitLabel="Create program"
        submitting={loading}
        steps={[
          {
            id: "programme",
            label: "Programme",
            description: "Details and institution",
            validate: () => validateStep(0),
            content: (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <InputField
                      label="Program name"
                      field="name"
                      placeholder="e.g. BSc Data Science"
                      required
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                      onBlur={() => validateField("name")}
                    />
                    <p className="mt-1 text-xs text-ub-text-tertiary">
                      Use the official programme name, with at least 3
                      characters.
                    </p>
                  </div>

                  <SearchableDropdown
                    label="Qualification level"
                    field="qualification_id"
                    required
                    options={qualifications.map((f) => ({
                      value: String(f.id),
                      label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
                    }))}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    onSelect={(v: string) =>
                      validateField("qualification_id", v)
                    }
                  />

                  {isMasterOrPhd(selectedQualification?.name) && (
                    <SelectField
                      label="Course type"
                      field="course_type"
                      required={false}
                      options={COURSE_TYPE_OPTIONS}
                      formData={formData}
                      errors={errors}
                      updateFormData={(f: string, v: string) =>
                        updateFormData(f, v || null)
                      }
                    />
                  )}

                  <SearchableDropdown
                    label="Field of study"
                    field="field_of_study_id"
                    required
                    options={fields.map((f) => ({
                      value: String(f.id),
                      label: f.name,
                    }))}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    onSelect={(v: string) =>
                      validateField("field_of_study_id", v)
                    }
                  />

                  <InputField
                    label="Duration (Years)"
                    field="duration"
                    type="number"
                    placeholder="e.g. 2"
                    required={false}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    onBlur={() => validateField("duration")}
                  />

                  <div className="md:col-span-2">
                    <ToggleInput
                      label="Delivery mode"
                      field="is_on_campus"
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                      enabledText="On campus"
                      disabledText="Online"
                      enabledDescription="Students attend this program in person."
                      disabledDescription="Students attend this program online."
                    />
                  </div>
                </div>
                <section
                  className="border-t border-ub-border pt-6"
                  aria-label="Institution and campus"
                >
                  <h3 className="mb-4 text-ub-heading-sm text-ub-text-primary">
                    Institution and campus
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <SearchableDropdown
                      label="University"
                      field="uni_id"
                      required
                      options={(universities ?? [])
                        .filter((u) => u.is_active)
                        .map((u) => ({ value: u.id, label: u.name }))}
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                      onSelect={(v: string) => validateField("uni_id", v)}
                    />

                    {branches.length > 1 && (
                      <SearchableDropdown
                        label="Branch"
                        field="branch_id"
                        options={branches.map((s) => ({
                          value: String(s.id),
                          label: s.name,
                        }))}
                        formData={formData}
                        errors={errors}
                        updateFormData={updateFormData}
                      />
                    )}
                  </div>
                </section>
              </div>
            ),
          },
          {
            id: "fees",
            label: "Fees",
            description: "Tuition and commission",
            validate: () => validateStep(1),
            content: (
              <div className="space-y-6">
                <YearlyFeesField
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <OneTimeFeesField
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <CommissionFields
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  validateField={validateField}
                  showTiming={true}
                />
              </div>
            ),
          },
          {
            id: "requirements",
            label: "Requirements",
            description: "Intakes and English",
            validate: () => validateStep(2),
            content: (
              <div className="space-y-6">
                <IntakeMonthsField
                  field="intake_months"
                  label="Intake months"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <SelectField
                  label="IELTS Required Score"
                  field="english_required_score"
                  required={false}
                  options={IELTS_BANDS.map((s) => ({
                    label: s.label,
                    value: s.score,
                  }))}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
              </div>
            ),
          },
          {
            id: "scholarships",
            label: "Scholarships",
            description: "Optional student support",
            validate: () => validateStep(3),
            content: (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-ub-full border border-ub-border p-1">
                    <button
                      type="button"
                      onClick={() => updateFormData("has_scholarship", true)}
                      className={`rounded-ub-full px-4 py-2 text-sm font-medium transition ${
                        formData.has_scholarship
                          ? "bg-ub-tone-warning-bg text-ub-tone-warning-text ring-1 ring-ub-tone-warning-border shadow-sm"
                          : "text-ub-text-secondary hover:bg-ub-surface-subtle"
                      }`}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFormData("has_scholarship", false)}
                      className={`rounded-ub-full px-4 py-2 text-sm font-medium transition ${
                        !formData.has_scholarship
                          ? "bg-ub-tone-neutral-bg text-ub-tone-neutral-text ring-1 ring-ub-tone-neutral-border shadow-sm"
                          : "text-ub-text-secondary hover:bg-ub-surface-subtle"
                      }`}
                    >
                      None
                    </button>
                  </div>
                  {formData.has_scholarship && (
                    <IconButton
                      title="Add scholarship"
                      icon={<CalendarPlus className="h-4 w-4" />}
                      variant="secondary"
                      onClick={addScholarship}
                    />
                  )}
                </div>

                {formData.has_scholarship && (
                  <div className="space-y-6">
                    {formData.scholarships.map((_, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-ub-border bg-ub-surface p-6 transition"
                      >
                        <div className="mb-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ub-tone-warning-bg text-sm font-semibold text-ub-tone-warning-text">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-ub-text-primary">
                                Scholarship
                              </p>
                              <p className="text-xs text-ub-text-secondary">
                                Configure scholarship details
                              </p>
                            </div>
                          </div>
                          {formData.scholarships.length > 1 && (
                            <IconButton
                              title="Remove scholarship"
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => removeScholarship(index)}
                              bgColor="bg-ub-tone-danger-bg"
                              textColor="text-ub-tone-danger-text"
                              borderColor="border-ub-tone-danger-border"
                              hoverTextColor="hover:text-ub-tone-danger-text"
                              hoverBorderColor="hover:border-ub-tone-danger-border"
                            />
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div className="md:col-span-2">
                            <InputField
                              label="Scholarship name"
                              field={`scholarships[${index}].name`}
                              placeholder="e.g. Excellence Award"
                              type="text"
                              formData={formData}
                              errors={errors}
                              updateFormData={updateFormData}
                              onBlur={() =>
                                validateField(`scholarships[${index}].name`)
                              }
                            />
                          </div>

                          <InputField
                            label="Coverage percentage"
                            field={`scholarships[${index}].coverage_percent`}
                            type="number"
                            placeholder="e.g. 50"
                            required={false}
                            formData={formData}
                            errors={errors}
                            updateFormData={updateFormData}
                          />

                          <InputField
                            label="Maximum amount"
                            field={`scholarships[${index}].max_amount`}
                            type="number"
                            placeholder="e.g. 10000"
                            required={false}
                            formData={formData}
                            errors={errors}
                            updateFormData={updateFormData}
                          />

                          <div className="md:col-span-2">
                            <RichTextEditor
                              label="Description"
                              field={`scholarships[${index}].description`}
                              placeholder="Short description..."
                              formData={formData}
                              errors={errors}
                              updateFormData={updateFormData}
                            />
                          </div>

                          <div className="md:col-span-2 space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold tracking-wide text-ub-text-secondary">
                                Conditions
                              </h3>
                              <IconButton
                                title="Add condition"
                                icon={<Plus className="h-4 w-4" />}
                                variant="secondary"
                                onClick={() =>
                                  updateFormData(
                                    `scholarships[${index}].conditions`,
                                    [
                                      ...formData.scholarships[index]
                                        .conditions,
                                      "",
                                    ]
                                  )
                                }
                              />
                            </div>

                            {formData.scholarships[index].conditions.length ===
                            0 ? (
                              <p className="text-sm text-ub-text-tertiary">
                                No conditions added yet.
                              </p>
                            ) : (
                              <div className="space-y-2">
                                {formData.scholarships[index].conditions.map(
                                  (condition, cIndex) => (
                                    <div
                                      key={cIndex}
                                      className={`${fieldGroup} flex min-h-[50px] items-center gap-2 ps-[17px] pe-2`}
                                    >
                                      <input
                                        value={condition}
                                        onChange={(e) =>
                                          updateFormData(
                                            `scholarships[${index}].conditions[${cIndex}]`,
                                            e.target.value
                                          )
                                        }
                                        placeholder={`Condition ${cIndex + 1}`}
                                        className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--ub-field-placeholder)]"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateFormData(
                                            `scholarships[${index}].conditions`,
                                            formData.scholarships[
                                              index
                                            ].conditions.filter(
                                              (_, i) => i !== cIndex
                                            )
                                          )
                                        }
                                        aria-label="Remove condition"
                                  className="text-ub-tone-danger-text transition hover:text-ub-tone-danger-text"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ),
          },
        ]}
        review={
          <div className="space-y-4">
            <Alert tone="info" title="Ready to publish">
              Check the programme details, fees, and scholarships. Use Back or a
              completed step to make changes.
            </Alert>
            <SectionCard title="Programme">
              <DescriptionList
                columns={2}
                fallback="Not provided"
                items={[
                  { label: "Name", value: formData.name, fullWidth: true },
                  {
                    label: "Qualification",
                    value: selectedQualification?.name,
                  },
                  {
                    label: "Field of study",
                    value: fields.find(
                      (field) => String(field.id) === formData.field_of_study_id
                    )?.name,
                  },
                  {
                    label: "Duration",
                    value: formData.duration
                      ? `${formData.duration} years`
                      : null,
                  },
                  {
                    label: "Delivery",
                    value: formData.is_on_campus ? "On campus" : "Online",
                  },
                  { label: "Institution", value: selectedUniversity?.name },
                  { label: "Branch", value: selectedBranch?.name },
                  ...(isMasterOrPhd(selectedQualification?.name)
                    ? [
                        {
                          label: "Course type",
                          value: COURSE_TYPE_OPTIONS.find(
                            (option) => option.value === formData.course_type
                          )?.label,
                        },
                      ]
                    : []),
                ]}
              />
            </SectionCard>
            <SectionCard title="Fees and commission">
              <DescriptionList
                columns={2}
                fallback="Not set"
                items={[
                  ...formData.yearly_fees.map((row) => ({
                    label: `Year ${row.year}`,
                    value: (
                      <Amount
                        value={Number(row.fee)}
                        currency={formData.yearly_fee_currency}
                      />
                    ),
                  })),
                  ...formData.one_time_fees.map((row) => ({
                    label: row.description,
                    value: (
                      <Amount value={Number(row.fee)} currency={row.currency} />
                    ),
                  })),
                  {
                    label: "Commission amount",
                    value: (
                      <Amount
                        value={Number(formData.commission_amount)}
                        currency={normalizeCommissionCurrency(
                          formData.commission_currency
                        )}
                      />
                    ),
                  },
                  {
                    label: "Commission type",
                    value: commissionTypes.find(
                      (type) => String(type.id) === formData.commission_type_id
                    )?.name,
                  },
                  {
                    label: "Expected from",
                    value: MONTHS.find(
                      (month) =>
                        String(month.value) ===
                        String(formData.expected_commission_from)
                    )?.label,
                  },
                  {
                    label: "Expected to",
                    value: MONTHS.find(
                      (month) =>
                        String(month.value) ===
                        String(formData.expected_commission_to)
                    )?.label,
                  },
                  {
                    label: "Commission notes",
                    value: formData.commission_notes,
                    fullWidth: true,
                  },
                ]}
              />
            </SectionCard>
            <SectionCard title="Intakes and requirements">
              <DescriptionList
                columns={2}
                fallback="Not set"
                items={[
                  {
                    label: "Intake months",
                    value: formData.intake_months
                      .map((month) => monthLabel(month, false))
                      .join(", "),
                  },
                  {
                    label: "IELTS score",
                    value: IELTS_BANDS.find(
                      (band) =>
                        String(band.score) ===
                        String(formData.english_required_score)
                    )?.label,
                  },
                ]}
              />
            </SectionCard>
            <SectionCard title="Scholarships">
              {formData.has_scholarship ? (
                formData.scholarships.map((scholarship, index) => (
                  <div
                    key={index}
                    className="space-y-3 border-b border-ub-border py-4 first:pt-0 last:border-0 last:pb-0"
                  >
                    <DescriptionList
                      columns={2}
                      items={[
                        { label: "Name", value: scholarship.name },
                        {
                          label: "Coverage",
                          value: `${scholarship.coverage_percent}%`,
                        },
                        {
                          label: "Maximum amount",
                          value: (
                            <Amount
                              value={Number(scholarship.max_amount)}
                              currency={formData.yearly_fee_currency}
                            />
                          ),
                        },
                        {
                          label: "Conditions",
                          value:
                            scholarship.conditions.filter(Boolean).join("; ") ||
                            "None",
                        },
                      ]}
                    />
                    <RichTextDisplay html={scholarship.description} />
                  </div>
                ))
              ) : (
                <p className="text-ub-body-sm text-ub-text-secondary">
                  No scholarships offered.
                </p>
              )}
            </SectionCard>
          </div>
        }
      />
    </>
  );
}
