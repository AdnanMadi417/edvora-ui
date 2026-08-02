"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  Trash2,
  MoreVertical,
  ChevronLeft,
  CalendarPlus,
  Pencil,
  Plus,
} from "lucide-react";

import { IELTS_BANDS, MONTHS, CURRENCY } from 'constants/lists';

import { useToast } from "components/context/ToastContext";
import { parseApiError } from "utils/parseApiError";
import Loading from "components/loading/Loading";
import Button from "components/ui/buttons/Button";
import DeleteProgramsConfirmation from "features/programs/components/admin/popups/DeleteProgramsConfirmation";

import { useProgram, useDeletePrograms, useUpdateProgram } from "features/programs/hooks";
import type { UpdateProgramPayload } from "features/programs/types";
import { useCommissionTypes } from "features/knowledge-hub/commission/hooks";
import { useUniversities, useBranches } from "features/universities/hooks";
import { useAllFields } from "features/knowledge-hub/field-of-study/hooks";
import { useAllQualifications } from "features/knowledge-hub/qualifications/hooks";

import InputField from "components/form/fields/InputField";
import TextareaField from "components/form/fields/TextareaField";
import RichTextEditor from "components/form/fields/RichTextEditor";
import ToggleInput from "components/form/toggle/ToggleInput";
import MultipleDateInput from "components/form/date/MultipleDateInput";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import ArrayObjectField from "components/form/fields/ArrayObjectField";
import SelectField from "components/form/fields/SelectField";

import IconButton from "components/ui/buttons/IconButton";
import NoMessagesFound from "components/emptyData/NoMessagesFound";
import { validateProgram } from "./validateProgram";
import type { FormData as ProgramFormData } from "./RegisterProgram";

const SCHOLARSHIP_TYPE_MAP: Record<string, number> = { full: 1, partial: 2, mixed: 3 };
const toScholarshipTypeInt = (t: any): number | null => {
  if (typeof t === "number" && [1, 2, 3].includes(t)) return t;
  if (typeof t === "string") return SCHOLARSHIP_TYPE_MAP[t.toLowerCase()] ?? null;
  return null;
};

interface Props {
  id: string;
}


