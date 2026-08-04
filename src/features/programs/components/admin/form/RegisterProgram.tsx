'use client';

import { ArrowLeft, ArrowRight, BookOpen, CalendarPlus, DollarSign, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from 'components/context/ToastContext';
import { parseApiError } from 'utils/parseApiError';
import { useRouter } from 'next/navigation';

import { IELTS_BANDS, MONTHS, CURRENCY } from 'constants/lists';

import { useCreateProgram } from 'features/programs/hooks';
import { useUniversities, useBranches } from "features/universities/hooks";
import { useAllFields } from "features/knowledge-hub/field-of-study/hooks";
import { useCommissionTypes } from "features/knowledge-hub/commission/hooks";
import { useAllQualifications } from "features/knowledge-hub/qualifications/hooks";

import ToggleInput from 'components/form/toggle/ToggleInput';
import InputField from 'components/form/fields/InputField';
import TextareaField from 'components/form/fields/TextareaField';
import RichTextEditor from 'components/form/fields/RichTextEditor';
import ArrayObjectField from 'components/form/fields/ArrayObjectField';
import SelectField from 'components/form/fields/SelectField';
import MultipleDateInput from 'components/form/date/MultipleDateInput';
import SearchableDropdown from 'components/form/search/SearchableDropdown';

import Button from 'components/ui/buttons/Button';
import PrevButton from 'components/ui/buttons/PrevButton';
import NextButton from 'components/ui/buttons/NextButton';
import IconButton from 'components/ui/buttons/IconButton';
import { validateProgram, isProgramComplete } from './validateProgram';

export interface FormData {
  name: string;
  uni_id: string;
  branch_id: string;
  field_of_study_id: string;
  tuition_fee: number;
  intake_dates: string[];
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
  yearly_fees: Array<{ year: number; fee: number }>;
  one_time_fees: Array<{ description: string; fee: number }>;
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

const stages = [
  { id: 1, name: 'Program Details', icon: BookOpen },
  { id: 2, name: 'Commission & Fees', icon: DollarSign },
];

const STEP1_REQUIRED = ['name', 'uni_id', 'qualification_id', 'field_of_study_id', 'is_on_campus'];

interface Props {
  basePath?: string;
}

export default function RegisterProgram({ basePath = '/admin/knowledge-hub' }: Props = {}) {
  const { showToast } = useToast();
  const router = useRouter();

  const { createProgram, loading } = useCreateProgram();
  const { commissionTypes } = useCommissionTypes();

  const [stage, setStage] = useState(1);
  const [completedStages, setCompletedStages] = useState<number[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: '',
    uni_id: '',
    branch_id: '',
    field_of_study_id: '',
    tuition_fee: 0,
    intake_dates: [],
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
    yearly_fees: [],
    one_time_fees: [],
    scholarships: [],
  });

  const { fields } = useAllFields();
  const { qualifications } = useAllQualifications();
  const { branches } = useBranches(formData.uni_id);
  const { universities } = useUniversities();

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
    if (branches.length === 1) {
      updateFormData('branch_id', String(branches[0].id));
    }
  }, [branches]);

  const isStep1Valid =
    formData.name.trim().length >= 5 &&
    !!formData.uni_id &&
    !!formData.qualification_id &&
    !!formData.field_of_study_id &&
    (formData.is_on_campus || formData.is_online);

  const isStageValid = stage === 1 ? isStep1Valid : isProgramComplete(formData);

  const canAccessStage = (id: number) => {
    if (id === 1) return true;
    if (id === stage) return true;
    const idx = stages.findIndex((s) => s.id === id);
    return idx > 0 && completedStages.includes(stages[idx - 1].id);
  };

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

  const nextStage = () => {
    const { errors: allErrors } = validateProgram(formData);
    const step1Errors: FormErrors = {};
    STEP1_REQUIRED.forEach((f) => { if (allErrors[f]) step1Errors[f] = allErrors[f]; });
    if (Object.keys(step1Errors).length > 0) {
      setErrors(step1Errors);
      return;
    }
    setErrors({});
    setCompletedStages((prev) => prev.includes(stage) ? prev : [...prev, stage]);
    setStage((s) => Math.min(s + 1, stages.length));
  };

  const prevStage = () => {
    const currentIndex = stages.findIndex((s) => s.id === stage);
    if (currentIndex > 0) setStage(stages[currentIndex - 1].id);
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

  const handleSubmit = async () => {
    const { isValid, errors: validationErrors } = validateProgram(formData);
    if (!isValid) {
      setErrors(validationErrors);
      return;
    }
    try {
      const payload = {
        ...formData,
        tuition_fee: Number(formData.tuition_fee || 0),
        duration: Number(formData.duration || 0),
        qualification_id: formData.qualification_id,
        commission_amount: Number(formData.commission_amount || 0),
        commission_currency: formData.commission_currency || 'rm',
        expected_commission_from: formData.expected_commission_from ? Number(formData.expected_commission_from) : null,
        expected_commission_to: formData.expected_commission_to ? Number(formData.expected_commission_to) : null,
        yearly_fees: (formData.yearly_fees || []).map((y) => ({ year: Number(y.year), fee: Number(y.fee) })),
        one_time_fees: (formData.one_time_fees || []).map((f: any) => ({ description: f.description || '', fee: Number(f.fee || 0) })),
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
      };
      await createProgram(payload);
      showToast('Program created successfully', 'success');
      setTimeout(() => router.push(basePath), 1500);
    } catch (error: unknown) {
      const backendMessage = parseApiError(error, 'Please try again.');
      showToast(`Failed to create program. ${backendMessage}`, 'error');
    }
  };

  return (
    <section className="mx-auto mt-5 max-w-5xl">
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

        <div className="px-6 pt-6">

          {/* Stepper */}
          <div className="relative mb-8">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]">
              {stages.map((s, index) => {
                const Icon = s.icon;
                const isActive = s.id === stage;
                const isCompleted = completedStages.includes(s.id);
                const canAccess = canAccessStage(s.id);

                return (
                  <div key={s.id} className="group relative flex flex-col items-center">
                    {index < stages.length - 1 && (
                      <div className="absolute left-1/2 top-6 -z-10 hidden h-1 w-full bg-slate-200 sm:block">
                        <div className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'w-full bg-blue-500' : 'w-0'}`} />
                      </div>
                    )}

                    <button
                      onClick={() => canAccess && setStage(s.id)}
                      disabled={!canAccess}
                      className={`relative mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                        isCompleted
                          ? 'border-blue-500 bg-blue-500 text-white shadow-md'
                          : isActive
                          ? 'scale-110 border-blue-700 bg-blue-50 text-blue-700 shadow-sm'
                          : canAccess
                          ? 'border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-50'
                          : 'cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400'
                      }`}
                    >
                      <Icon size={20} className="transition-transform duration-300 group-hover:scale-110" />
                    </button>

                    <span className={`text-center text-xs transition-colors duration-300 sm:text-sm ${isActive ? 'font-semibold text-blue-700' : 'text-slate-500'}`}>
                      {s.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stage content */}
          <div className="mb-6 min-h-[400px] rounded-lg border border-slate-200">

            {/* Step 1 — Program Details */}
            {stage === 1 && (
              <div className="space-y-6">

                <div className="space-y-4 border-b border-slate-200 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Program Information</h3>
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
                      options={fields.map((f) => ({ value: String(f.id), label: f.name }))}
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                      onSelect={(v: string) => validateField('field_of_study_id', v)}
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

                <div className="space-y-4 border-b border-slate-200 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Academic Details</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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

                    <SelectField
                      label="IELTS Required Score"
                      field="english_required_score"
                      required={false}
                      options={IELTS_BANDS.map((s) => ({ label: s.label, value: s.score }))}
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                    />

                  </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                  <TextareaField
                  label="Curriculum"
                  field="curriculum"
                  required={false}
                  placeholder="Program curriculum..."
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <TextareaField
                  label="Overview"
                  field="overview"
                  required={false}
                  placeholder="Program overview..."
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />                  
                                    
                </div>                      

              </div>

                <div className="space-y-4 border-b border-slate-200 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Delivery Mode</h3>
                  <ToggleInput label="On Campus" field="is_on_campus" formData={formData} errors={errors} updateFormData={updateFormData} />
                </div>

                <div className="space-y-4 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Intake Schedule</h3>
                  <MultipleDateInput label="Intake Dates" field="intake_dates" required={false} formData={formData} errors={errors} updateFormData={updateFormData} />
                </div>

              </div>
            )}

            {/* Step 2 — Commission & Fees */}
            {stage === 2 && (
              <div className="space-y-6">

                <div className="space-y-4 border-b border-slate-200 p-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Commission Structure</h3>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                    
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
                        placeholder="e.g. Commission paid after visa approval..."
                        formData={formData}
                        errors={errors}
                        updateFormData={updateFormData}
                        onBlur={() => validateField('commission_notes')}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 border-b border-slate-200 p-6">
                  <ArrayObjectField
                    label="Yearly Fees"
                    subLabel="Year"
                    field="yearly_fees"
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    fields={[
                      { key: 'year', label: 'Year', type: 'text', placeholder: 'Year' },
                      { key: 'fee', label: 'Fee', type: 'number', placeholder: 'Fee' },
                    ]}
                    getDefaultRow={(currentArray: unknown[]) => ({ year: currentArray.length + 1, fee: '' })}
                  />

                  <ArrayObjectField
                    label="One Time Fees"
                    subLabel="Fees"
                    field="one_time_fees"
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                    fields={[
                      { key: 'description', label: 'Description', type: 'text', placeholder: 'One Time Fees' },
                      { key: 'fee', label: 'Fee', type: 'number', placeholder: 'Fee' },
                    ]}
                  />
                </div>

                <div className="space-y-4 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Scholarship</h3>
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

                  <ToggleInput label="Has Scholarship" field="has_scholarship" formData={formData} errors={errors} updateFormData={updateFormData} />

                  {formData.has_scholarship && (
                    <div className="space-y-6">
                      {formData.scholarships.map((_, index) => (
                        <div key={index} className="rounded-xl border border-slate-200 bg-white p-6 transition">
                          <div className="mb-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-blue-50 text-sm font-semibold text-blue-600">
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
                </div>

              </div>
            )}

          </div>

          {/* Footer */}
          <div className="flex flex-col gap-3 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-slate-500">
              Step {stage} of {stages.length} — {completedStages.length} completed
            </div>

            <div className="flex gap-3">
              {stage > 1 ? (
                <PrevButton
                  onClick={prevStage}
                  text="Prev"
                  icon={<ArrowLeft className="h-4 w-4" />}
                  disabled={loading}
                />
              ) : (
                <PrevButton
                  onClick={() => router.push(basePath)}
                  text="Back"
                  icon={<ArrowLeft className="h-4 w-4" />}
                />
              )}

              {stage < stages.length ? (
                <NextButton
                  onClick={nextStage}
                  text="Next"
                  icon={<ArrowRight className="h-4 w-4" />}
                  disabled={!isStageValid}
                />
              ) : (
                <Button
                  onClick={handleSubmit}
                  text={loading ? 'Creating...' : 'Create Program'}
                  disabled={!isStageValid || loading}
                  bgColor="bg-blue-50"
                  textColor="text-blue-700"
                  borderColor="border-blue-600"
                  hoverTextColor="hover:text-blue-800"
                  hoverBorderColor="hover:border-blue-700"
                  icon={<BookOpen className="h-5 w-5" />}
                />
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
