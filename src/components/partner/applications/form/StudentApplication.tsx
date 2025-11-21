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


const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path.split(/[\.\[\]]/).filter(Boolean).reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const setNestedValue = (obj, path, value) => {
  const keys = path.split(/[\.\[\]]/).filter(Boolean);
  const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
  let cur = newObj;
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const nextKey = keys[i + 1];
    const isLast = i === keys.length - 1;

    const nextIsIndex = !isNaN(Number(nextKey));

    if (isLast) {
      cur[k] = value;
    } else {
      if (cur[k] === undefined || cur[k] === null) {
        cur[k] = nextIsIndex ? [] : {};
      } else {

        cur[k] = Array.isArray(cur[k]) ? [...cur[k]] : { ...cur[k] };
      }
      cur = cur[k];
    }
  }
  return newObj;
};

const InputField = ({
                      label,
                      field,
                      type = "text",
                      required = true,
                      placeholder = "",
                      formData,
                      errors,
                      updateFormData,
                    }) => {
  const value = getNestedValue(formData, field) ?? "";
  return (
    <div className="mb-4">
      <label className="block text-p2 font-medium text-text-primary">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) => updateFormData(field, e.target.value)}
        placeholder={placeholder}
        className={`mt-2 flex h-12 w-full items-center justify-start rounded-md border p-3 px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1  focus:ring-blue-500 ${
          getNestedValue(errors, field) ? "border-red-500" : "border-default"
        }`}
      />

      {getNestedValue(errors, field) && (
        <p className="mt-1 text-xs text-red-600">{getNestedValue(errors, field)}</p>
      )}
    </div>
  );
};

