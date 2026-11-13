"use client";

import CommissionFields from "features/programs/components/shared/CommissionFields";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Award,
  BookOpen,
  CalendarPlus,
  CalendarRange,
  DollarSign,
  GraduationCap,
  MapPin,
  Trash2,
  MoreVertical,
  ChevronLeft,
  Pencil,
  Plus,
} from "lucide-react";

import { IELTS_BANDS } from 'constants/lists';
import { normalizeCommissionCurrency } from 'features/programs/utils/commissionCurrency';
import { pickChangedFields } from 'features/programs/utils/changedFields';

import { useToast } from "components/ub/feedback/notifications/ToastContext";
import { parseApiError } from "utils/parseApiError";
import Loading from "components/ub/feedback/states/Loading";
import Button from "components/ub/core/buttons/Button";
import DeleteProgramsConfirmation from "features/programs/components/admin/popups/DeleteProgramsConfirmation";

import { useProgram, useDeletePrograms, useUpdateProgram } from "features/programs/hooks";
import type { UpdateProgramPayload } from "features/programs/types";
import { useCommissionTypes } from "features/knowledge-hub/commission/hooks";
import { useUniversities, useBranches } from "features/universities/hooks";
import { useAllFields } from "features/knowledge-hub/field-of-study/hooks";
import { useAllQualifications } from "features/knowledge-hub/qualifications/hooks";

import InputField from "components/ub/forms/text/InputField";
import RichTextEditor from "components/ub/forms/text/RichTextEditor";
import ToggleInput from "components/ub/forms/choices/ToggleInput";
import SearchableDropdown from "components/ub/forms/selection/SearchableDropdown";
import SelectField from "components/ub/forms/selection/SelectField";
import YearlyFeesField from "features/programs/components/shared/YearlyFeesField";
import OneTimeFeesField from "features/programs/components/shared/OneTimeFeesField";
import CollapsibleSection from "components/ub/forms/layout/CollapsibleSection";
import IntakeMonthsField from "features/programs/components/shared/form/IntakeMonthsField";
import { useUnsavedChangesGuard, confirmDiscard } from "features/programs/components/shared/form/useUnsavedChangesGuard";
import { COURSE_TYPE_OPTIONS, isMasterOrPhd } from "features/programs/utils/courseType";
import { setFormPath } from "features/programs/components/shared/form/setFormPath";
import { useIsFormDirty } from "features/programs/components/shared/form/useIsFormDirty";

import IconButton from "components/ub/core/buttons/IconButton";
import NoMessagesFound from "components/ub/feedback/states/NoMessagesFound";
import { validateProgram } from "./validateProgram";
import type { FormData as ProgramFormData } from "./RegisterProgram";
import { fieldGroup } from "components/ub/recipes";

const SCHOLARSHIP_TYPE_MAP: Record<string, number> = { full: 1, partial: 2, mixed: 3 };
const toScholarshipTypeInt = (t: any): number | null => {
  if (typeof t === "number" && [1, 2, 3].includes(t)) return t;
  if (typeof t === "string") return SCHOLARSHIP_TYPE_MAP[t.toLowerCase()] ?? null;
  return null;
};

// Saved together as one versioned Commission row by the API, so a change to
// any of them sends all of them (see handleUpdate).
const COMMISSION_FIELDS: ReadonlyArray<keyof UpdateProgramPayload> = [
  'commission_amount',
  'commission_currency',
  'commission_type_id',
  'commission_notes',
  'expected_commission_from',
  'expected_commission_to',
];

type SectionKey = 'details' | 'university' | 'fees' | 'intakes' | 'scholarship';

const SECTION_FIELDS: Record<SectionKey, string[]> = {
  details: ['name', 'qualification_id', 'field_of_study_id', 'duration', 'is_on_campus'],
  university: ['uni_id', 'branch_id'],
  fees: ['commission_amount', 'commission_notes', 'yearly_fees', 'one_time_fees'],
  intakes: ['intake_months', 'english_required_score'],
  scholarship: ['scholarships'],
};

