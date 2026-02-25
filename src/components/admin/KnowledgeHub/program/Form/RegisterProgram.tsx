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
import CreateBranch from "components/admin/KnowledgeHub/program/popups/CreateBranch";
import CreateCommissionType from "components/admin/KnowledgeHub/program/popups/CreateCommissionType";

import { useToast } from "components/context/ToastContext";
import { useRouter } from "next/navigation";

import { useCreateProgram } from "hooks/knowledge-hub/programs/useCreateKnowledgeHubProgram";
import { useAllUniversities } from "hooks/knowledge-hub/universities/useUniversitiesList";
import { useAllFields } from "hooks/knowledge-hub/programs/useFieldsList";
import { useKnowledgeHubStates } from "hooks/knowledge-hub/programs/useProgramStates";
import { useAllBranches } from "hooks/knowledge-hub/universities/useBranchesList";
import { useCommissionTypes } from "hooks/knowledge-hub/commission/useCommissionTypes";

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
  commission_type_id: string;
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
  const [showCommissionTypePopup, setShowCommissionTypePopup] = useState(false);
  const [showFieldOfStudyPopup, setShowFieldOfStudyPopup] = useState(false);
  const [showBranchPopup, setShowBranchPopup] = useState(false);

  const { showToast } = useToast();
  const router = useRouter();

  const { createProgram, createProgramLoading } = useCreateProgram();
  const { commissionTypes, commissionTypesLoading } = useCommissionTypes();

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
    commission_type_id: "",
    commission_notes:
      "Commission paid 30 days after student completes first semester of each academic year.",
    qualification_level: 0,

    commission_amount: 0,

    yearly_fees: [],
    one_time_fees: [],
    scholarships: [
      {
        type: 0,
        coverage_percent: 0,
        max_amount: 0,
        name: "",
        description: "",
      },
    ],
  });

  const { fields } = useAllFields();
  const { branches } = useAllBranches(formData.uni_id);

  const { universities } = useAllUniversities();

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => {
      const updated = structuredClone(prev);

      // Convert scholarships[0].type → scholarships.0.type
      const keys = field.replace(/\[(\d+)\]/g, ".$1").split(".");

      let current: any = updated;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];

        if (current[key] === undefined) {
          current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
        }

        current = current[key];
      }

      current[keys[keys.length - 1]] = value;

      return updated;
    });
  };

  const handleSubmit = async () => {
    try {

      if (!formData.uni_id) {
        showToast("University is required", "error");
        return;
      }

      if (!formData.branch_id) {
        showToast("Branch is required", "error");
        return;
      }

      if (!formData.field_of_study_id) {
        showToast("Field of study is required", "error");
        return;
      }

      const payload = {
        ...formData,

        tuition_fee: Number(formData.tuition_fee || 0),
        duration: Number(formData.duration || 0),
        qualification_level: Number(formData.qualification_level || 3),
        commission_amount: Number(formData.commission_amount || 0),

        yearly_fees: (formData.yearly_fees || []).map((y) => ({
          year: Number(y.year),
          fee: Number(y.fee),
        })),

        one_time_fees: (formData.one_time_fees || []).map((f: any) => ({
          description: f.description || "",
          fee: Number(f.fee || 0),
        })),

        scholarships: formData.has_scholarship
          ? (formData.scholarships || [])
            .filter((s) => s.name && s.description)
            .map((s) => ({
              type: Number(s.type || 0),
              coverage_percent: Number(s.coverage_percent || 0),
              max_amount: Number(s.max_amount || 0),
              name: s.name,
              description: s.description,
            }))
          : [],
      };

      await createProgram(payload);

      showToast("Program created successfully", "success");

      // router.push("/admin/knowledge-hub/programs");

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
                    onClick: () => setShowBranchPopup(true),
                  },
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

              <SearchableSelect
                label="Commission Type"
                field="commission_type_id"
                options={commissionTypes.map((f) => ({
                  value: String(f.id),
                  label: f.name,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
                actions={[
                  {
                    label: "Create Commission Type",
                    icon: <PlusCircle className="h-4 w-4" />,
                    onClick: () => setShowCommissionTypePopup(true)
                  }
                ]}
              />

              <InputField
                label="Qualification Level"
                field="qualification_level"
                type="string"
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
                field="scholarships[0].type"
                options={[
                  { value: "0", label: "Full Scholarship" },
                  { value: "1", label: "Partial Scholarship" },
                ]}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Coverage Percent"
                field="scholarships[0].coverage_percent"
                type="number"
                placeholder="e.g. 10"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Max Amount"
                field="scholarships[0].max_amount"
                type="number"
                placeholder="e.g. 10000"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Scholarship Name"
                field="scholarships[0].name"
                placeholder="e.g.Scholarship"
                type="text"
                required
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />

              <InputField
                label="Description"
                field="scholarships[0].description"
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

      <CreateCommissionType
        isOpen={showCommissionTypePopup}
        onClose={() => setShowCommissionTypePopup(false)}
      />

      <CreateFieldOfStudy
        isOpen={showFieldOfStudyPopup}
        onClose={() => setShowFieldOfStudyPopup(false)}
      />

      <CreateBranch
        isOpen={showBranchPopup}
        onClose={() => setShowBranchPopup(false)}
        universityId={formData.uni_id}
      />

    </section>
  );
}
