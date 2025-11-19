import React, { useState } from "react";
import { User, GraduationCap, Phone, Upload, FileText, Check } from "lucide-react";
import NewApplicationSuccess from "../../popups/NewApplicationSuccess";
import {
  ENGLISH_TEST_OPTIONS,
  GENDER_OPTIONS,
  MALAYSIAN_UNIVERSITIES,
  MASTER_PROGRAMS,
  QUALIFICATION_OPTIONS,
} from "constants/lists";

const InputField = ({
  label,
  field,
  type = "text",
  required = true,
  placeholder = "",
  formData,
  errors,
  updateFormData,
}) => (
  <div className="mb-4">
    <label className="block text-p2 font-medium text-text-primary">
      {label} {required && <span className="text-red-600">*</span>}
    </label>

    <input
      type={type}
      value={formData[field] ?? ""}
      onChange={(e) => updateFormData(field, e.target.value)}
      placeholder={placeholder}
      className={`mt-2 flex h-12 w-full items-center justify-start rounded-md border p-3 px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1  focus:ring-blue-500 ${
        errors[field] ? "border-red-500" : "border-default"
      }`}
    />

    {errors[field] && (
      <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
    )}
  </div>
);

const SelectField = ({
  label,
  field,
  options,
  required = true,
  formData,
  errors,
  updateFormData,
}) => (
  <div className="mb-4">
    <label className="block text-p2 font-medium text-text-primary">
      {label} {required && <span className="text-red-600">*</span>}
    </label>

    <select
      value={formData[field] ?? ""}
      onChange={(e) => updateFormData(field, e.target.value)}
      className={`mt-2 flex h-12 w-full items-center justify-center rounded-md border p-3 px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
        errors[field] ? "border-red-500" : "border-default"
      }`}
    >
      <option value="">Select ...</option>
      {options.map((opt, index) => {
        // If option is an object with label/value
        if (typeof opt === "object" && opt !== null) {
          return (
            <option key={opt.value || index} value={opt.value || ""}>
              {opt.label || ""}
            </option>
          );
        }
        return (
          <option key={opt + index} value={opt}>
            {opt}
          </option>
        );
      })}
    </select>

    {errors[field] && (
      <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
    )}
  </div>
);

const stages = [
  { id: 1, name: "Personal Details", icon: User },
  { id: 2, name: "Previous Education", icon: GraduationCap },
  { id: 3, name: "University & Program", icon: GraduationCap },
  { id: 4, name: "Emergency Contact", icon: Phone },
  { id: 5, name: "Documents Upload", icon: Upload },
];
const REQUIRED_DOCUMENTS = [
  "High School Certificate",
  "Bachelor Certificate with Transcripts (For Master & PhD)",
  "Master Certificate with Transcripts (For PhD)",
  "Photo with White Background",
  "Passport Copy",
  "IELTS or TOEFL Certificate (if available)",
];


