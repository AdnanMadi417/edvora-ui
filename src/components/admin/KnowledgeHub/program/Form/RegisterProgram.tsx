"use client";

import { Truck, PlusCircle } from "lucide-react";
import React, { useState } from "react";

import Loading from "../../../../loading/Loading";

import ToggleInput from "../../../../form/ToggleInput";
import InputField from "../../../../form/InputField";
import ArrayObjectField from "../../../../form/ArrayObjectField";
import SelectField from "../../../../form/SelectField";
import MultipleDateInput from "../../../../form/MultipleDateInput";
import SearchableSelect from "../../../../form/SearchableSelect";

import CreateProgramButton from "../../../../ui/buttons/Button";
import CreateUniversity from "components/admin/KnowledgeHub/university/popups/CreateUniversity";
import CreateFieldOfStudy from "components/admin/KnowledgeHub/program/popups/CreateFieldOfStudy";
import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation";

import { useCreateProgram } from "hooks/knowledge-hub/programs/useCreateKnowledgeHubProgram";
import { useAllUniversities } from "hooks/knowledge-hub/universities/useUniversitiesList";
import { useAllFields } from "hooks/knowledge-hub/programs/useFieldsList";
import { useKnowledgeHubStates } from "hooks/knowledge-hub/programs/useProgramStates";
import { useAllBranches } from "hooks/knowledge-hub/universities/useBranchesList";

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
  commission_rate: number;
  commission_type: number;
  commission_notes: string;
  qualification_level: number;

  commission_amount: number;

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
  }>;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterProgram() {
  const [showUniversityPopup, setShowUniversityPopup] = useState(false);
  const [showFieldOfStudyPopup, setShowFieldOfStudyPopup] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();

  const { createProgram, createProgramLoading } = useCreateProgram();

  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    name: "",
    uni_id: "",
    branch_id: "",
    field_of_study_id: "",
    tuition_fee: 0,
    intake_dates: [],
    duration: 0,
    english_required_score: "",
    overview: "",
    curriculum: "",
    is_on_campus: false,
    is_online: false,
    has_scholarship: false,
    commission_rate: 0,
    commission_type: 1,
    commission_notes:
      "Commission paid 30 days after student completes first semester of each academic year.",
    qualification_level: 0,

    commission_amount: 0,

    yearly_fees: [],
    one_time_fees: [],
    scholarships: [],
  });

  const { fields } = useAllFields();
  const { branches } = useAllBranches(formData.uni_id);

  const { universities } = useAllUniversities();

  const updateFormData = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        tuition_fee: Number(formData.tuition_fee),
        duration: Number(formData.duration),
        commission_rate: Number(formData.commission_rate),
        qualification_level: Number(formData.qualification_level),

        intake_dates: formData.intake_dates,

        yearly_fees: formData.yearly_fees || [],
        one_time_fees: formData.one_time_fees || [],
        scholarships: formData.scholarships || [],
      };

      await createProgram(payload);

      showToast("Program created successfully", "success");

      router.push("/dashboard/programs");
    } catch (err: any) {
      const apiErrors = err?.response?.data?.detail;

      if (Array.isArray(apiErrors)) {
        const newErrors: Record<string, string> = {};

        apiErrors.forEach((e: any) => {
          if (e?.loc?.[1]) {
            newErrors[e.loc[1]] = e.msg;
          }
        });

        setErrors(newErrors);
      }

      showToast("Failed to create program", "error");
    }
  };

  return (
    <section className="mx-auto mt-5">
      <div className="rounded-md border bg-slate-50 shadow-sm">
        <div className="flex items-start gap-x-4 border-b px-6 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <Truck className="text-blue-700" size={24} />
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

              <SearchableSelect
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
                actions={[
                  {
                    label: "Create University",
                    icon: <PlusCircle className="h-4 w-4" />,
                    onClick: () => setShowUniversityPopup(true)
                  }
                ]}
              />

              <SearchableSelect
                label="Branch"
                field="branch_id"
                options={branches.map((s) => ({
                  value: String(s.id),
                  label: s.name,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                actions={[
                  {
                    label: "Create Branch",
                    icon: <PlusCircle className="h-4 w-4" />,
                    onClick: () => setShowFieldOfStudyPopup(true)
                  }
                ]}
              />

              <InputField
                label="Program Name"
                field="name"
                placeholder="e.g. BSc Data Science"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <SearchableSelect
                label="Field of Study"
                field="field_of_study_id"
                options={fields.map((f) => ({
                  value: String(f.id),
                  label: f.name,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                actions={[
                  {
                    label: "Create Field of Study",
                    icon: <PlusCircle className="h-4 w-4" />,
                    onClick: () => setShowFieldOfStudyPopup(true)
                  }
                ]}
              />

              <InputField
                label="Tuition Fee"
                field="tuition_fee"
                type="number"
                placeholder="e.g. 20000"
                required
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
                type="number"
                placeholder="e.g. 3"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="English Required Score"
                field="english_required_score"
                placeholder="e.g. IELTS 6.0"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Overview"
                field="overview"
                placeholder="Program overview..."
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Curriculum"
                field="curriculum"
                placeholder="Program curriculum..."
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>
          </div>

          <div className="space-y-6 px-6 border-b border-slate-200">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Delivery Mode
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <ToggleInput
                label="On Campus"
                field="is_on_campus"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <ToggleInput
                label="Online Available"
                field="is_online"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <ToggleInput
                label="Has Scholarship"
                field="has_scholarship"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>
          </div>

          <div className="space-y-6 px-6 pb-5 ">

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
                label="Commission Type"
                field="commission_type"
                options={[
                  { label: "Percentage", value: 1 },
                  { label: "Fixed Amount", value: 2 },
                ]}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Commission Rate (%)"
                field="commission_rate"
                type="number"
                placeholder="e.g. 10"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Qualification Level"
                field="qualification_level"
                type="number"
                placeholder="e.g. 3"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>
          </div>

          <div className="space-y-4 px-6 border-b border-slate-200">
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

          <div className="space-y-6 px-6 ">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Scholarship
            </h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <SelectField
                label="Scholarship Type"
                field="type"
                options={[
                  { value: "full", label: "Full Scholarship" },
                  { value: "partial", label: "Partial Scholarship" },
                  { value: "merit", label: "Merit Based" },
                  { value: "need", label: "Need Based" },
                ]}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Coverage Percent"
                field="coverage_percent"
                type="number"
                placeholder="e.g. 10"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Max Amount"
                field="max_amount"
                type="number"
                placeholder="e.g. 10000"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Scholarship Name"
                field="name"
                placeholder="e.g.Scholarship"
                type="text"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Description"
                field="description"
                placeholder="e.g. Description Scholarship"
                type="text"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end border-t px-6 py-5">
          <CreateProgramButton
            icon={<PlusCircle className="h-5 w-5" />}
            text={createProgramLoading ? "Creating..." : "Create Service"}
            bgColor="bg-blue-50"
            textColor="text-blue-700"
            borderColor="border-blue-600"
            hoverTextColor="hover:text-blue-800"
            hoverBorderColor="hover:border-blue-700"
            onClick={handleSubmit}
            disabled={createProgramLoading}
          />
        </div>
      </div>

      <CreateUniversity
        isOpen={showUniversityPopup}
        onClose={() => setShowUniversityPopup(false)}
      />

      <CreateFieldOfStudy
        isOpen={showFieldOfStudyPopup}
        onClose={() => setShowFieldOfStudyPopup(false)}
      />

    </section>
  );
}