const EditKnowledgeHubProgramDetails = ({ id }: Props) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { deletePrograms } = useDeletePrograms();

  const { commissionTypes } = useCommissionTypes();

  const { qualifications } = useAllQualifications();

  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"single" | "batch" | null>(null);
  const [initialFormData, setInitialFormData] = useState<any>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const router = useRouter();
  const { program, commission } = useProgram(id);
  const { updateProgram, updateProgrLoading } = useUpdateProgram();
  const [formData, setFormData] = useState<any>({});

  const { fields } = useAllFields();
  const { universities } = useUniversities();
  const { branches } = useBranches(formData.uni_id);

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

  const isFormChanged = React.useMemo(() => {
    if (!initialFormData || Object.keys(initialFormData).length === 0) return false;
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  const validateField = React.useCallback(
    (field: string, overrideValue?: any) => {
      const data = overrideValue !== undefined ? { ...formData, [field]: overrideValue } : formData;
      const { errors: allErrors } = validateProgram(data as ProgramFormData);
      setErrors((prev) => ({ ...prev, [field]: allErrors[field] }));
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
    setFormData((prev: any) => {
      const clone = structuredClone(prev);
      const path = field.replace(/\[(\w+)\]/g, ".$1").split(".");
      let current = clone;

      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) current[path[i]] = {};
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;

      if (field === "has_scholarship" && value === true && (!clone.scholarships || clone.scholarships.length === 0)) {
        clone.scholarships = [{ type: 1, coverage_percent: 0, max_amount: 0, name: "", description: "", conditions: [] }];
      }
      if (field === "has_scholarship" && value === false) {
        clone.scholarships = [];
      }

      return clone;
    });
  };

  useEffect(() => {
    if (!program) return;

    const initialData = {
      uni_id: program.university?.id ?? "",
      branch_id: program.branch?.id ?? "",
      field_of_study_id: program.field_of_study?.id ?? "",
      name: program.name ?? "",
      tuition_fee: program.tuition_fee ?? 0,
      intake_dates: program.intake_dates ?? [],
      duration: program.duration ?? 0,
      english_required_score: program.english_required_score ?? "",
      overview: program.overview ?? "",
      curriculum: program.curriculum ?? "",
      is_on_campus: program.is_on_campus ?? false,
      is_online: program.is_online ?? false,
      has_scholarship: program.has_scholarship ?? false,
      commission_amount: Number(program.commission_amount) || 0,
      commission_currency: program.commission_currency || "rm",
      commission_type_id: String(commissionTypes[0]?.id || ""),
      commission_notes: commission?.notes ?? "",
      expected_commission_from: commission?.expected_commission_from ?? "",
      expected_commission_to: commission?.expected_commission_to ?? "",
      qualification_id: String((program as any).qualification_id || ""),
      yearly_fees: program.yearly_fees ?? [],
      one_time_fees: program.one_time_fees ?? [],
      scholarships: (program.scholarships ?? []).map((s: any) => ({
        ...s,
        type: toScholarshipTypeInt(s.type),
        conditions: s.conditions ?? [],
      })),
    };

    setFormData(initialData);
    setInitialFormData(initialData);
  }, [program, commission]);

  useEffect(() => {
    if (commissionTypes.length > 0) {
      const typeId = String(commissionTypes[0].id);
      setFormData((prev) => ({ ...prev, commission_type_id: typeId }));
      setInitialFormData((prev) => ({ ...prev, commission_type_id: typeId }));
    }
  }, [commissionTypes]);

  const handleUpdate = async () => {
    const { isValid, errors: validationErrors } = validateProgram(formData as ProgramFormData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    try {
      const payload: UpdateProgramPayload = {
        uni_id: String(formData.uni_id),
        branch_id: String(formData.branch_id),
        field_of_study_id: String(formData.field_of_study_id),

        name: String(formData.name || "").trim(),
        overview: String(formData.overview || "").trim(),
        curriculum: String(formData.curriculum || "").trim(),

        tuition_fee: Number(formData.tuition_fee) || 0,
        duration: Number(formData.duration) || 0,
        english_required_score: String(formData.english_required_score || ""),

        is_on_campus: Boolean(formData.is_on_campus),
        is_online: Boolean(formData.is_online),
        has_scholarship: Boolean(formData.has_scholarship),

        commission_amount: Number(formData.commission_amount) || 0,
        commission_currency: formData.commission_currency || "rm",
        commission_type_id: String(formData.commission_type_id || commissionTypes[0]?.id || ""),
        commission_notes: String(formData.commission_notes || ""),
        expected_commission_from: formData.expected_commission_from ? Number(formData.expected_commission_from) : null,
        expected_commission_to: formData.expected_commission_to ? Number(formData.expected_commission_to) : null,

        qualification_id: String(formData.qualification_id),

        intake_dates: Array.isArray(formData.intake_dates)
          ? formData.intake_dates.filter((d: string) => !!d)
          : [],

        yearly_fees: Array.isArray(formData.yearly_fees)
          ? formData.yearly_fees.map((f: any) => ({
            year: Number(f.year) || 0,
            fee: Number(f.fee) || 0,
          }))
          : [],

        one_time_fees: Array.isArray(formData.one_time_fees)
          ? formData.one_time_fees.map((f: any) => ({
            description: String(f.description || ""),
            fee: Number(f.fee) || 0,
          }))
          : [],

        scholarships: formData.has_scholarship
          ? Array.isArray(formData.scholarships)
            ? formData.scholarships.map((s: any) => ({
              type: toScholarshipTypeInt(s.type),
              coverage_percent: Number(s.coverage_percent) || 0,
              max_amount: Number(s.max_amount) || 0,
              name: String(s.name || ""),
              description: String(s.description || ""),
              conditions: Array.isArray(s.conditions) ? s.conditions : [],
            }))
            : []
          : [],
      };

      await updateProgram(id, payload);

      showToast("Program updated successfully", "success");

      router.push(`/admin/knowledge-hub/${id}`);
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Update failed. ${backendMessage}`, "error");
    }
  };

  const handleDelete = async () => {
    try {
      if (!id) return;
      setIsDeleting(true);
      await deletePrograms([id]);
      showToast("Deleted successfully", "success");
      setIsDeleteOpen(false);
      setDeleteMode(null);
      router.push("/admin/knowledge-hub");
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Delete failed. ${backendMessage}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    router.push(`/admin/knowledge-hub/${id}`);
  };

  if (!program) return <Loading text="Loading program..." />;

  return (
    <>
      <div className="mt-6 max-w-5xl mx-auto rounded-md border bg-card shadow-sm">
          <div className="flex justify-between border-b p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-gradient-to-r from-blue-600 to-indigo-700">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  {program?.name ?? "Not Provided"}
                </h3>
                <p className="text-sm text-slate-500">
                  {program?.university?.name ?? "Not Provided"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-6">
              <div className="relative">
                <Button
                  onClick={() =>
                    setOpenDropdownId(
                      openDropdownId === program.id ? null : program.id
                    )
                  }
                  icon={<MoreVertical className="h-4 w-4" />}
                  text="Actions"
                  bgColor="bg-white"
                  textColor="text-slate-800"
                  borderColor="border-gray-200"
                  hoverTextColor="hover:text-slate-800"
                  hoverBorderColor="hover:border-gray-200"
                  className="hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-400"
                />

                {openDropdownId === program.id && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-gray-200 bg-white ring-1 ring-black/5">
                    <div className="space-y-2 p-2">
                      <button
                        aria-label="Delete Program"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-red-200 hover:bg-red-50 hover:shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeleteOpen(true);
                          setOpenDropdownId(null);
                        }}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-red-100 text-red-600 transition-colors group-hover:bg-red-200">
                          <Trash2 className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-red-700">
                        Delete Program
                      </span>
                      </button>

                      <button
                        aria-label="Back to Knowledge Hub"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-white px-4 py-3 text-left text-sm transition-all hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
                        onClick={handleBack}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200">
                          <ChevronLeft className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-slate-900">
                        Back to Knowledge Hub
                      </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-6 border-b border-slate-200 px-6 pt-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Program Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <SearchableDropdown
                  label="University"
                  field="uni_id"
                  required
                  options={(universities ?? [])
                    .filter((u) => u.is_active)
                    .map((u) => ({
                      value: u.id,
                      label: u.name,
                    }))}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  onSelect={(v) => validateField('uni_id', v)}
                />

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

                <InputField
                  label="Program Name"
                  field="name"
                  placeholder="e.g. BSc Data Science"
                  required
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  onBlur={() => validateField('name')}
                />

                <SearchableDropdown
                  label="Field of Study"
                  field="field_of_study_id"
                  required
                  options={fields.map((f) => ({
                    value: String(f.id),
                    label: f.name,
                  }))}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  onSelect={(v) => validateField('field_of_study_id', v)}
                />

                <InputField
                  label="Tuition Fee"
                  field="tuition_fee"
                  type="number"
                  required={false}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
              </div>
            </div>

            <div className="space-y-6 border-b border-slate-200 px-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Academic Details
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <InputField
                  label="Duration (Years)"
                  field="duration"
                  required={false}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  onBlur={() => validateField('duration')}
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

                <SearchableDropdown
                  label="Qualification Level"
                  field="qualification_id"
                  required
                  options={qualifications.map((f) => ({
                    value: String(f.id),
                    label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
                  }))}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                  onSelect={(v) => validateField('qualification_id', v)}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <TextareaField
                    label="Overview"
                    field="overview"
                    required={false}
                    placeholder="Program overview..."
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                  />

                  <TextareaField
                    label="Curriculum"
                    field="curriculum"
                    required={false}
                    placeholder="Program curriculum..."
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                  />
                </div>


            </div>

            <div className="space-y-6 px-6 pb-5 border-b border-slate-200">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Delivery Mode
              </h3>

              <ToggleInput
                label="On Campus"
                field="is_on_campus"
                formData={formData}
                errors={errors}
                updateFormData={(field, value) => {
                  updateFormData(field, value);
                  updateFormData("is_online", !value);
                }}
              />

            </div>

            <div className="space-y-6 px-6 pb-5 ">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Intake Schedule
              </h3>

              <MultipleDateInput
                label="Intake Dates"
                field="intake_dates"
                required={false}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>

            <div className="space-y-6 border-b border-slate-200 px-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Commission Structure
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

                <InputField
                  label="Commission Amount"
                  field="commission_amount"
                  type="number"
                  required={false}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <SelectField
                  label="Currency"
                  field="commission_currency"
                  required={false}
                  options={CURRENCY.map((c) => ({ value: c.value, label: c.label }))}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <SelectField
                  label="Expected From"
                  field="expected_commission_from"
                  required={false}
                  options={MONTHS.map((m) => ({ value: m.value, label: m.label }))}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <SelectField
                  label="Expected To"
                  field="expected_commission_to"
                  required={false}
                  options={MONTHS.map((m) => ({ value: m.value, label: m.label }))}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <div className="md:col-span-4">
                  <TextareaField
                    label="Commission Notes"
                    field="commission_notes"
                    required={false}
                    placeholder="e.g. Commission paid ..."
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    onBlur={() => validateField('commission_notes')}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-b border-slate-200 px-6 py-5">
              <ArrayObjectField
                label="Yearly Fees"
                subLabel="Year"
                field="yearly_fees"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                fields={[
                  {
                    key: "year",
                    label: "Year",
                    type: "text",
                    placeholder: "Year",
                  },
                  {
                    key: "fee",
                    label: "Fee",
                    type: "number",
                    placeholder: "Fee",
                  },
                ]}
                getDefaultRow={(currentArray: unknown[]) => ({ year: currentArray.length + 1, fee: "" })}
              />

              <ArrayObjectField
                label="One Time Fees"
                subLabel="Fees"
                field="one_time_fees"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                fields={[
                  {
                    key: "description",
                    label: "Description",
                    type: "text",
                    placeholder: "One Time Fees",
                  },
                  {
                    key: "fee",
                    label: "Fee",
                    type: "number",
                    placeholder: "Fee",
                  },
                ]}
              />
            </div>

            <div className="flex items-center justify-between px-6 pb-5">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Scholarships
              </h3>

              {formData.has_scholarship && (
                <IconButton
                  icon={<CalendarPlus className="h-4 w-4" />}
                  bgColor="bg-blue-50"
                  textColor="text-blue-700"
                  borderColor="border-blue-600"
                  hoverTextColor="hover:text-blue-800"
                  hoverBorderColor="hover:border-blue-700"
                  onClick={addScholarship}
                />
              )}
            </div>

            <div className="block px-6 pb-5">
              <ToggleInput
                label="Has Scholarship"
                field="has_scholarship"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>

            {(formData.scholarships ?? []).map((scholarship, index) => (
              <div key={index} className="space-y-6 px-6 pb-5">
                <div className="rounded-xl border border-slate-200 bg-white p-6 transition">
                  <div className="mb-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-sm font-semibold text-blue-600">
                        {index + 1}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Scholarship
                        </p>
                        <p className="text-xs text-slate-500">
                          Configure scholarship details
                        </p>
                      </div>
                    </div>

                    <IconButton
                      icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => removeScholarship(index)}
                      bgColor="bg-red-50"
                      textColor="text-red-600"
                      borderColor="border-red-200"
                      hoverTextColor="hover:text-red-700"
                      hoverBorderColor="hover:border-red-300"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div className="md:col-span-2">
                      <InputField
                        label="Scholarship Name"
                        field={`scholarships[${index}].name`}
                        placeholder="e.g. Excellence Award"
                        type="text"
                        formData={formData}
                        errors={errors}
                        updateFormData={updateFormData}
                        onBlur={() => validateField(`scholarships[${index}].name`)}
                      />
                    </div>

                    <InputField
                      label="Coverage Percentage"
                      field={`scholarships[${index}].coverage_percent`}
                      type="number"
                      formData={formData}
                      errors={errors}
                      required={false}
                      updateFormData={updateFormData}
                    />

                    <InputField
                      label="Maximum Amount"
                      field={`scholarships[${index}].max_amount`}
                      type="number"
                      formData={formData}
                      errors={errors}
                      required={false}
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
                        <h3 className="text-sm font-semibold tracking-wide text-slate-500">
                          Conditions
                        </h3>
                        <IconButton
                          icon={<Plus className="h-4 w-4" />}
                          bgColor="bg-blue-50"
                          textColor="text-blue-700"
                          borderColor="border-blue-600"
                          hoverTextColor="hover:text-blue-800"
                          hoverBorderColor="hover:border-blue-700"
                          onClick={() => {
                            const updated = [...(formData.scholarships[index].conditions ?? []), ""];
                            updateFormData(`scholarships[${index}].conditions`, updated);
                          }}
                        />
                      </div>

                      {!(formData.scholarships[index].conditions?.length) ? (
                        <p className="text-sm text-slate-400">No conditions added yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {formData.scholarships[index].conditions.map((condition: string, cIndex: number) => (
                            <div key={cIndex} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                              <input
                                value={condition}
                                onChange={(e) => updateFormData(`scholarships[${index}].conditions[${cIndex}]`, e.target.value)}
                                placeholder={`Condition ${cIndex + 1}`}
                                className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.scholarships[index].conditions.filter((_: any, i: number) => i !== cIndex);
                                  updateFormData(`scholarships[${index}].conditions`, updated);
                                }}
                                className="text-red-400 transition hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {formData.has_scholarship && !(formData.scholarships ?? []).length && (
              <NoMessagesFound
                title="No scholarships found"
                subtitle="There are currently no scholarships available."
              />
            )}
          </div>

          <div className="flex justify-end gap-2 border-t px-6 py-5">
            <Button
              onClick={handleBack}
              disabled={updateProgrLoading}
              icon={<ChevronLeft className="h-5 w-5" />}
              text={"Back"}
              bgColor="bg-slate-50"
              textColor="text-slate-700"
              borderColor="border-slate-600"
              hoverTextColor="hover:text-slate-800"
              hoverBorderColor="hover:border-slate-700"
            />

            <Button
              icon={<Pencil className="h-5 w-5" />}
              text={updateProgrLoading ? "Updating..." : "Save Change"}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
              onClick={handleUpdate}
              disabled={updateProgrLoading || !isFormChanged}
            />
          </div>
        </div>

      <DeleteProgramsConfirmation
        isOpen={isDeleteOpen}
        onClose={() => {
          setIsDeleteOpen(false);
          setDeleteMode(null);
        }}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        programNames={program?.name ? [program.name] : []}
      />
    </>
  );
};

export default EditKnowledgeHubProgramDetails;