const SelectField = ({
                       label,
                       field,
                       options,
                       required = true,
                       formData,
                       errors,
                       updateFormData,
                     }) => {
  const value = getNestedValue(formData, field) ?? "";
  return (
    <div className="mb-4">
      <label className="block text-p2 font-medium text-text-primary">
        {label} {required && <span className="text-red-600">*</span>}
      </label>

      <select
        value={value}
        onChange={(e) => updateFormData(field, e.target.value)}
        className={`mt-2 flex h-12 w-full items-center justify-center rounded-md border p-3 px-3 py-2 text-p2 text-sm outline-none transition-colors focus:outline-none focus:ring-1 focus:ring-blue-500 ${
          getNestedValue(errors, field) ? "border-red-500" : "border-default"
        }`}
      >
        <option value="">Select ...</option>
        {options.map((opt, index) => {
          if (typeof opt === "object" && opt !== null) {
            return (
              <option key={opt.value ?? index} value={opt.value ?? ""}>
                {opt.label ?? opt.value ?? ""}
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

      {getNestedValue(errors, field) && (
        <p className="mt-1 text-xs text-red-600">{getNestedValue(errors, field)}</p>
      )}
    </div>
  );
};

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
    program_id: "",
    university_id: "",
    student_id: "",

    student: {
      name: "",
      birthday: "",
      nationality: "",
      passport_number: "",
      email: "",
      phone: "",
      current_address: "",
      gender: "",

      emergency_contacts: [
        {
          name: "",
          relation: "",
          phone: "",
          email: "",
        },
      ],

      english_proficiencies: [
        {
          test_type: "",
          score: "",
          test_date: "",
        },
      ],

      previous_educations: [
        {
          institution_name: "",
          qualification: "",
          start_date: "",
          end_date: "",
          grade: "",
          field_of_study: "",
        },
      ],
    },

    documents: [],

    is_draft: false,
  });

  const [errors, setErrors] = useState({});

  const updateFormData = (fieldPath, value) => {
    setFormData((prev) => setNestedValue(prev, fieldPath, value));

    setErrors((prev) => setNestedValue(prev || {}, fieldPath, ""));
  };

  const validateStage = (stageNum) => {
    const newErrors = {};

    switch (stageNum) {
      case 1: {
        if (!getNestedValue(formData, "student.name")) newErrors["student.name"] = "Name is required";
        if (!getNestedValue(formData, "student.birthday")) newErrors["student.birthday"] = "Birthday is required";
        if (!getNestedValue(formData, "student.email")) newErrors["student.email"] = "Email is required";
        if (!getNestedValue(formData, "student.phone")) newErrors["student.phone"] = "Phone is required";
        if (!getNestedValue(formData, "student.nationality"))
          newErrors["student.nationality"] = "Nationality is required";
        if (!getNestedValue(formData, "student.passport_number"))
          newErrors["student.passport_number"] = "Passport number is required";
        break;
      }

      case 2: {
        const prevEdu = getNestedValue(formData, "student.previous_educations[0]") || {};
        if (!prevEdu.qualification) newErrors["student.previous_educations[0].qualification"] = "Qualification is required";
        if (!prevEdu.institution_name) newErrors["student.previous_educations[0].institution_name"] = "Institution name is required";
        if (!prevEdu.end_date) newErrors["student.previous_educations[0].end_date"] = "Graduation year is required";

        const eng = getNestedValue(formData, "student.english_proficiencies[0]") || {};
        if (!eng.test_type) newErrors["student.english_proficiencies[0].test_type"] = "Please select a test";

        break;
      }

      case 3: {
        if (!formData.university_id) newErrors["university_id"] = "University is required";
        if (!formData.program_id) newErrors["program_id"] = "Program is required";
        if (!getNestedValue(formData, "student.previous_educations[0].start_date") && !getNestedValue(formData, "student.previous_educations[0].end_date")) {

        }
        break;
      }

      case 4: {

        const ec = getNestedValue(formData, "student.emergency_contacts[0]") || {};
        if (ec.name && !ec.phone) newErrors["student.emergency_contacts[0].phone"] = "Phone is required for emergency contact";
        break;
      }

      case 5: {
        if (!formData.documents || formData.documents.length === 0)
          newErrors["documents"] = "Please upload at least one document";
        break;
      }

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStage = () => {
    if (validateStage(stage)) {
      if (!completedStages.includes(stage)) setCompletedStages((prev) => [...prev, stage]);
      setStage((s) => s + 1);
    } else {

    }
  };

  const prevStage = () => setStage((s) => s - 1);
  const canAccessStage = (id) => id === 1 || completedStages.includes(id - 1);

  const mapGenderToBoolean = (g) => {


    if (typeof g === "boolean") return g;
    if (!g) return null;
    const val = String(g).toLowerCase();
    if (val === "male" || val === "m" || val === "true") return true;
    if (val === "female" || val === "f" || val === "false") return false;
    return null;
  };

  const handleSubmit = () => {

    const ok = validateStage(5) && validateStage(1) && validateStage(2) && validateStage(3);
    if (!ok) {

      return;
    }

    const payload = {
      program_id: formData.program_id,
      university_id: formData.university_id,
      student_id: formData.student_id || "",

      student: {
        name: getNestedValue(formData, "student.name") || "",
        birthday: getNestedValue(formData, "student.birthday") || "",
        nationality: getNestedValue(formData, "student.nationality") || "",
        passport_number: getNestedValue(formData, "student.passport_number") || "",
        email: getNestedValue(formData, "student.email") || "",
        phone: getNestedValue(formData, "student.phone") || "",
        current_address: getNestedValue(formData, "student.current_address") || "",
        gender: mapGenderToBoolean(getNestedValue(formData, "student.gender")),
        emergency_contacts: (getNestedValue(formData, "student.emergency_contacts") || []).map((c) => ({
          name: c.name || "",
          relation: c.relation || "",
          phone: c.phone || "",
          email: c.email || "",
        })),
        english_proficiencies: (getNestedValue(formData, "student.english_proficiencies") || []).map((e) => ({
          test_type: e.test_type || "",
          score: e.score || "",
          test_date: e.test_date || "",
        })),
        previous_educations: (getNestedValue(formData, "student.previous_educations") || []).map((p) => ({
          institution_name: p.institution_name || "",
          qualification: p.qualification || "",
          start_date: p.start_date || "",
          end_date: p.end_date || "",
          grade: p.grade || "",
          field_of_study: p.field_of_study || "",
        })),

      },

      documents: (formData.documents || []).map((d) => ({
        document_type_id: d.document_type_id || "",
        file_url: d.file_url || "",
      })),

      is_draft: !!formData.is_draft,
    };


    console.log(JSON.stringify(payload, null, 2));

    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);

    const mapped = files.map((f) => ({
      document_type_id: "",
      file_url: "",

      name: f.name,
      size: (f.size / 1024).toFixed(2) + " KB",
      raw: f,
    }));

    setFormData((prev) => {
      const existing = getNestedValue(prev, "documents") || [];
      const updated = [...existing, ...mapped];
      return setNestedValue(prev, "documents", updated);
    });

    setErrors((prev) => setNestedValue(prev || {}, "documents", ""));
  };

  const removeDocument = (index) => {
    const current = formData.documents || [];
    const updated = current.filter((_, i) => i !== index);
    setFormData((prev) => setNestedValue(prev, "documents", updated));
  };

  return (
    <section className="mx-auto mt-5 max-w-5xl">
      <div className="rounded-lg border border-gray-200 bg-card p-6">
        <div className="mb-6 flex items-start gap-x-3 border-b-2 border-gray-100 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
            <FileText className="text-blue-700" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">New Student Application</h3>
            <p className="text-sm text-text-muted">Complete all sections to submit student application</p>
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
                      <div className={`h-full transition-all ${isCompleted ? "w-full bg-blue-500" : "w-0"}`} />
                    </div>
                  )}

                  <button
                    onClick={() => canAccess && setStage(s.id)}
                    disabled={!canAccess}
                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-full transition ${
                      isCompleted ? "bg-blue-500 text-white" : isActive ? "scale-110 bg-blue-100 text-gray-900" : canAccess ? "bg-gray-100 text-text-muted hover:bg-gray-200" : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <Icon size={20} />
                  </button>

                  <span className={`px-1 text-xs sm:text-sm ${isActive ? "font-medium text-blue-900" : "text-blue-900"}`}>{s.name}</span>
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
                  <h4 className="text-lg font-semibold text-gray-900">Personal Information</h4>
                  <div className="ml-4 flex-1 border-t-2 border-gray-900 opacity-70"></div>
                </div>
                <p className="text-sm text-gray-800">Please fill in your personal details below.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InputField label="Full Name" field="student.name" placeholder="Ahmad bin Ali" formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="Date of Birth" field="student.birthday" placeholder="DD/MM/YYYY" type="date" required={false} formData={formData} errors={errors} updateFormData={updateFormData} />
                <SelectField label="Gender" field="student.gender" options={GENDER_OPTIONS} formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="Nationality" field="student.nationality" placeholder="Malaysian" formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="Passport Number" field="student.passport_number" placeholder="A1234567" formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="Email Address" field="student.email" type="email" placeholder="ahmad.ali@gmail.com" formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="Phone Number" field="student.phone" type="tel" placeholder="+60123456789" formData={formData} errors={errors} updateFormData={updateFormData} />
                <div className="md:col-span-2">
                  <InputField label="Street Address" field="student.current_address" placeholder="No. 123, Jalan Tun Razak, Kuala Lumpur" formData={formData} errors={errors} updateFormData={updateFormData} />
                </div>
              </div>
            </div>
          )}

          {stage === 2 && (
            <div>
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">Educational Background</h4>
                  <div className="ml-4 flex-1 border-t-2 border-gray-900 opacity-70"></div>
                </div>
                <p className="text-sm text-gray-800">Please fill in your educational background details below.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SelectField label="Highest Qualification" field="student.previous_educations[0].qualification" options={QUALIFICATION_OPTIONS} formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="Institution Name" field="student.previous_educations[0].institution_name" placeholder="University of Malaya" formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="Field of Study" field="student.previous_educations[0].field_of_study" placeholder="Computer Science" formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="Graduation Year" field="student.previous_educations[0].end_date" type="number" placeholder="2023" formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="GPA / Grade" field="student.previous_educations[0].grade" placeholder="3.75 / 4.0" formData={formData} errors={errors} updateFormData={updateFormData} />
              </div>

              <h5 className="mb-2 mt-4 font-semibold text-gray-900">English Proficiency Test Results</h5>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SelectField label="Test Type" field="student.english_proficiencies[0].test_type" options={ENGLISH_TEST_OPTIONS} formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="Overall Score" field="student.english_proficiencies[0].score" placeholder="7.0" required={false} formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="Test Date" field="student.english_proficiencies[0].test_date" type="date" required={false} formData={formData} errors={errors} updateFormData={updateFormData} />
              </div>
            </div>
          )}

          {stage === 3 && (
            <div>
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">University & Program Selection</h4>
                  <div className="ml-4 flex-1 border-t-2 border-gray-900 opacity-70"></div>
                </div>
                <p className="text-sm text-gray-800">Please select your preferred university and program.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                <SelectField label="University" field="university_id" options={MALAYSIAN_UNIVERSITIES} formData={formData} errors={errors} updateFormData={updateFormData} />
                <SelectField label="Program" field="program_id" options={MASTER_PROGRAMS} formData={formData} errors={errors} updateFormData={updateFormData} />
                <InputField label="Intake Year" field="student.previous_educations[0].start_date" type="number" placeholder="2025" formData={formData} errors={errors} updateFormData={updateFormData} />
              </div>
            </div>
          )}

          {stage === 4 && (
            <div>
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">Emergency Contact Information</h4>
                  <div className="ml-4 flex-1 border-t-2 border-gray-900 opacity-70"></div>
                </div>
                <p className="text-sm text-gray-800">You may provide an emergency contact for safety purposes. This is not required.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InputField label="Contact Name" field="student.emergency_contacts[0].name" placeholder="Ahmad bin Ismail" formData={formData} errors={errors} required={false} updateFormData={updateFormData} />
                <InputField label="Relationship" field="student.emergency_contacts[0].relation" placeholder="Father / Mother / Guardian" formData={formData} errors={errors} required={false} updateFormData={updateFormData} />
                <InputField label="Phone Number" field="student.emergency_contacts[0].phone" type="tel" placeholder="+60123456789" formData={formData} errors={errors} required={false} updateFormData={updateFormData} />
                <InputField label="Email Address" field="student.emergency_contacts[0].email" type="email" placeholder="ahmad.ismail@example.com" formData={formData} errors={errors} required={false} updateFormData={updateFormData} />
                <div className="md:col-span-2">
                  <InputField label="Address" field="student.emergency_contacts[0].address" required={false} placeholder="No. 123, Jalan Bukit Bintang, Kuala Lumpur" formData={formData} errors={errors} updateFormData={updateFormData} />
                </div>
              </div>
            </div>
          )}

          {stage === 5 && (
            <div>
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">Upload Required Documents</h4>
                  <div className="ml-4 flex-1 border-t-2 border-gray-900 opacity-70"></div>
                </div>
                <p className="text-sm text-gray-800">Please upload all necessary documents to complete your application.</p>
              </div>

              <div className="p-4 m-y-2">
                <h4 className="mb-3 text-sm font-semibold text-gray-800">Required Documents</h4>
                <ul className="space-y-0">
                  {REQUIRED_DOCUMENTS.map((doc, index) => (
                    <li key={index} className="flex items-start gap-2 rounded-md p-0 ">
                      <Check className="mt-1 text-blue-700 w-4 h-4 flex-shrink-0" />
                      <span className="text-p2 text-text-muted">{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <label className="block">
                  <div className="cursor-pointer rounded-md border-2 border-dashed p-8 text-center hover:border-blue-500">
                    <Upload size={40} className="mx-auto mb-2 text-text-muted" />
                    <p className="text-sm">Click to upload or drag and drop</p>
                    <p className="text-xs text-text-muted">PDF, PNG, JPG (MAX 10MB)</p>
                  </div>

                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="hidden" />
                </label>

                {errors.documents && <p className="mt-2 text-xs text-red-600">{errors.documents}</p>}
              </div>

              {formData.documents.length > 0 && (
                <div>
                  <h5 className="mb-2 font-semibold text-text-primary">Uploaded Documents:</h5>

                  <div className="space-y-2">
                    {formData.documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-md border bg-card p-3">
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-blue-500" />
                          <div>
                            <p className="text-sm font-medium">{doc.name || doc.file_url}</p>
                            <p className="text-xs text-text-muted">{doc.size}</p>
                          </div>
                        </div>

                        <button onClick={() => removeDocument(idx)} className="text-sm text-red-600">
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
          <div className="text-sm text-text-muted">Step {stage} of {stages.length} — {completedStages.length} completed</div>

          <div className="flex gap-3">
            {stage > 1 && <button onClick={prevStage} className="rounded-full border px-6 py-2 text-text-muted hover:bg-gray-100">Previous</button>}

            {stage < stages.length ? (
              <button onClick={nextStage} className="rounded-full bg-blue-600 px-6 py-2 text-white hover:bg-blue-700">Next</button>
            ) : (
              <button onClick={handleSubmit} className="rounded-full bg-green-600 px-6 py-2 text-white hover:bg-green-700">Submit Application</button>
            )}
          </div>

          {showPopup && <NewApplicationSuccess />}
        </div>
      </div>
    </section>
  );
}
