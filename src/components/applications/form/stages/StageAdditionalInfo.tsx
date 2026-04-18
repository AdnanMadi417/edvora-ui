import React from "react";
import { InputField, RadioField } from "components/form";
import SearchableDropdown from "components/form/search/SearchableDropdown";
import { NATIONALITIES } from "constants/lists";
import { BookOpen } from "lucide-react";
import IconButton from "components/ui/buttons/IconButton";

export default function StageAdditionalInfo({
                                              formData,
                                              errors,
                                              updateFormData,
                                              requiredFieldKeys,
                                              qualifications,
                                              intakeDates = [],
                                              loadingIntakeDates = false,
                                            }) {
  const student = formData.student;

  const hasStudentInfoFields = requiredFieldKeys.some(
    (key) =>
      key.startsWith("student.") &&
      !key.includes("emergency_contacts") &&
      !key.includes("previous_educations")
  );

  const hasEmergencyFields = requiredFieldKeys.some((key) =>
    key.startsWith("student.emergency_contacts")
  );

  const hasEducationalFields = requiredFieldKeys.some((key) =>
    key.startsWith("student.previous_educations")
  );

  const isFieldRequired = (key: string) => requiredFieldKeys.includes(key);

  const canAddEducation = () => {
    const lastEdu = student.previous_educations?.[student.previous_educations.length - 1];
    if (!lastEdu) return true;
    return (
      lastEdu.qualification &&
      lastEdu.institution_name &&
      lastEdu.start_date &&
      lastEdu.end_date
    );
  };

  const addEducation = () => {
    if (!canAddEducation()) return;

    const updatedEducations = [
      ...student.previous_educations,
      { qualification: "", institution_name: "", start_date: "", end_date: "", grade: "" },
    ];

    updateFormData("student.previous_educations", updatedEducations);
  };

  return (
    <div className="space-y-5">

      {intakeDates.length > 1 && (
        <div className="mb-8">
          <h3 className="mb-4 font-semibold uppercase text-slate-900">Intake Date</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-900">
                Intake Date <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.intake_date ?? ""}
                onChange={(e) => updateFormData("intake_date", e.target.value)}
                className="mt-2 flex h-12 w-full items-center rounded-md border border-default p-3 text-sm outline-none focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {intakeDates.map((date) => (
                  <option key={date} value={date}>{date}</option>
                ))}
              </select>
              {errors?.["intake_date"] && (
                <p className="mt-1 text-xs text-red-600">{errors["intake_date"]}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {hasStudentInfoFields && (
        <div className="mb-8">
          <h3 className="mb-4 font-semibold uppercase text-slate-900">
            Student Information
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {isFieldRequired("student.birthday") && (
              <InputField
                label="Date of Birth"
                field="student.birthday"
                placeholder="DD/MM/YYYY"
                type="date"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            )}

            {isFieldRequired("student.gender") && (
              <RadioField
                label="Gender"
                field="student.gender"
                options={[
                  { label: "Male", value: true },
                  { label: "Female", value: false },
                ]}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            )}

            {isFieldRequired("student.nationality") && (
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
            )}

{isFieldRequired("student.email") && (
              <InputField
                label="Email Address"
                field="student.email"
                type="email"
                placeholder="ahmad.ali@gmail.com"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            )}

            {isFieldRequired("student.phone") && (
              <InputField
                label="Phone Number"
                field="student.phone"
                type="tel"
                placeholder="+60123456789"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            )}

            {isFieldRequired("student.current_address") && (
              <InputField
                label="Street Address"
                field="student.current_address"
                placeholder="No. 123, Jalan Tun Razak, Kuala Lumpur"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            )}
          </div>
        </div>
      )}

      {hasEmergencyFields && (
        <div className="mb-8">
          <h3 className="mb-4 font-semibold uppercase text-slate-900">
            Emergency Contacts
          </h3>
          {(student.emergency_contacts || [{}]).map((contact, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <InputField
                label="Name"
                field={`student.emergency_contacts[${idx}].name`}
                placeholder="John Doe"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Relation"
                field={`student.emergency_contacts[${idx}].relation`}
                placeholder="Father / Mother / Guardian"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Phone Number"
                field={`student.emergency_contacts[${idx}].phone`}
                placeholder="+60123456789"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Email"
                field={`student.emergency_contacts[${idx}].email`}
                placeholder="john.doe@gmail.com"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>
          ))}
        </div>
      )}

      {hasEducationalFields && (
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h3 className="mb-4 font-semibold uppercase text-slate-900">
              Educational Background
            </h3>
            <IconButton
              icon={<BookOpen className="h-4 w-4" />}
              bgColor="bg-blue-50"
              textColor="text-blue-700"
              borderColor="border-blue-600"
              hoverTextColor="hover:text-blue-800"
              hoverBorderColor="hover:border-blue-700"
              onClick={addEducation}
              disabled={!canAddEducation()}
            />
          </div>

          {(student.previous_educations || [{}]).map((edu, idx) => (
            <div key={idx} className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SearchableDropdown
                label="Highest Qualification"
                field={`student.previous_educations[${idx}].qualification`}
                options={qualifications.map((q) => ({
                  value: String(q.id),
                  label: q.name,
                }))}
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Institution Name"
                field={`student.previous_educations[${idx}].institution_name`}
                placeholder="University of Malaya"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Start Date"
                field={`student.previous_educations[${idx}].start_date`}
                type="date"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField
                label="End Date"
                field={`student.previous_educations[${idx}].end_date`}
                type="date"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
              <InputField
                label="Grade / GPA"
                field={`student.previous_educations[${idx}].grade`}
                placeholder="3.75 / 4.0"
                formData={formData}
                errors={errors}
                updateFormData={updateFormData}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}