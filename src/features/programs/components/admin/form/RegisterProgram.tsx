'use client';

import { ArrowLeft, Award, BookOpen, CalendarPlus, CalendarRange, DollarSign, MapPin, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';
import { useToast } from 'components/context/ToastContext';
import { parseApiError } from 'utils/parseApiError';
import { useRouter } from 'next/navigation';

import { IELTS_BANDS, MONTHS, CURRENCY } from 'constants/lists';
import { type Currency } from 'features/programs/types';

import { useCreateProgram } from 'features/programs/hooks';
import { useUniversities, useBranches } from "features/universities/hooks";
import { useAllFields } from "features/knowledge-hub/field-of-study/hooks";
import { useCommissionTypes } from "features/knowledge-hub/commission/hooks";
import { useAllQualifications } from "features/knowledge-hub/qualifications/hooks";

import InputField from 'components/form/fields/InputField';
import TextareaField from 'components/form/fields/TextareaField';
import RichTextEditor from 'components/form/fields/RichTextEditor';
import SelectField from 'components/form/fields/SelectField';
import YearlyFeesField from 'features/programs/components/shared/YearlyFeesField';
import OneTimeFeesField from 'features/programs/components/shared/OneTimeFeesField';
import SearchableDropdown from 'components/form/search/SearchableDropdown';
import ToggleInput from 'components/form/toggle/ToggleInput';
import AccordionSection from 'features/programs/components/shared/form/AccordionSection';
import IntakeMonthsField from 'features/programs/components/shared/form/IntakeMonthsField';
import { useUnsavedChangesGuard, confirmDiscard } from 'features/programs/components/shared/form/useUnsavedChangesGuard';
import { useDraftAutosave } from 'features/programs/components/shared/form/useDraftAutosave';

import Button from 'components/ui/buttons/Button';
import PrevButton from 'components/ui/buttons/PrevButton';
import IconButton from 'components/ui/buttons/IconButton';
import { validateProgram } from './validateProgram';

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
type SectionKey = 'details' | 'university' | 'fees' | 'intakes' | 'scholarship';

const SECTION_FIELDS: Record<SectionKey, string[]> = {
  details: ['name', 'qualification_id', 'field_of_study_id', 'duration', 'is_on_campus'],
  university: ['uni_id', 'branch_id'],
  fees: ['commission_amount', 'commission_notes', 'yearly_fees', 'one_time_fees'],
  intakes: ['intake_months', 'english_required_score'],
  scholarship: ['scholarships'],
};

const emptyFormData: FormData = {
  name: '',
  uni_id: '',
  branch_id: '',
  field_of_study_id: '',
  tuition_fee: 0,
  intake_months: [],
  duration: 0,
  english_required_score: '',
  overview: '',
  curriculum: '',
  is_on_campus: true,
  is_online: false,
  has_scholarship: false,
  commission_type_id: '',
  commission_currency: 'rm',
  commission_notes: '',
  commission_amount: 0,
  expected_commission_from: '',
  expected_commission_to: '',
  qualification_id: '',
  yearly_fee_currency: 'MYR',
  yearly_fees: [],
  one_time_fees: [],
  scholarships: [],
};

interface Props {
  basePath?: string;
}

export default function RegisterProgram({ basePath = '/admin/knowledge-hub' }: Props = {}) {
  const { showToast } = useToast();
  const router = useRouter();

  const { createProgram, loading } = useCreateProgram();
  const { commissionTypes } = useCommissionTypes();

  const [errors, setErrors] = useState<FormErrors>({});
  const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
    details: true, university: true, fees: true, intakes: true, scholarship: true,
  });

  const [formData, setFormData] = useState<FormData>(emptyFormData);

  const { fields } = useAllFields();
  const { qualifications } = useAllQualifications();
  const { branches } = useBranches(formData.uni_id);
  const { universities } = useUniversities();

  const isDirty = useMemo(() => JSON.stringify(formData) !== JSON.stringify(emptyFormData), [formData]);
  useUnsavedChangesGuard(isDirty);
  const { hasDraft, readDraft, clearDraft, dismissDraft } = useDraftAutosave(formData, isDirty);

  useEffect(() => {
    if (commissionTypes.length > 0) {
      setFormData((prev) => ({ ...prev, commission_type_id: String(commissionTypes[0].id) }));
    }
  }, [commissionTypes]);

  useEffect(() => {
    if (!branches || branches.length === 0) {
      updateFormData('branch_id', '');
      return;
    }
    const stillValid = branches.some((b) => String(b.id) === String(formData.branch_id));
    if (stillValid) return;
    updateFormData('branch_id', branches.length === 1 ? String(branches[0].id) : '');
  }, [branches]);

  const toggleSection = (key: SectionKey) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const validateField = React.useCallback(
    (field: string, overrideValue?: any) => {
      const data = overrideValue !== undefined ? { ...formData, [field]: overrideValue } : formData;
      const { errors: allErrors } = validateProgram(data);
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
    setFormData((prev) => {
      const updated = structuredClone(prev);
      const keys = field.replace(/\[(\d+)\]/g, '.$1').split('.');
      let current: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (current[key] === undefined) current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
        current = current[key];
      }
      current[keys[keys.length - 1]] = value;

      if (field === 'is_on_campus' && value === true) updated.is_online = false;
      if (field === 'is_online' && value === true) updated.is_on_campus = false;
      if (field === 'is_on_campus' && value === false) updated.is_online = true;
      if (field === 'is_online' && value === false) updated.is_on_campus = true;
      if (field === 'has_scholarship' && value === true && updated.scholarships.length === 0) {
        updated.scholarships = [{ type: 1, coverage_percent: 0, max_amount: 0, name: '', description: '', conditions: [] }];
      }
      if (field === 'has_scholarship' && value === false) updated.scholarships = [];

      return updated;
    });
  };

  const removeScholarship = (index: number) => {
    setFormData((prev) => ({ ...prev, scholarships: prev.scholarships.filter((_, i) => i !== index) }));
  };

  const addScholarship = () => {
    setFormData((prev) => ({
      ...prev,
      scholarships: [...prev.scholarships, { type: 1, coverage_percent: 0, max_amount: 0, name: '', description: '', conditions: [] }],
    }));
  };

  const buildPayload = () => ({
    ...formData,
    tuition_fee: Number(formData.tuition_fee || 0),
    duration: Number(formData.duration || 0),
    qualification_id: formData.qualification_id,
    commission_amount: Number(formData.commission_amount || 0),
    commission_currency: formData.commission_currency || 'rm',
    expected_commission_from: formData.expected_commission_from ? Number(formData.expected_commission_from) : null,
    expected_commission_to: formData.expected_commission_to ? Number(formData.expected_commission_to) : null,
    yearly_fee_currency: (formData.yearly_fee_currency || 'MYR') as Currency,
    yearly_fees: (formData.yearly_fees || []).map((y) => ({ year: Number(y.year), fee: Number(y.fee) })),
    one_time_fees: (formData.one_time_fees || []).map((f: any) => ({ description: f.description || '', fee: Number(f.fee || 0), currency: (f.currency || 'MYR') as Currency })),
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
    const erroredFields = new Set(Object.keys(validationErrors));
    const sectionsToOpen: Partial<Record<SectionKey, boolean>> = {};
    (Object.keys(SECTION_FIELDS) as SectionKey[]).forEach((key) => {
      const touchesSection = [...erroredFields].some((f) => SECTION_FIELDS[key].some((sf) => f === sf || f.startsWith(`${sf}[`)));
      if (touchesSection) sectionsToOpen[key] = true;
    });
    if (Object.keys(sectionsToOpen).length) {
      setOpenSections((prev) => ({ ...prev, ...sectionsToOpen }));
    }
  };

  const handleSubmit = async () => {
    const { isValid, errors: validationErrors } = validateProgram(formData);
    if (!isValid) {
      setErrors(validationErrors);
      focusFirstError(validationErrors);
      showToast('Please fix the highlighted fields before publishing.', 'error');
      return;
    }
    try {
      await createProgram(buildPayload());
      clearDraft();
      showToast('Program created successfully', 'success');
      setTimeout(() => router.push(basePath), 1500);
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, 'Please try again.');
      showToast(`Failed to create program. ${backendMessage}`, 'error');
    }
  };

  const restoreDraft = () => {
    const draft = readDraft();
    if (draft) setFormData(draft);
    dismissDraft();
  };

  // ── Live preview data ──────────────────────────────────────────────────
  const selectedUniversity = universities?.find((u) => String(u.id) === String(formData.uni_id));
  const selectedBranch = branches?.find((b) => String(b.id) === String(formData.branch_id));
  const selectedQualification = qualifications?.find((q) => String(q.id) === String(formData.qualification_id));
  const location = selectedBranch ? [selectedBranch.location, selectedBranch.state].filter(Boolean).join(', ') : undefined;
  const firstYearFee = useMemo(() => {
    const rows = formData.yearly_fees || [];
    if (!rows.length) return null;
    const first = [...rows].sort((a, b) => Number(a.year) - Number(b.year))[0];
    if (!first?.fee) return null;
    return `${formData.yearly_fee_currency || 'MYR'} ${Number(first.fee).toLocaleString()}`;
  }, [formData.yearly_fees, formData.yearly_fee_currency]);

  return (
    <section className="mx-auto mt-5 max-w-6xl">
      <div className="mt-6 rounded-md border bg-white">

        {/* Header */}
        <div className="flex items-start gap-x-4 border-b px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <BookOpen className="text-blue-700" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Register a new program</h3>
            <p className="text-sm text-slate-500">Complete the required information to register a knowledge hub program</p>
          </div>
        </div>

        <div className="px-6 py-6">

          <div>
            <div className="space-y-4">

              <AccordionSection
                icon={BookOpen}
                title="Program Details"
                hasError={!!(errors.name || errors.qualification_id || errors.field_of_study_id || errors.duration || errors.is_on_campus)}
                summary={formData.name ? `${formData.name}${selectedQualification ? ` · ${selectedQualification.name}` : ''}` : 'Not started'}
                open={openSections.details}
                onToggle={() => toggleSection('details')}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
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
                    <p className="mt-1 text-xs text-slate-400">Minimum 5 characters — this is exactly what renders in the Program Info column.</p>
                  </div>

                  <SearchableDropdown
                    label="Qualification Level"
                    field="qualification_id"
                    required
                    options={qualifications.map((f) => ({ value: String(f.id), label: f.name.charAt(0).toUpperCase() + f.name.slice(1) }))}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    onSelect={(v: string) => validateField('qualification_id', v)}
                  />

                  <SearchableDropdown
                    label="Field of Study"
                    field="field_of_study_id"
                    required
                    options={fields.map((f) => ({ value: String(f.id), label: f.name }))}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    onSelect={(v: string) => validateField('field_of_study_id', v)}
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
                    onBlur={() => validateField('duration')}
                  />

                  <div className="md:col-span-2">
                    <ToggleInput
                      label="Delivery Mode"
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
              </AccordionSection>

              <AccordionSection
                icon={MapPin}
                title="University & Location"
                hasError={!!(errors.uni_id || errors.branch_id)}
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
                    onSelect={(v: string) => validateField('uni_id', v)}
                  />

                  {branches.length > 1 && (
                    <SearchableDropdown
                      label="Branch"
                      field="branch_id"
                      options={branches.map((s) => ({ value: String(s.id), label: s.name }))}
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                    />
                  )}

                </div>
              </AccordionSection>

              <AccordionSection
                icon={DollarSign}
                title="Fees & Commission"
                hasError={!!(errors.commission_amount || errors.commission_notes)}
                summary={firstYearFee ? `First year ${firstYearFee}` : 'Not started'}
                open={openSections.fees}
                onToggle={() => toggleSection('fees')}
              >
                <YearlyFeesField formData={formData} errors={errors} updateFormData={updateFormData} />
                <OneTimeFeesField formData={formData} errors={errors} updateFormData={updateFormData} />

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Commission — how much</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <InputField
                      label="Commission Amount"
                      field="commission_amount"
                      type="number"
                      placeholder="e.g. 10"
                      required={false}
                      formData={formData}
                      errors={errors}
                      updateFormData={(f: string, v: any) => {
                        updateFormData(f, v);
                        const num = Number(v);
                        if (v !== '' && v !== 0 && num > 29999) {
                          setErrors((prev) => ({ ...prev, commission_amount: 'Commission amount cannot exceed RM 29,999' }));
                        } else {
                          setErrors((prev) => { const n = { ...prev }; delete n.commission_amount; return n; });
                        }
                      }}
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
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Commission — when &amp; notes</h4>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                    <div className="md:col-span-2">
                      <TextareaField
                        label="Commission Notes"
                        field="commission_notes"
                        required={false}
                        placeholder="e.g. Commission paid after visa approval..."
                        formData={formData}
                        errors={errors}
                        updateFormData={updateFormData}
                        onBlur={() => validateField('commission_notes')}
                      />
                    </div>
                  </div>
                </div>
              </AccordionSection>

              <AccordionSection
                icon={CalendarRange}
                title="Intakes & Requirements"
                hasError={!!errors.intake_months}
                summary={formData.intake_months?.length ? `${formData.intake_months.length} intake month${formData.intake_months.length !== 1 ? 's' : ''}` : 'Not started'}
                open={openSections.intakes}
                onToggle={() => toggleSection('intakes')}
              >
                <IntakeMonthsField field="intake_months" label="Intake Months" formData={formData} errors={errors} updateFormData={updateFormData} />

                <SelectField
                  label="IELTS Required Score"
                  field="english_required_score"
                  required={false}
                  options={IELTS_BANDS.map((s) => ({ label: s.label, value: s.score }))}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
              </AccordionSection>

              <AccordionSection
                icon={Award}
                title="Scholarship"
                hasError={!!(formData.scholarships || []).some((_, i) => errors[`scholarships[${i}].name`] || errors[`scholarships[${i}].description`])}
                summary={formData.has_scholarship ? `Available · ${formData.scholarships.length} scholarship${formData.scholarships.length !== 1 ? 's' : ''}` : 'None'}
                open={openSections.scholarship}
                onToggle={() => toggleSection('scholarship')}
              >
                <div className="flex items-center gap-3">
                  <div className="inline-flex rounded-lg border border-slate-200 p-1">
                    <button
                      type="button"
                      onClick={() => updateFormData('has_scholarship', true)}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition ${formData.has_scholarship ? 'bg-amber-500 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => updateFormData('has_scholarship', false)}
                      className={`rounded-md px-4 py-2 text-sm font-medium transition ${!formData.has_scholarship ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                      None
                    </button>
                  </div>
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

                {formData.has_scholarship && (
                  <div className="space-y-6">
                    {formData.scholarships.map((_, index) => (
                      <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 transition">
                        <div className="mb-5 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-amber-50 text-sm font-semibold text-amber-600">
                              {index + 1}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-800">Scholarship</p>
                              <p className="text-xs text-slate-500">Configure scholarship details</p>
                            </div>
                          </div>
                          {formData.scholarships.length > 1 && (
                            <IconButton
                              icon={<Trash2 className="h-4 w-4" />}
                              onClick={() => removeScholarship(index)}
                              bgColor="bg-red-50"
                              textColor="text-red-600"
                              borderColor="border-red-200"
                              hoverTextColor="hover:text-red-700"
                              hoverBorderColor="hover:border-red-300"
                            />
                          )}
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
                            placeholder="e.g. 50"
                            required={false}
                            formData={formData}
                            errors={errors}
                            updateFormData={updateFormData}
                          />

                          <InputField
                            label="Maximum Amount"
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
                              <h3 className="text-sm font-semibold tracking-wide text-slate-500">Conditions</h3>
                              <IconButton
                                icon={<Plus className="h-4 w-4" />}
                                bgColor="bg-blue-50"
                                textColor="text-blue-700"
                                borderColor="border-blue-600"
                                hoverTextColor="hover:text-blue-800"
                                hoverBorderColor="hover:border-blue-700"
                                onClick={() => updateFormData(`scholarships[${index}].conditions`, [...formData.scholarships[index].conditions, ''])}
                              />
                            </div>

                            {formData.scholarships[index].conditions.length === 0 ? (
                              <p className="text-sm text-slate-400">No conditions added yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {formData.scholarships[index].conditions.map((condition, cIndex) => (
                                  <div key={cIndex} className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                                    <input
                                      value={condition}
                                      onChange={(e) => updateFormData(`scholarships[${index}].conditions[${cIndex}]`, e.target.value)}
                                      placeholder={`Condition ${cIndex + 1}`}
                                      className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => updateFormData(`scholarships[${index}].conditions`, formData.scholarships[index].conditions.filter((_, i) => i !== cIndex))}
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
                    ))}
                  </div>
                )}
              </AccordionSection>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <PrevButton
              onClick={() => confirmDiscard(isDirty, () => router.push(basePath))}
              text="Cancel"
              icon={<ArrowLeft className="h-4 w-4" />}
              disabled={loading}
            />

            <Button
              onClick={() => handleSubmit()}
              text={loading ? 'Creating...' : 'Create Program'}
              icon={<BookOpen className="h-5 w-5" />}
              bgColor="bg-blue-600"
              textColor="text-white"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-white"
              hoverBorderColor="hover:border-blue-700"
              className="hover:bg-blue-700"
              disabled={loading}
            />
          </div>

        </div>
      </div>
    </section>
  );
}