// Same "does this field belong to this section" test focusFirstError uses —
// shared so a section's live error indicator can't drift out of sync with
// which fields it's actually considered to own (e.g. missing an indexed
// yearly_fees[i]/scholarships[i] error, or a flat field SECTION_FIELDS
// already lists but a hand-rolled check forgot).
const sectionHasError = (errors: Record<string, string>, key: SectionKey): boolean =>
  Object.entries(errors).some(([f, v]) => !!v && SECTION_FIELDS[key].some((sf) => f === sf || f.startsWith(`${sf}[`)));

interface Props {
  id: string;
  /** Where "Back" and a successful save navigate to. Defaults to this program's admin details page. */
  redirectPath?: string;
  listPath?: string;
  hideDelete?: boolean;
}


const EditKnowledgeHubProgramDetails = ({
  id,
  redirectPath = `/admin/knowledge-hub/${id}`,
  listPath = "/admin/knowledge-hub",
  hideDelete = false,
}: Props) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const { deletePrograms } = useDeletePrograms();

  const { commissionTypes } = useCommissionTypes();

  const { qualifications } = useAllQualifications();

  const { showToast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteMode, setDeleteMode] = useState<"single" | "batch" | null>(null);
  const [initialFormData, setInitialFormData] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    // Only the first section starts open; the others show a one-line summary and
    // open on click, or by themselves when they hold a validation error.
    details: true, university: false, fees: false, intakes: false, scholarship: false,
  });

  const router = useRouter();
  const { program, commission } = useProgram(id);
  const { updateProgram, updateProgrLoading } = useUpdateProgram();
  const [formData, setFormData] = useState<any>({});

  const { fields } = useAllFields();
  const { universities } = useUniversities();
  const { branches } = useBranches(formData.uni_id);

  // When the university's branches load, keep a still-valid branch, pick the only one, or clear it.
  useEffect(() => {
    setFormData((prev: any) => {
      const list = branches ?? [];
      const keep = list.some((b: any) => String(b.id) === String(prev.branch_id));
      const next = keep ? prev.branch_id : list.length === 1 ? String(list[0].id) : "";
      return next === prev.branch_id ? prev : { ...prev, branch_id: next };
    });
    setErrors((prev) => {
      if (!("branch_id" in prev)) return prev;
      const { branch_id: _cleared, ...rest } = prev;
      return rest;
    });
  }, [branches]);

  const toggleSection = (key: SectionKey) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

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

  const isFormChanged = useIsFormDirty(formData, initialFormData);

  useUnsavedChangesGuard(isFormChanged);

  const validateField = React.useCallback(
    (field: string, overrideValue?: any) => {
      const data = overrideValue !== undefined ? { ...formData, [field]: overrideValue } : formData;
      const { errors: allErrors } = validateProgram(data as ProgramFormData);
      setErrors((prev) => ({ ...prev, [field]: allErrors[field] }));
    },
    [formData]
  );

  const updateFormData = (field: string, value: any) => {
    setErrors((prev) => Object.fromEntries(Object.entries(prev).filter(([key]) => key !== field && !key.startsWith(`${field}[`))));

    setFormData((prev: any) => {
      const clone = setFormPath(prev, field, value);

      if (field === "has_scholarship" && value === true && (!clone.scholarships || clone.scholarships.length === 0)) {
        clone.scholarships = [{ type: 1, coverage_percent: 0, max_amount: 0, name: "", description: "", conditions: [] }];
      }
      if (field === "has_scholarship" && value === false) {
        clone.scholarships = [];
      }
      if (field === "qualification_id") {
        const nextQualification = qualifications.find((q) => String(q.id) === String(value));
        if (!isMasterOrPhd(nextQualification?.name)) clone.course_type = null;
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
      intake_months: program.intake_months ?? [],
      duration: program.duration ?? 0,
      english_required_score: program.english_required_score ?? "",
      overview: program.overview ?? "",
      curriculum: program.curriculum ?? "",
      is_on_campus: program.is_on_campus ?? false,
      is_online: program.is_online ?? false,
      has_scholarship: program.has_scholarship ?? false,
      commission_amount: Number(program.commission_amount) || 0,
      // Upper-cased so a legacy "rm"/"usd" row still matches the select
      // options (UBX-395) -- an unmatched value used to render as USD.
      commission_currency: normalizeCommissionCurrency(program.commission_currency),
      // The program's own commission type. Seeding this from the first type
      // in the list meant every save reset the type of any program that used
      // a different one; the first type is only a fallback for "none set".
      commission_type_id: String(commission?.type_id || commissionTypes[0]?.id || ""),
      commission_notes: commission?.notes ?? "",
      expected_commission_from: commission?.expected_commission_from ?? "",
      expected_commission_to: commission?.expected_commission_to ?? "",
      qualification_id: String((program as any).qualification_id || ""),
      // Response and request now use the same strings — direct passthrough.
      course_type: (program as any).course_type ?? null,
      yearly_fee_currency: program.yearly_fee_currency || "MYR",
      yearly_fees: program.yearly_fees ?? [],
      one_time_fees: (program.one_time_fees ?? []).map((f: any) => ({ ...f, currency: f.currency || "MYR" })),
      scholarships: (program.scholarships ?? []).map((s: any) => ({
        ...s,
        type: toScholarshipTypeInt(s.type),
        conditions: s.conditions ?? [],
      })),
    };

    setFormData(initialData);
    setInitialFormData(initialData);
    // commissionTypes is left out on purpose: re-seeding when the types change would wipe the
    // user's edits. The effect below fills the type in if the types arrive after the program.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, commission]);

  useEffect(() => {
    // Only backfills a program with no commission type of its own, and only
    // once the real baseline has loaded — if commissionTypes resolves first,
    // the initial-load effect above already falls back to commissionTypes[0];
    // touching initialFormData here while it's still null would fake a
    // loaded baseline and defeat useIsFormDirty's "not ready yet" guard.
    if (commissionTypes.length > 0 && initialFormData && !initialFormData.commission_type_id) {
      const typeId = String(commissionTypes[0].id);
      setFormData((prev) => ({ ...prev, commission_type_id: typeId }));
      setInitialFormData((prev: any) => ({ ...prev, commission_type_id: typeId }));
    }
  }, [commissionTypes, initialFormData]);

  const focusFirstError = (validationErrors: Record<string, string>) => {
    const sectionsToOpen: Partial<Record<SectionKey, boolean>> = {};
    (Object.keys(SECTION_FIELDS) as SectionKey[]).forEach((key) => {
      if (sectionHasError(validationErrors, key)) sectionsToOpen[key] = true;
    });
    if (Object.keys(sectionsToOpen).length) {
      setOpenSections((prev) => ({ ...prev, ...sectionsToOpen }));
    }
  };

  // Normalised request shape for a given form state. Built for both the
  // current form and the loaded baseline so the diff in handleUpdate compares
  // like with like (trimmed strings, numbers, recomputed course_type).
  const buildPayload = (data: any): UpdateProgramPayload => {
    const qualification = qualifications?.find((q) => String(q.id) === String(data.qualification_id));
    return {
      uni_id: String(data.uni_id),
      branch_id: String(data.branch_id),
      field_of_study_id: String(data.field_of_study_id),

      name: String(data.name || "").trim(),
      overview: String(data.overview || "").trim(),
      curriculum: String(data.curriculum || "").trim(),

      tuition_fee: Number(data.tuition_fee) || 0,
      duration: Number(data.duration) || 0,
      english_required_score: String(data.english_required_score || ""),

      is_on_campus: Boolean(data.is_on_campus),
      is_online: Boolean(data.is_online),
      has_scholarship: Boolean(data.has_scholarship),

      commission_amount: Number(data.commission_amount) || 0,
      commission_currency: normalizeCommissionCurrency(data.commission_currency),
      commission_type_id: String(data.commission_type_id || commissionTypes[0]?.id || ""),
      commission_notes: String(data.commission_notes || ""),
      expected_commission_from: data.expected_commission_from ? Number(data.expected_commission_from) : null,
      expected_commission_to: data.expected_commission_to ? Number(data.expected_commission_to) : null,

      qualification_id: String(data.qualification_id),
      // Recomputed from the current qualification rather than trusted
      // as-is — guards against a stale pairing surviving a qualification change.
      course_type: isMasterOrPhd(qualification?.name) ? data.course_type : null,

      intake_months: Array.isArray(data.intake_months)
        ? data.intake_months.filter((m: number) => m != null)
        : [],

      yearly_fee_currency: data.yearly_fee_currency || "MYR",
      yearly_fees: Array.isArray(data.yearly_fees)
        ? data.yearly_fees.map((f: any) => ({
          year: Number(f.year) || 0,
          fee: Number(f.fee) || 0,
        }))
        : [],

      one_time_fees: Array.isArray(data.one_time_fees)
        ? data.one_time_fees.map((f: any) => ({
          description: String(f.description || ""),
          fee: Number(f.fee) || 0,
          currency: f.currency || "MYR",
        }))
        : [],

      scholarships: data.has_scholarship
        ? Array.isArray(data.scholarships)
          ? data.scholarships.map((s: any) => ({
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
  };

  const handleUpdate = async () => {
    const { isValid, errors: validationErrors } = validateProgram(formData as ProgramFormData);
    if (!isValid) {
      setErrors(validationErrors);
      focusFirstError(validationErrors);
      showToast('Please fix the highlighted fields before saving.', 'error');
      return;
    }
    try {
      // Send only what the user changed, so a save can't write back fields
      // they never touched over a colleague's newer edit. The commission is
      // one versioned row on the backend, so its fields go as a unit.
      const current = buildPayload(formData);
      const changes = initialFormData
        ? pickChangedFields(current, buildPayload(initialFormData), [COMMISSION_FIELDS])
        : current;

      if (Object.keys(changes).length === 0) {
        showToast("No changes to save.", "info");
        return;
      }

      // The API rejects the save with 409 program_modified if the program
      // changed after this form loaded it, instead of overwriting that change.
      await updateProgram(id, { ...changes, expected_updated_at: program?.updated_at ?? null });

      showToast("Program updated successfully", "success");

      router.push(redirectPath);
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
      router.push(listPath);
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, "Please try again.");
      showToast(`Delete failed. ${backendMessage}`, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBack = () => {
    confirmDiscard(isFormChanged, () => router.push(redirectPath));
  };

  // ── Live preview data ──────────────────────────────────────────────────
  const selectedUniversity = universities?.find((u) => String(u.id) === String(formData.uni_id));
  const selectedBranch = branches?.find((b) => String(b.id) === String(formData.branch_id));
  const selectedQualification = qualifications?.find((q) => String(q.id) === String(formData.qualification_id));
  const location = selectedBranch ? [selectedBranch.location, selectedBranch.state].filter(Boolean).join(', ') : undefined;
  const firstYearFee = useMemo(() => {
    const rows = formData.yearly_fees || [];
    if (!rows.length) return null;
    const first = [...rows].sort((a: any, b: any) => Number(a.year) - Number(b.year))[0];
    if (!first?.fee) return null;
    return `${formData.yearly_fee_currency || 'MYR'} ${Number(first.fee).toLocaleString()}`;
  }, [formData.yearly_fees, formData.yearly_fee_currency]);

  if (!program) return <Loading text="Loading program..." />;

  return (
    <>
      <div className="mt-5 min-w-0 max-w-6xl mx-auto overflow-clip rounded-ub-xl border border-ub-border bg-ub-surface">
          <div className="flex justify-between border-b border-ub-border p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-ub-md bg-ub-tone-brand-bg">
                <GraduationCap className="h-8 w-8 text-ub-tone-brand-text" />
              </div>

              <div>
                <h3 className="text-lg font-semibold">
                  {program?.name ?? "Not Provided"}
                </h3>
                <p className="text-sm text-ub-text-secondary">
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
                  variant="secondary"
                  className="hover:bg-ub-surface-subtle focus-visible:ring-2 focus-visible:ring-ub-border-focus"
                />

                {openDropdownId === program.id && (
                  <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-xl border border-ub-border bg-ub-surface ring-1 ring-black/5">
                    <div className="space-y-2 p-2">
                      {!hideDelete && (
                        <button
                          aria-label="Delete program"
                          className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-ub-surface px-4 py-3 text-left text-sm transition-all hover:border-ub-tone-danger-border hover:bg-ub-tone-danger-bg hover:shadow-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsDeleteOpen(true);
                            setOpenDropdownId(null);
                          }}
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ub-tone-danger-bg text-ub-tone-danger-text transition-colors group-hover:bg-ub-tone-danger-bg">
                            <Trash2 className="h-4 w-4" />
                          </div>

                          <span className="font-semibold text-ub-tone-danger-text">
                          Delete program
                        </span>
                        </button>
                      )}

                      <button
                        aria-label="Back to Knowledge Hub"
                        className="group flex w-full items-center gap-3 rounded-md border border-transparent bg-ub-surface px-4 py-3 text-left text-sm transition-all hover:border-ub-border hover:bg-ub-surface-subtle hover:shadow-sm"
                        onClick={handleBack}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-ub-surface-subtle text-ub-text-secondary transition-colors group-hover:bg-ub-surface-subtle">
                          <ChevronLeft className="h-4 w-4" />
                        </div>

                        <span className="font-semibold text-ub-text-primary">
                        Back to Knowledge Hub
                      </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">

              <CollapsibleSection
                icon={BookOpen}
                title="Program details"
                hasError={sectionHasError(errors, 'details')}
                summary={formData.name ? `${formData.name}${selectedQualification ? ` · ${selectedQualification.name}` : ''}` : 'Not started'}
                open={openSections.details}
                onToggle={() => toggleSection('details')}
              >
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
                      onBlur={() => validateField('name')}
                    />
                    <p className="mt-1 text-xs text-ub-text-tertiary">At least 5 characters. Advisors see this name in the programme list and on the programme page.</p>
                  </div>

                  <SearchableDropdown
                    label="Qualification level"
                    field="qualification_id"
                    required
                    options={qualifications.map((f) => ({ value: String(f.id), label: f.name.charAt(0).toUpperCase() + f.name.slice(1) }))}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    onSelect={(v) => validateField('qualification_id', v)}
                  />

                  {isMasterOrPhd(selectedQualification?.name) && (
                    <SelectField
                      label="Course type"
                      field="course_type"
                      required={false}
                      options={COURSE_TYPE_OPTIONS}
                      formData={formData}
                      errors={errors}
                      updateFormData={(f: string, v: string) => updateFormData(f, v || null)}
                    />
                  )}

                  <SearchableDropdown
                    label="Field of study"
                    field="field_of_study_id"
                    required
                    options={fields.map((f) => ({ value: String(f.id), label: f.name }))}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    onSelect={(v) => validateField('field_of_study_id', v)}
                  />

                  <InputField
                    label="Duration (Years)"
                    field="duration"
                    required={false}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    onBlur={() => validateField('duration')}
                  />

                  <div className="md:col-span-2">
                    <ToggleInput
                      label="Delivery mode"
                      field="is_on_campus"
                      formData={formData}
                      errors={errors}
                      enabledText="On campus"
                      disabledText="Online"
                      enabledDescription="Students attend this program in person."
                      disabledDescription="Students attend this program online."
                      updateFormData={(field, value) => {
                        updateFormData(field, value);
                        updateFormData("is_online", !value);
                      }}
                    />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                icon={MapPin}
                title="University & location"
                hasError={sectionHasError(errors, 'university')}
                summary={selectedUniversity ? `${selectedUniversity.name}${selectedBranch ? ` · ${selectedBranch.name}` : ''}` : 'Not started'}
                open={openSections.university}
                onToggle={() => toggleSection('university')}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <SearchableDropdown
                    label="University"
                    field="uni_id"
                    required
                    options={(universities ?? []).filter((u) => u.is_active).map((u) => ({ value: u.id, label: u.name }))}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    onSelect={(v) => validateField('uni_id', v)}
                  />

                  <SearchableDropdown
                    label="Branch"
                    field="branch_id"
                    options={branches.map((s) => ({ value: String(s.id), label: s.name }))}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                  />

                  <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-ub-text-secondary">Location</label>
                    <div className="flex h-[50px] items-center gap-2 rounded-ub-full border border-dashed border-ub-border bg-ub-surface-subtle px-[17px] text-[13px] text-ub-text-secondary">
                      <MapPin className="h-4 w-4 shrink-0 text-ub-text-tertiary" />
                      {location || 'Select a university and branch to see its location'}
                    </div>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                icon={DollarSign}
                title="Fees & commission"
                hasError={sectionHasError(errors, 'fees')}
                summary={firstYearFee ? `First year ${firstYearFee}` : 'Not started'}
                open={openSections.fees}
                onToggle={() => toggleSection('fees')}
              >
                <YearlyFeesField formData={formData} errors={errors} updateFormData={updateFormData} />
                <OneTimeFeesField formData={formData} errors={errors} updateFormData={updateFormData} />

                <CommissionFields formData={formData} errors={errors} updateFormData={updateFormData} validateField={validateField} />
              </CollapsibleSection>

              <CollapsibleSection
                icon={CalendarRange}
                title="Intakes & requirements"
                hasError={sectionHasError(errors, 'intakes')}
                summary={formData.intake_months?.length ? `${formData.intake_months.length} intake month${formData.intake_months.length !== 1 ? 's' : ''}` : 'Not started'}
                open={openSections.intakes}
                onToggle={() => toggleSection('intakes')}
              >
                <IntakeMonthsField field="intake_months" label="Intake months" formData={formData} errors={errors} updateFormData={updateFormData} />

                <SelectField
                  label="IELTS Required Score"
                  field="english_required_score"
                  required={false}
                  options={IELTS_BANDS.map((s) => ({ label: s.label, value: s.score }))}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
              </CollapsibleSection>

              <CollapsibleSection
                icon={Award}
                title="Scholarship"
                hasError={sectionHasError(errors, 'scholarship')}
                summary={formData.has_scholarship ? `Available · ${(formData.scholarships || []).length} scholarship${(formData.scholarships || []).length !== 1 ? 's' : ''}` : 'None'}
                open={openSections.scholarship}
                onToggle={() => toggleSection('scholarship')}
              >
                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-ub-full border border-ub-border p-1">
                    <button
                      type="button"
                      onClick={() => updateFormData('has_scholarship', true)}
                      className={`rounded-ub-full px-4 py-2 text-sm font-medium transition ${formData.has_scholarship ? 'bg-ub-tone-warning-bg text-ub-tone-warning-text ring-1 ring-ub-tone-warning-border shadow-sm' : 'text-ub-text-secondary hover:bg-ub-surface-subtle'}`}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFormData('has_scholarship', false)}
                      className={`rounded-ub-full px-4 py-2 text-sm font-medium transition ${!formData.has_scholarship ? 'bg-ub-tone-neutral-bg text-ub-tone-neutral-text ring-1 ring-ub-tone-neutral-border shadow-sm' : 'text-ub-text-secondary hover:bg-ub-surface-subtle'}`}
                    >
                      None
                    </button>
                  </div>
                  {formData.has_scholarship && (
                    <IconButton
                      aria-label="Add scholarship"
                      icon={<CalendarPlus className="h-4 w-4" />}
                      variant="secondary"
                      onClick={addScholarship}
                    />
                  )}
                </div>

                {(formData.scholarships ?? []).map((scholarship: any, index: number) => (
                  <div key={index} className="rounded-xl border border-ub-border bg-ub-surface p-6 transition">
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

                      <IconButton
                        aria-label={`Remove scholarship ${index + 1}`}
                        icon={<Trash2 className="h-4 w-4" />}
                        onClick={() => removeScholarship(index)}
                        bgColor="bg-ub-tone-danger-bg"
                        textColor="text-ub-tone-danger-text"
                        borderColor="border-ub-tone-danger-border"
                        hoverTextColor="hover:text-ub-tone-danger-text"
                        hoverBorderColor="hover:border-ub-tone-danger-border"
                      />
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
                          onBlur={() => validateField(`scholarships[${index}].name`)}
                        />
                      </div>

                      <InputField
                        label="Coverage percentage"
                        field={`scholarships[${index}].coverage_percent`}
                        type="number"
                        formData={formData}
                        errors={errors}
                        required={false}
                        updateFormData={updateFormData}
                      />

                      <InputField
                        label="Maximum amount"
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
                          <h3 className="text-sm font-semibold tracking-wide text-ub-text-secondary">
                            Conditions
                          </h3>
                          <IconButton
                            aria-label="Add condition"
                            icon={<Plus className="h-4 w-4" />}
                            variant="secondary"
                            onClick={() => {
                              const updated = [...(formData.scholarships[index].conditions ?? []), ""];
                              updateFormData(`scholarships[${index}].conditions`, updated);
                            }}
                          />
                        </div>

                        {!(formData.scholarships[index].conditions?.length) ? (
                          <p className="text-sm text-ub-text-tertiary">No conditions added yet.</p>
                        ) : (
                          <div className="space-y-2">
                            {formData.scholarships[index].conditions.map((condition: string, cIndex: number) => (
                              <div key={cIndex} className={`${fieldGroup} flex min-h-[50px] items-center gap-2 ps-[17px] pe-2`}>
                                <input
                                  value={condition}
                                  onChange={(e) => updateFormData(`scholarships[${index}].conditions[${cIndex}]`, e.target.value)}
                                  placeholder={`Condition ${cIndex + 1}`}
                                  className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[var(--ub-field-placeholder)]"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = formData.scholarships[index].conditions.filter((_: any, i: number) => i !== cIndex);
                                    updateFormData(`scholarships[${index}].conditions`, updated);
                                  }}
                                  aria-label={`Remove condition ${cIndex + 1}`}
                                  className="text-ub-tone-danger-text transition hover:text-ub-tone-danger-text"
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
                ))}

                {formData.has_scholarship && !(formData.scholarships ?? []).length && (
                  <NoMessagesFound
                    title="No scholarships found"
                    subtitle="There are currently no scholarships available."
                    icon={<Award className="h-8 w-8 text-ub-text-tertiary" />}
                  />
                )}
              </CollapsibleSection>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t px-6 py-5 border-ub-border">
            <Button
              onClick={handleBack}
              disabled={updateProgrLoading}
              icon={<ChevronLeft className="h-5 w-5" />}
              text={"Back"}
              variant="secondary"
            />

            <Button
              icon={<Pencil className="h-5 w-5" />}
              text={updateProgrLoading ? "Updating..." : "Save Change"}
              variant="primary"
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