export default function StudentApplication() {
  const [stage, setStage] = useState(1);
  const [completedStages, setCompletedStages] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    email: "",
    phone: "",
    fullAddress: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",

    highestQualification: "",
    institutionName: "",
    fieldOfStudy: "",
    graduationYear: "",
    gpa: "",
    englishTest: "",
    testScore: "",

    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    emergencyEmail: "",
    emergencyAddress: "",

    universityName: "",
    programName: "",
    intakeYear: "",

    uploadedDocs: [],
  });

  const [errors, setErrors] = useState({});

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateStage = (stageNum) => {
    const newErrors = {};

    switch (stageNum) {
      case 1:
        if (!formData.fullName) newErrors.fullName = "Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phone) newErrors.phone = "Phone is required";
        if (!formData.nationality)
          newErrors.nationality = "Nationality is required";
        break;

      case 2:
        if (!formData.highestQualification)
          newErrors.highestQualification = "Qualification is required";
        if (!formData.institutionName)
          newErrors.institutionName = "Institution name is required";
        if (!formData.fieldOfStudy)
          newErrors.fieldOfStudy = "Field of study is required";
        if (!formData.graduationYear)
          newErrors.graduationYear = "Graduation year is required";
        if (!formData.englishTest)
          newErrors.englishTest = "Please select a test";
        break;

      case 3:
        if (!formData.universityName)
          newErrors.universityName = "University name is required";
        if (!formData.programName)
          newErrors.programName = "Program name is required";
        if (!formData.intakeYear)
          newErrors.intakeYear = "Intake year is required";
        break;

      case 4:
        break;

      case 5:
        if (formData.uploadedDocs.length === 0)
          newErrors.uploadedDocs = "Please upload at least one document";
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStage = () => {
    if (validateStage(stage)) {
      if (!completedStages.includes(stage)) {
        setCompletedStages((prev) => [...prev, stage]);
      }
      setStage(stage + 1);
    }
  };

  const prevStage = () => setStage(stage - 1);

  const canAccessStage = (id) => id === 1 || completedStages.includes(id - 1);

  const handleSubmit = () => {
    if (validateStage(5)) {
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        location.reload();
      }, 3000);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const mapped = files.map((f) => ({
      name: f.name,
      size: (f.size / 1024).toFixed(2) + " KB",
      type: f.type,
    }));
    updateFormData("uploadedDocs", [...formData.uploadedDocs, ...mapped]);
  };

  const removeDocument = (index) => {
    const newDocs = formData.uploadedDocs.filter((_, i) => i !== index);
    updateFormData("uploadedDocs", newDocs);
  };

  return (
    <section className="mx-auto mt-5 max-w-5xl">
      <div className="rounded-lg border border-gray-200 bg-card p-6">
        <div className="mb-6 flex items-start gap-x-3 border-b-2 border-gray-100 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <FileText className="text-blue-700" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              New Student Application
            </h3>
            <p className="text-sm text-text-muted">
              Complete all sections to submit student application
            </p>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))]">
            {stages.map((s, index) => {
              const Icon = s.icon;
              const isActive = s.id === stage;
              const isCompleted = completedStages.includes(s.id);
              const canAccess = canAccessStage(s.id);

              return (
                <div key={s.id} className="relative flex flex-col items-center">
                  {index < stages.length - 1 && (
                    <div className="absolute -z-10 hidden bg-gray-300 sm:left-1/2 sm:top-6 sm:block sm:h-0.5 sm:w-full">
                      <div
                        className={`h-full transition-all ${
                          isCompleted ? "w-full bg-blue-500" : "w-0"
                        }`}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => canAccess && setStage(s.id)}
                    disabled={!canAccess}
                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full transition ${
                      isCompleted
                        ? "bg-blue-500 text-white"
                        : isActive
                        ? "scale-110 bg-blue-100 text-gray-900"
                        : canAccess
                        ? "bg-gray-100 text-text-muted hover:bg-gray-200"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <Icon size={20} />
                  </button>

                  <span
                    className={`px-1 text-xs sm:text-sm ${
                      isActive ? "font-medium text-blue-900" : "text-blue-900"
                    }`}
                  >
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6 min-h-[400px] rounded-md border bg-gray-50 p-6">
          {stage === 1 && (
            <div className="mb-8">
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h4>
                  <div className="ml-4 flex-1 border-t-2 border-gray-900 opacity-70"></div>
                </div>
                <p className="text-sm text-gray-800">
                  Please fill in your personal details below.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InputField
                  label="Full Name"
                  field="fullName"
                  placeholder="Ahmad bin Ali"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Date of Birth"
                  field="dateOfBirth"
                  placeholder="DD/MM/YYYY"
                  type="date"
                  required={false}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <SelectField
                  label="Gender"
                  field="gender"
                  options={GENDER_OPTIONS}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Nationality"
                  field="nationality"
                  placeholder="Malaysian"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Passport Number"
                  field="passportNumber"
                  placeholder="A1234567"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Email Address"
                  field="email"
                  type="email"
                  placeholder="ahmad.ali@gmail.com"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Phone Number"
                  field="phone"
                  type="tel"
                  placeholder="+60123456789"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Street Address"
                    field="fullAddress"
                    placeholder="No. 123, Jalan Tun Razak, Kuala Lumpur"
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                  />
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-2 flex items-center">
                  <h5 className="text-lg font-semibold text-gray-900">
                    Parent / Guardian Information
                  </h5>
                  <div className="ml-4 flex-1 border-t-2 border-gray-900 opacity-70"></div>
                </div>
                <p className="mb-3 text-sm text-gray-800">
                  Optional information for parent or guardian contact.
                </p>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <InputField
                    label="Parent's Name"
                    field="parentName"
                    placeholder="Abdul Rahman bin Ismail"
                    required={false}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                  />
                  <InputField
                    label="Parent's Phone"
                    field="parentPhone"
                    type="tel"
                    placeholder="+60129876543"
                    required={false}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                  />
                  <InputField
                    label="Parent's Email"
                    field="parentEmail"
                    type="email"
                    placeholder="parent@example.com"
                    required={false}
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                  />
                </div>
              </div>
            </div>
          )}

          {stage === 2 && (
            <div>

              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Educational Background
                  </h4>
                  <div className="ml-4 flex-1 border-t-2 border-gray-900 opacity-70"></div>
                </div>
                <p className="text-sm text-gray-800">
                  Please fill in your educational background details below.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SelectField
                  label="Highest Qualification"
                  field="highestQualification"
                  options={QUALIFICATION_OPTIONS}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <InputField
                  label="Institution Name"
                  field="institutionName"
                  placeholder="University of Malaya"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <InputField
                  label="Field of Study"
                  field="fieldOfStudy"
                  placeholder="Computer Science"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <InputField
                  label="Graduation Year"
                  field="graduationYear"
                  type="number"
                  placeholder="2023"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <InputField
                  label="GPA / Grade"
                  field="gpa"
                  placeholder="3.75 / 4.0"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
              </div>

              <h5 className="mb-2 mt-4 font-semibold text-gray-900">
                English Proficiency Test Results
              </h5>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SelectField
                  label="Test Type"
                  field="englishTest"
                  options={ENGLISH_TEST_OPTIONS}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <InputField
                  label="Overall Score"
                  field="testScore"
                  placeholder="7.0"
                  required={false}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
              </div>
            </div>
          )}

          {stage === 3 && (
            <div>

              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">
                    University & Program Selection
                  </h4>
                  <div className="ml-4 flex-1 border-t-2 border-gray-900 opacity-70"></div>
                </div>
                <p className="text-sm text-gray-800">
                  Please select your preferred university and program.
                </p>
              </div>


              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SelectField
                  label="University"
                  field="universityName"
                  options={MALAYSIAN_UNIVERSITIES}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <SelectField
                  label="Program"
                  field="programName"
                  options={MASTER_PROGRAMS}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <InputField
                  label="Intake Year"
                  field="intakeYear"
                  type="number"
                  placeholder="2025"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
              </div>
            </div>
          )}

          {stage === 4 && (
            <div>

              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Emergency Contact Information
                  </h4>
                  <div className="ml-4 flex-1 border-t-2 border-gray-900 opacity-70"></div>
                </div>
                <p className="text-sm text-gray-800">
                  You may provide an emergency contact for safety purposes. This is not required.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InputField
                  label="Contact Name"
                  field="emergencyName"
                  placeholder="Ahmad bin Ismail"
                  formData={formData}
                  errors={errors}
                  required={false}
                  updateFormData={updateFormData}
                />

                <InputField
                  label="Relationship"
                  field="emergencyRelationship"
                  placeholder="Father / Mother / Guardian"
                  formData={formData}
                  errors={errors}
                  required={false}
                  updateFormData={updateFormData}
                />

                <InputField
                  label="Phone Number"
                  field="emergencyPhone"
                  type="tel"
                  placeholder="+60123456789"
                  formData={formData}
                  errors={errors}
                  required={false}
                  updateFormData={updateFormData}
                />

                <InputField
                  label="Email Address"
                  field="emergencyEmail"
                  type="email"
                  required={false}
                  placeholder="ahmad.ismail@example.com"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

                <div className="md:col-span-2">
                  <InputField
                    label="Address"
                    field="emergencyAddress"
                    required={false}
                    placeholder="No. 123, Jalan Bukit Bintang, Kuala Lumpur"
                    formData={formData}
                    errors={errors}
                    updateFormData={updateFormData}
                  />
                </div>
              </div>
            </div>
          )}

          {stage === 5 && (
            <div>

              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">
                    Upload Required Documents
                  </h4>
                  <div className="ml-4 flex-1 border-t-2 border-gray-900 opacity-70"></div>
                </div>
                <p className="text-sm text-gray-800">
                  Please upload all necessary documents to complete your application.
                </p>
              </div>

              <div className="p-4 m-y-2">
                <h4 className="mb-3 text-sm font-semibold text-gray-800">
                  Required Documents
                </h4>

                <ul className="space-y-0">
                  {REQUIRED_DOCUMENTS.map((doc, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-2 rounded-md p-0 "
                    >
                      <Check className="mt-1 text-blue-700 w-4 h-4 flex-shrink-0" />
                      <span className="text-p2 text-text-muted">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>


              <div className="mb-4">
                <label className="block">
                  <div className="cursor-pointer rounded-md border-2 border-dashed p-8 text-center hover:border-blue-500">
                    <Upload
                      size={40}
                      className="mx-auto mb-2 text-text-muted"
                    />
                    <p className="text-sm">Click to upload or drag and drop</p>
                    <p className="text-xs text-text-muted">
                      PDF, PNG, JPG (MAX 10MB)
                    </p>
                  </div>

                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {errors.uploadedDocs && (
                  <p className="mt-2 text-xs text-red-600">
                    {errors.uploadedDocs}
                  </p>
                )}
              </div>

              {formData.uploadedDocs.length > 0 && (
                <div>
                  <h5 className="mb-2 font-semibold text-text-primary">
                    Uploaded Documents:
                  </h5>

                  <div className="space-y-2">
                    {formData.uploadedDocs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between rounded-md border bg-card p-3"
                      >
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{doc.name}</p>
                            <p className="text-xs text-text-muted">
                              {doc.size}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => removeDocument(idx)}
                          className="text-sm text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="text-sm text-text-muted">
            Step {stage} of {stages.length} — {completedStages.length} completed
          </div>

          <div className="flex gap-3">
            {stage > 1 && (
              <button
                onClick={prevStage}
                className="rounded-full border px-6 py-2 text-text-muted hover:bg-gray-100"
              >
                Previous
              </button>
            )}

            {stage < stages.length ? (
              <button
                onClick={nextStage}
                className="rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="rounded-full bg-green-600 px-6 py-2 text-white hover:bg-green-700"
              >
                Submit Application
              </button>
            )}
          </div>

          {showPopup && <NewApplicationSuccess />}
        </div>
      </div>
    </section>
  );
}
