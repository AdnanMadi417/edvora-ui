'use client';

import { BookOpen, CalendarPlus, ChevronLeft, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useToast } from 'components/context/ToastContext';
import { useRouter } from 'next/navigation';

import { IELTS_BANDS, MONTHS } from 'constants/lists';

import { useCreateProgram } from 'hooks/knowledge-hub/programs/useCreateProgram';
import { useAllUniversities } from 'hooks/knowledge-hub/universities/useUniversitiesList';
import { useAllFields } from 'hooks/knowledge-hub/field-of-study/useFieldsList';
import { useAllBranches } from 'hooks/knowledge-hub/universities/useBranchesList';
import { useCommissionTypes } from 'hooks/knowledge-hub/commission/useCommissionTypes';
import { useAllQualifications } from 'hooks/knowledge-hub/qualifications/useQualificationsList';

import ToggleInput from 'components/form/toggle/ToggleInput';
import InputField from 'components/form/InputField';
import ArrayObjectField from 'components/form/ArrayObjectField';
import SelectField from 'components/form/SelectField';
import MultipleDateInput from 'components/form/MultipleDateInput';
import SearchableDropdown from 'components/form/search/SearchableDropdown';

import Button from 'components/ui/buttons/Button';
import IconButton from 'components/ui/buttons/IconButton';

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

  commission_amount:number;
  commission_type_id: string;
  commission_notes: string;
  expected_commission_from: string;
  expected_commission_to: string;
  qualification_id: string;

  yearly_fees: Array<{
    year: number;
    fee: number;
  }>;

  one_time_fees: Array<{
    description: string;
    fee: number;
  }>;

  scholarships: Array<{
    type: number;
    coverage_percent: number;
    max_amount: number;
    name: string;
    description: string;
    conditions: string[];
  }>;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterProgram() {

  const { showToast } = useToast();
  const router = useRouter();

  const { createProgram, loading } = useCreateProgram();
  const { commissionTypes, commissionTypesLoading } = useCommissionTypes();

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
    commission_notes:'' ,
    commission_amount: 0,
    expected_commission_from:'',
    expected_commission_to:'',

    qualification_id: '',

    yearly_fees: [],
    one_time_fees: [],
    scholarships: [
      {
        type: 1,
        coverage_percent: 0,
        max_amount: 0,
        name: '',
        description: '',
        conditions: [],
      },
    ],
  });

  const { fields } = useAllFields();
  const { qualifications } = useAllQualifications();
  const { branches } = useAllBranches(formData.uni_id);
  const { universities } = useAllUniversities();

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
          name: '',
          description: '',
          conditions: [],
        },
      ],
    }));
  };

  useEffect(() => {
    if (commissionTypes.length > 0) {
      updateFormData("commission_type_id", String(commissionTypes[0].id));
    }
  }, [commissionTypes]);

  useEffect(() => {
    if (!branches || branches.length === 0) {
      updateFormData("branch_id", "");
      return;
    }

    if (branches.length === 1) {
      updateFormData("branch_id", String(branches[0].id));
    }
  }, [branches]);


  const isFormValid = React.useMemo(() => {
    const basicValid =
      formData.name.trim() !== '' &&
      formData.uni_id !== '' &&
      formData.branch_id !== '' &&
      formData.field_of_study_id !== '' &&
      formData.qualification_id !== '' &&
      formData.english_required_score.trim() !== '' &&
      formData.intake_dates.length > 0 &&
      formData.duration > 0 &&
      formData.commission_amount >= 0;

    const yearlyFeesValid =
      formData.yearly_fees.length === 0 ||
      formData.yearly_fees.every(
        (y) => y.year > 0 && y.fee > 0,
      );

    const oneTimeFeesValid =
      formData.one_time_fees.length === 0 ||
      formData.one_time_fees.every(
        (f) => f.description.trim() !== '' && f.fee > 0,
      );

    return (
      basicValid &&
      yearlyFeesValid &&
      oneTimeFeesValid
    );
  }, [formData]);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = structuredClone(prev);

      const keys = field.replace(/\[(\d+)\]/g, '.$1').split('.');
      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        if (current[key] === undefined) {
          current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
        }

        current = current[key];
      }

      current[keys[keys.length - 1]] = value;

      if (field === 'is_on_campus' && value === true) {
        updated.is_online = false;
      }

      if (field === 'is_online' && value === true) {
        updated.is_on_campus = false;
      }

      if (field === 'is_on_campus' && value === false) {
        updated.is_online = true;
      }

      if (field === 'is_online' && value === false) {
        updated.is_on_campus = true;
      }

      if (field === 'has_scholarship' && value === false) {
        updated.scholarships = [];
      }

      return updated;
    });
  };

  const handleSubmit = async () => {
    try {

      if (!formData.uni_id) {
        showToast('University is required', 'error');
        return;
      }

      if (!formData.branch_id) {
        showToast('Branch is required', 'error');
        return;
      }

      if (!formData.field_of_study_id) {
        showToast('Field of study is required', 'error');
        return;
      }

      if (!formData.commission_type_id) {
        showToast('Commission type is required', 'error');
        return;
      }

      if (!formData.qualification_id) {
        showToast('Qualification level is required', 'error');
        return;
      }

      if (!formData.intake_dates.length) {
        showToast('At least one intake date is required', 'error');
        return;
      }

      const payload = {
        ...formData,

        tuition_fee: Number(formData.tuition_fee || 0),
        duration: Number(formData.duration || 0),
        qualification_id: formData.qualification_id,

        commission_amount: Number(formData.commission_amount || 0),
        expected_commission_from: String( formData.expected_commission_from),
        expected_commission_to: String( formData.expected_commission_to),


        yearly_fees: (formData.yearly_fees || []).map((y) => ({
          year: Number(y.year),
          fee: Number(y.fee),
        })),

        one_time_fees: (formData.one_time_fees || []).map((f: any) => ({
          description: f.description || '',
          fee: Number(f.fee || 0),
        })),

        scholarships: formData.has_scholarship
          ? (formData.scholarships || [])
            .filter((s) => s.name && s.description)
            .map((s) => ({
              type: Number(s.type ?? 2),
              coverage_percent: Number(s.coverage_percent || 0),
              max_amount: Number(s.max_amount || 0),
              name: s.name,
              description: s.description,
              conditions: [],
            }))
          : [],
      };

      await createProgram(payload);

      showToast('Program created successfully', 'success');

      setTimeout(() => {
        router.push('/admin/knowledge-hub/programs');
      }, 1500);

    } catch (error: any) {
      const backendMessage =
        error?.response?.data?.detail?.[0]?.msg ||
        error?.response?.data?.message ||
        'Please try again.';
      showToast(`Failed to create program. ${backendMessage}`, 'error');
    }
  };

  const handleBack = () => {
    router.push('/admin/knowledge-hub/programs');
  };

  return (
    <section className="mx-auto mt-5">
      <div className="mt-6 rounded-md border bg-white">
        <div className="flex items-start gap-x-4 border-b px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <BookOpen className="text-blue-700" size={24} />
          </div>

          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Register a new program
            </h3>
            <p className="text-sm text-slate-500">
              Complete the required information to register a knowledge hub
              program
            </p>
          </div>
        </div>

        <div className="space-y-6">

          <div className="space-y-6 px-6 pt-5 border-b border-slate-200">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Program Information
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

              <SearchableDropdown
                label="University"
                field="uni_id"
                options={(universities ?? [])
                  .filter((u) => u.is_active)
                  .map((u) => ({
                    value: u.id,
                    label: u.name,
                  }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
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

              <InputField
                label="Program Name"
                field="name"
                placeholder="e.g. BSc Data Science"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <SearchableDropdown
                label="Field of Study"
                field="field_of_study_id"
                options={fields.map((f) => ({
                  value: String(f.id),
                  label: f.name,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

            </div>
          </div>

          <div className="space-y-6 px-6 border-b border-slate-200">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Academic Details
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Duration (Years)"
                field="duration"
                placeholder="e.g. 2 Years"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <SearchableDropdown
                label="Qualification Level"
                field="qualification_id"
                options={qualifications.map((f) => ({
                  value: String(f.id),
                  label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <SelectField
                label="IELTS Required Score"
                field="english_required_score"
                options={IELTS_BANDS.map((s) => ({
                  label: s.label,
                  value: s.score,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Overview"
                field="overview"
                placeholder="Program overview..."
                required={false}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Curriculum"
                field="curriculum"
                placeholder="Program curriculum..."
                required={false}
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
              updateFormData={updateFormData}
            />

          </div>

          <div className="space-y-6 px-6 border-b border-slate-200 pb-5 ">

            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Intake Schedule
            </h3>

            <MultipleDateInput
              label="Intake Dates"
              field="intake_dates"
              required
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

          </div>

          <div className="space-y-6 px-6 border-b border-slate-200">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Commission Structure
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <InputField
                label="Commission Amount"
                field="commission_amount"
                type="number"
                placeholder="e.g. 10"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <SelectField
                label="Expected from"
                field="expected_commission_from"
                options={MONTHS.map((m) => ({
                  value: m.value,
                  label: m.label,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <SelectField
                label="Expected To"
                field="expected_commission_to"
                options={MONTHS.map((m) => ({
                  value: m.value,
                  label: m.label,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              
              <InputField
                label="Commission Notes"
                field="commission_notes"
                type="text"
                placeholder="e.g. Commission paid ..."
                formData={formData}
                errors={errors}
                required={false}
                updateFormData={updateFormData}
              />

            </div>
          </div>

          <div className="space-y-4 px-6 py-5 border-b border-slate-200">
            <ArrayObjectField
              label="Yearly Fees"
              subLabel="Year"
              field="yearly_fees"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              fields={[
                {
                  key: 'year',
                  label: 'Year',
                  type: 'text',
                  placeholder: 'Year',
                },
                {
                  key: 'fee',
                  label: 'Fee',
                  type: 'number',
                  placeholder: 'Fee',
                },
              ]}
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
                  key: 'description',
                  label: 'Description',
                  type: 'text',
                  placeholder: 'One Time Fees',
                },
                {
                  key: 'fee',
                  label: 'Fee',
                  type: 'number',
                  placeholder: 'Fee',
                },
              ]}
            />
          </div>

          <div className="space-y-6 px-6 pb-5">

            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Scholarship
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

            <ToggleInput
              label="Has Scholarship"
              field="has_scholarship"
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
            />

            {formData.has_scholarship && (
              <div className="space-y-6 ">
                {formData.scholarships.map((_, index) => (
                  <div
                    key={index}
                    className="rounded-xl border border-slate-200 bg-white p-6 transition "
                  >
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
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
                        />

                      </div>

                      <InputField
                        label="Coverage Percentage"
                        field={`scholarships[${index}].coverage_percent`}
                        type="number"
                        placeholder="e.g. 50"
                        formData={formData}
                        errors={errors}
                        updateFormData={updateFormData}
                        required={false}
                      />

                      <InputField
                        label="Maximum Amount"
                        field={`scholarships[${index}].max_amount`}
                        type="number"
                        placeholder="e.g. 10000"
                        formData={formData}
                        errors={errors}
                        updateFormData={updateFormData}
                        required={false}
                      />

                      <div className="md:col-span-2">
                        <InputField
                          label="Description"
                          field={`scholarships[${index}].description`}
                          placeholder="Short description..."
                          type="text"
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
                              const updated = [...formData.scholarships[index].conditions, ''];
                              updateFormData(`scholarships[${index}].conditions`, updated);
                            }}
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
                                  onChange={(e) =>
                                    updateFormData(
                                      `scholarships[${index}].conditions[${cIndex}]`,
                                      e.target.value,
                                    )
                                  }
                                  placeholder={`Condition ${cIndex + 1}`}
                                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = formData.scholarships[index].conditions.filter((_, i) => i !== cIndex);
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
                ))}

              </div>
            )}

          </div>

        </div>

        <div className="flex justify-end border-t px-6 py-5 gap-2">

          <Button
            onClick={handleBack}
            icon={<ChevronLeft className="h-5 w-5" />}
            text={'Back'}
            bgColor="bg-slate-50"
            textColor="text-slate-700"
            borderColor="border-slate-600"
            hoverTextColor="hover:text-slate-800"
            hoverBorderColor="hover:border-slate-700"
          />

          <Button
            icon={<BookOpen className="h-5 w-5" />}
            text={loading ? 'Creating...' : 'Create Program'}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
          />
        </div>
      </div>

    </section>
  );
}
