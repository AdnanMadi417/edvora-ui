import React, { useState } from "react";
import {
  User,
  Languages,
  GraduationCap,
  Phone,
  Upload,
  FileText,
} from "lucide-react";
import NewApplicationSuccess from "../../popups/NewApplicationSuccess"

const stages = [
  { id: 1, name: "Personal Details", icon: User },
  { id: 2, name: "English Proficiency", icon: Languages },
  { id: 3, name: "Previous Education", icon: GraduationCap },
  { id: 4, name: "University & Program", icon: GraduationCap },
  { id: 5, name: "Emergency Contact", icon: Phone },
  { id: 6, name: "Documents Upload", icon: Upload },
];

export default function StudentApplication() {
  const [stage, setStage] = useState(1);
  const [completedStages, setCompletedStages] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [formData, setFormData] = useState({
    // Personal Details
    fullName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postalCode: "",

    // English Proficiency
    englishTest: "",
    testScore: "",
    testDate: "",
    listeningScore: "",
    readingScore: "",
    writingScore: "",
    speakingScore: "",

    // Previous Education
    highestQualification: "",
    institutionName: "",
    fieldOfStudy: "",
    graduationYear: "",
    gpa: "",

    // Emergency Contact
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    emergencyEmail: "",
    emergencyAddress: "",

    // University & Program
    universityName: "",
    programName: "",
    intakeMonth: "",
    intakeYear: "",
    modeOfStudy: "",

    // Documents
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
        if (!formData.fullName) newErrors.fullName = "First name is required";
        if (!formData.dateOfBirth)
          newErrors.dateOfBirth = "Date of birth is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.phone) newErrors.phone = "Phone is required";
        if (!formData.nationality)
          newErrors.nationality = "Nationality is required";
        break;
      case 2:
        if (!formData.englishTest)
          newErrors.englishTest = "Please select a test";
        if (!formData.testScore)
          newErrors.testScore = "Overall score is required";
        if (!formData.testDate) newErrors.testDate = "Test date is required";
        break;
      case 3:
        if (!formData.highestQualification)
          newErrors.highestQualification = "Qualification is required";
        if (!formData.institutionName)
          newErrors.institutionName = "Institution name is required";
        if (!formData.fieldOfStudy)
          newErrors.fieldOfStudy = "Field of study is required";
        if (!formData.graduationYear)
          newErrors.graduationYear = "Graduation year is required";
        break;
      case 4:
        if (!formData.universityName)
          newErrors.universityName = "University name is required";
        if (!formData.programName)
          newErrors.programName = "Program name is required";
        if (!formData.intakeMonth)
          newErrors.intakeMonth = "Intake month is required";
        if (!formData.intakeYear)
          newErrors.intakeYear = "Intake year is required";
        break;
      case 5:
        if (!formData.emergencyName)
          newErrors.emergencyName = "Contact name is required";
        if (!formData.emergencyRelationship)
          newErrors.emergencyRelationship = "Relationship is required";
        if (!formData.emergencyPhone)
          newErrors.emergencyPhone = "Contact phone is required";
        break;
      case 6:
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

  const canAccessStage = (stageId) => {
    return stageId === 1 || completedStages.includes(stageId - 1);
  };

  const handleSubmit = () => {
    if (validateStage(5)) {
      setShowPopup(true);

      const timer = setTimeout(() => {
        setShowPopup(false);
        location.reload();
      }, 3000);
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileData = files.map((file) => ({
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      type: file.type,
    }));
    updateFormData("uploadedDocs", [...formData.uploadedDocs, ...fileData]);
  };

  const removeDocument = (index) => {
    const newDocs = formData.uploadedDocs.filter((_, i) => i !== index);
    updateFormData("uploadedDocs", newDocs);
  };

  const InputField = ({
    label,
    field,
    type = "text",
    required = true,
    placeholder = "",
  }) => (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-text-primary">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <input
        type={type}
        value={formData[field]}
        onChange={(e) => updateFormData(field, e.target.value)}
        placeholder={placeholder}
        className={`mt-2 flex h-12 w-full items-center rounded-md border bg-transparent p-3 text-p2 outline-none px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500  transition-colors${
          errors[field] ? "border-red-500" : "border-default"
        }`}
      />
      {errors[field] && (
        <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
      )}
    </div>
  );

  const SelectField = ({ label, field, options, required = true }) => (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-text-primary">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <select
        value={formData[field]}
        onChange={(e) => updateFormData(field, e.target.value)}
        className={`mt-2 flex h-12 w-full items-center justify-center rounded-md border bg-transparent p-3 text-p2 outline-none px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500  transition-colors ${
          errors[field] ? "border-red-500" : "border-default"
        }`}
      >
        <option value="">Select...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {errors[field] && (
        <p className="mt-1 text-xs text-red-600">{errors[field]}</p>
      )}
    </div>
  );

  return (
    <section className="mx-auto mt-5 max-w-5xl">
      <div className="rounded-lg border border-gray-200 bg-card p-6">
        <div className="mb-6 flex items-start gap-x-3 gap-y-0 border-b-2 border-gray-100 pb-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
            <FileText className="text-blue-700" size={24} />
          </div>
          <div className="flex flex-col justify-center">
            <h3 className="text-xl font-semibold text-gray-900">
              New Student Application
            </h3>
            <p className="text-sm text-text-muted">
              Complete all sections to submit student application
            </p>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="xs:grid-cols-2 grid grid-cols-2 gap-x-3 gap-y-0 sm:grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))] sm:gap-2">
            {stages.map((s, index) => {
              const Icon = s.icon;
              const isActive = s.id === stage;
              const isCompleted = completedStages.includes(s.id);
              const canAccess = canAccessStage(s.id);

              return (
                <div
                  key={s.id}
                  className="relative flex flex-col items-center text-center"
                >
                  {index < stages.length - 1 && (
                    <div className="absolute -z-10 hidden sm:left-1/2 sm:top-6 sm:block sm:h-0.5 sm:w-full sm:bg-gray-300">
                      <div
                        className={`h-full transition-all duration-300 ${
                          completedStages.includes(s.id)
                            ? "w-full bg-blue-500"
                            : "w-0 bg-gray-300"
                        }`}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => canAccess && setStage(s.id)}
                    disabled={!canAccess}
                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full transition-all duration-300 ${
                      isCompleted
                        ? "bg-blue-500 text-white"
                        : isActive
                        ? "scale-110 bg-blue-100 text-blue-900"
                        : canAccess
                        ? "cursor-pointer bg-gray-100 text-text-muted hover:bg-gray-200"
                        : "cursor-not-allowed bg-gray-100 text-blue-900"
                    }`}
                    aria-label={s.name}
                    aria-current={isActive ? "step" : undefined}
                  >
                    <Icon size={20} />
                  </button>

                  <span
                    className={`px-1 text-center text-xs sm:text-sm ${
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

        <div className="mb-6 min-h-[400px] rounded-md border border-default bg-gray-50/50 p-6">
          {stage === 1 && (
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-900">
                Personal Information
              </h4>
              <div className="grid grid-cols-1 gap-x-3 gap-y-0 md:grid-cols-2">                <InputField
                  label="Full Name"
                  field="fullName"
                  placeholder="John"
                />
                <InputField
                  label="Date of Birth"
                  field="dateOfBirth"
                  type="date"
                />
                <SelectField
                  label="Gender"
                  field="gender"
                  options={["Male", "Female"]}
                />
                <InputField
                  label="Nationality"
                  field="nationality"
                  placeholder="Malaysian"
                />
                <InputField
                  label="Passport Number"
                  field="passportNumber"
                  placeholder="A12345678"
                />
                <InputField
                  label="Email Address"
                  field="email"
                  type="email"
                  placeholder="john.doe@example.com"
                />
                <InputField
                  label="Phone Number"
                  field="phone"
                  type="tel"
                  placeholder="+60123456789"
                />
              </div>

              <h5 className="text-md mb-3 mt-6 font-semibold text-gray-900">
                Address Details
              </h5>

              <div className="grid grid-cols-1 gap-x-3 gap-y-0 md:grid-cols-2">
                <div className="md:col-span-2">
                  <InputField
                    label="Street Address"
                    field="address"
                    placeholder="123 Main Street"
                  />
                </div>
                <InputField
                  label="City"
                  field="city"
                  placeholder="Kuala Lumpur"
                />
                <InputField
                  label="Country"
                  field="country"
                  placeholder="Malaysia"
                />
                <InputField
                  label="Postal Code"
                  field="postalCode"
                  placeholder="50000"
                />
              </div>
            </div>
          )}

          {stage === 2 && (
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-900">
                English Proficiency Test Results
              </h4>
              <div className="grid grid-cols-1 gap-x-3 gap-y-0 md:grid-cols-2">
                <SelectField
                  label="Test Type"
                  field="englishTest"
                  options={[
                    "IELTS",
                    "TOEFL",
                    "PTE",
                    "Duolingo",
                    "Cambridge English",
                  ]}
                />
                <InputField
                  label="Overall Score"
                  field="testScore"
                  placeholder="7.5"
                />
                <InputField label="Test Date" field="testDate" type="date" />
                <div></div>

                <h5 className="text-md col-span-full mt-2 font-semibold text-gray-900">
                  Band Scores (Optional)
                </h5>
                <InputField
                  label="Listening Score"
                  field="listeningScore"
                  required={false}
                  placeholder="8.0"
                />
                <InputField
                  label="Reading Score"
                  field="readingScore"
                  required={false}
                  placeholder="7.5"
                />
                <InputField
                  label="Writing Score"
                  field="writingScore"
                  required={false}
                  placeholder="7.0"
                />
                <InputField
                  label="Speaking Score"
                  field="speakingScore"
                  required={false}
                  placeholder="7.5"
                />
              </div>
            </div>
          )}

          {stage === 3 && (
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-900">
                Educational Background
              </h4>
              <div className="grid grid-cols-1 gap-x-3 gap-y-0 md:grid-cols-2">
                <SelectField
                  label="Highest Qualification"
                  field="highestQualification"
                  options={[
                    "High School",
                    "Diploma",
                    "Bachelor's Degree",
                    "Master's Degree",
                    "PhD",
                  ]}
                />
                <InputField
                  label="Institution Name"
                  field="institutionName"
                  placeholder="University of Example"
                />
                <InputField
                  label="Field of Study"
                  field="fieldOfStudy"
                  placeholder="Computer Science"
                />
                <InputField
                  label="Graduation Year"
                  field="graduationYear"
                  type="number"
                  placeholder="2023"
                />
                <InputField
                  label="GPA / Grade"
                  field="gpa"
                  placeholder="3.8 / 4.0"
                />
              </div>
            </div>
          )}

          {stage === 4 && (
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-900">
                University & Program Selection
              </h4>
              <div className="grid grid-cols-1 gap-x-3 gap-y-0 md:grid-cols-2">
                <SelectField
                  label="University"
                  field="universityName"
                  options={[
                    "Villanova University",
                    "University College Dublin",
                    "Trinity College Dublin",
                    "National University of Ireland Galway",
                    "Dublin City University",
                  ]}
                />
                <SelectField
                  label="Program"
                  field="programName"
                  options={[
                    "Master of Science in Computer Science",
                    "Master of Science in Software Engineering",
                    "Master of Data Science",
                    "Master of Artificial Intelligence",
                    "Master of Information Systems",
                  ]}
                />
                <SelectField
                  label="Intake Month"
                  field="intakeMonth"
                  options={[
                    "January",
                    "May",
                    "September",
                  ]}
                />
                <InputField
                  label="Intake Year"
                  field="intakeYear"
                  type="number"
                  placeholder="2025"
                />
                <SelectField
                  label="Mode of Study"
                  field="modeOfStudy"
                  options={["Full-time", "Part-time"]}
                />
              </div>
            </div>
          )}


          {stage === 5 && (
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-900">
                Emergency Contact Information
              </h4>
              <div className="grid grid-cols-1 gap-x-3 gap-y-0 md:grid-cols-2">
                <InputField
                  label="Contact Name"
                  field="emergencyName"
                  placeholder="Jane Doe"
                />
                <InputField
                  label="Relationship"
                  field="emergencyRelationship"
                  placeholder="Mother"
                />
                <InputField
                  label="Phone Number"
                  field="emergencyPhone"
                  type="tel"
                  placeholder="+60123456789"
                />
                <InputField
                  label="Email Address"
                  field="emergencyEmail"
                  type="email"
                  required={false}
                  placeholder="jane.doe@example.com"
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Address"
                    field="emergencyAddress"
                    required={false}
                    placeholder="123 Emergency Street"
                  />
                </div>
              </div>
            </div>
          )}

          {stage === 6 && (
            <div>
              <h4 className="mb-4 text-lg font-semibold text-gray-900">
                Upload Required Documents
              </h4>
              <div className="mb-4">
                <p className="mb-3 text-sm text-text-muted">
                  Please upload the following documents (PDF, JPG, or PNG
                  format):
                </p>
                <ul className="mb-4 list-inside list-disc space-y-1 text-sm text-text-muted">
                  <li>Passport copy</li>
                  <li>Academic transcripts</li>
                  <li>English proficiency test certificate</li>
                  <li>Passport-sized photo</li>
                </ul>

                <label className="block">
                  <div className="cursor-pointer rounded-md border-2 border-dashed border-default p-8 text-center transition hover:border-blue-500">
                    <Upload
                      className="mx-auto mb-2 text-text-muted"
                      size={40}
                    />
                    <p className="mb-1 text-sm text-text-muted">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-text-muted">
                      PDF, PNG, JPG (MAX. 10MB)
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
                <div className="mt-4">
                  <h5 className="mb-2 text-sm font-semibold text-text-primary">
                    Uploaded Documents:
                  </h5>
                  <div className="space-y-2">
                    {formData.uploadedDocs.map((doc, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-gray-200 bg-card p-3"
                      >
                        <div className="flex items-center gap-x-3 gap-y-0">
                          <FileText size={20} className="text-blue-500" />
                          <div>
                            <p className="text-sm font-medium text-text-primary">
                              {doc.name}
                            </p>
                            <p className="text-xs text-text-muted">
                              {doc.size}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeDocument(index)}
                          className="text-sm text-red-600 hover:text-red-600"
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

        <div className="flex w-full flex-col flex-wrap items-center justify-between gap-2 sm:flex-row sm:gap-2">
          <div className="w-full text-center text-sm text-text-muted sm:w-auto sm:text-left">
            Step {stage} of {stages.length} — {completedStages.length} completed
          </div>

          <div className="flex w-full flex-wrap justify-center gap-x-3 gap-y-0 sm:w-auto sm:justify-end">
            {stage > 1 && (
              <button
                onClick={prevStage}
                className="rounded-full border border-gray-300 px-6 py-2 text-text-muted transition hover:bg-gray-100"
              >
                Previous
              </button>
            )}

            {stage < stages.length ? (
              <button
                onClick={nextStage}
                className="rounded-full bg-blue-600 px-6 py-2 text-white transition hover:bg-blue-700"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="rounded-full bg-green-600 px-6 py-2 text-white transition hover:bg-green-700"
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
