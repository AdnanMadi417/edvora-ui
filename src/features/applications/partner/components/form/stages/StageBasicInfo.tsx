import React from "react";
import { InputField } from "components/form";
import SearchableSelect from "components/form/search/SearchableSelect";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import { NATIONALITIES } from "constants/lists";

interface Props {
  formData: any;
  errors: Record<string, string | undefined>;
  updateFormData: (fieldPath: string, value: any) => void;
  validateField: (field: string) => void;
  universities: any[];
}

export default function StageBasicInfo({
                                          formData,
                                          errors,
                                          updateFormData,
                                          validateField,
                                          universities,
                                        }: Props) {
  return (
    <div className="mb-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center">
          <h4 className="text-lg font-semibold text-slate-900">
            University & Student Information
          </h4>
          <div className="ml-4 flex-1 border-t-2 border-slate-900 opacity-70"></div>
        </div>
        <p className="text-sm text-slate-800">
          Select your target university and provide student details.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <InputField
          label="Student Full Name (as in passport)"
          field="student.name"
          placeholder="Ahmad bin Ali"
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => validateField("student.name")}
        />

        <InputField
          label="Passport Number"
          field="student.passport_number"
          placeholder="A1234567"
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
          onBlur={() => validateField("student.passport_number")}
        />

        <SearchableDropdown
          label="Nationality"
          field="student.nationality"
          options={NATIONALITIES.map((q) => ({
            value: String(q.label),
            label: q.name,
          }))}
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />

        <SearchableSelect
          label="University"
          field="university_id"
          options={universities.map((u) => ({
            value: String(u.id),
            label: u.name,
          }))}
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />

        <SearchableSelect
          label="Program / Major"
          field="program_id"
          options={(
            universities.find((u) => u.id === formData.university_id)
              ?.programs || []
          ).map((p) => ({
            value: p.id,
            label: p.name,
          }))}
          formData={formData}
          errors={errors}
          updateFormData={updateFormData}
        />

      </div>
    </div>
  );
}
