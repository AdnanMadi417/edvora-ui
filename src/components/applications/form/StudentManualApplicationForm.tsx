import React, { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Phone,
  Upload,
  FileText,
  ArrowLeft, ArrowRight,
} from 'lucide-react';
import { ENGLISH_TEST_OPTIONS, NATIONALITIES } from "../../../constants/lists";
import { useToast } from "../../context/ToastContext";

import api from "../../../lib/useApi";
import { useAllQualifications } from "../../../hooks/knowledge-hub/qualifications/useQualificationsList";
import { useCreatePartnerApplication } from "../../../hooks/applications/useCreatePartnerApplication";

import Cookies from "js-cookie";
import { useUniversities } from "../../../hooks/useUniversities";
import { InputField, SelectField, RadioField } from "../../form";
import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "../../../services/uploadService";
import { useMe } from "../../../hooks/useMe";
import { usePartnerProgramIntakeDates } from "../../../hooks/knowledge-hub/programs/usePartnerProgramIntakeDates";
import Loading from "../../loading/Loading";
import Button from "../../ui/buttons/Button";
import PrevButton from '../../ui/buttons/PrevButton';
import NextButton from '../../ui/buttons/NextButton';
import FileUploadField from '../../form/filesUpload/FileUploadField';

interface Student {
  name: string;
  birthday: string;
  nationality: string;
  passport_number: string;
  email: string;
  phone: string;
  current_address: string;
  gender: string | null;
  emergency_contacts: {
    name: string;
    relation: string;
    phone: string;
    email: string;
  }[];
  english_proficiencies: {
    test_type: string;
    score: string;
    test_date: string;
  }[];
  previous_educations: {
    institution_name: string;
    qualification: string;
    start_date: string;
    end_date: string;
    grade: string;
  }[];
}

interface DocumentItem {
  document_type_id: string;
  file_url: string;
  file_key?: string;
  name?: string;
  size?: string;
  raw?: File;
  uploading?: boolean;
  progress?: number;
}

type DocumentType = {
  id: string;
  type: string;
  description: string;
};

interface FormDataType {
  program_id: string;
  university_id: string;
  intake_date: string;
  student_id: string;
  student: Student;
  documents: DocumentItem[];
  is_draft: boolean;
}

const getNestedValue = (obj, path) => {
  if (!path) return undefined;
  return path
    .split(/[\.\[\]]/)
    .filter(Boolean)
    .reduce((acc, key) => (acc ? acc[key] : undefined), obj);
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

const stages = [
  { id: 1, name: "Personal Details", icon: User },
  { id: 2, name: "Previous Education", icon: GraduationCap },
  { id: 3, name: "University & Program", icon: GraduationCap },
  { id: 4, name: "Emergency Contact", icon: Phone },
  { id: 5, name: "Documents Upload", icon: Upload },
];

export default function StudentManualApplicationForm() {
  const [stage, setStage] = useState(1);
  const [completedStages, setCompletedStages] = useState([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  const { user } = useMe();
  const partnerId = user?.partner_id;

  const {
    universities,
    loading: universitiesLoading,
    error: universitiesError,
  } = useUniversities();

  const {
    createPartnerApplication,
    loadingCreatePartnerApplication,
    errorCreatePartnerApplication,
  } = useCreatePartnerApplication(partnerId);

  const { qualifications } = useAllQualifications();

  const [documentTypes, setDocumentTypes] = useState<
    { id: string; type: string; description: string }[]
  >([]);

  const [initOnly, setInitOnly] = useState(true);

  const getCurrentDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState<FormDataType>({
    program_id: "",
    university_id: "",
    intake_date: getCurrentDate().toString(),
    student_id: "",
    student: {
      name: "",
      birthday: "",
      nationality: "",
      passport_number: "",
      email: "",
      phone: "",
      current_address: "",
      gender: null,
      emergency_contacts: [{ name: "", relation: "", phone: "", email: "" }],
      english_proficiencies: [{ test_type: "", score: "", test_date: "" }],
      previous_educations: [
        {
          institution_name: "",
          qualification: "",
          start_date: "",
          end_date: "",
          grade: "",
        },
      ],
    },
    documents: [],
    is_draft: false,
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const updateFormData = (fieldPath, value) => {
    setFormData((prev) => setNestedValue(prev, fieldPath, value));
    setErrors((prev) => setNestedValue(prev || {}, fieldPath, ""));
  };

  const { intakeDates } = usePartnerProgramIntakeDates(formData.program_id, partnerId);

  useEffect(() => {
    if (intakeDates.length > 0) {
      setFormData((prev) => ({ ...prev, intake_date: intakeDates[0] }));
    }
  }, [intakeDates]);

  const addCompletedStage = (s) => {
    setCompletedStages((prev) => {
      const set = new Set(prev);
      set.add(s);
      return Array.from(set).sort((a, b) => a - b);
    });
  };

  const validateStage = (stageNum) => {
    const newErrors = {};

    switch (stageNum) {
      case 1: {
        if (!getNestedValue(formData, "student.name"))
          newErrors["student.name"] = "Name is required";
        if (!getNestedValue(formData, "student.birthday"))
          newErrors["student.birthday"] = "Birthday is required";
        if (formData.student.gender === null)
          newErrors["student.gender"] = "Gender is required";
        if (!getNestedValue(formData, "student.email"))
          newErrors["student.email"] = "Email is required";
        if (!getNestedValue(formData, "student.phone"))
          newErrors["student.phone"] = "Phone is required";
        if (!getNestedValue(formData, "student.nationality"))
          newErrors["student.nationality"] = "Nationality is required";
        if (!getNestedValue(formData, "student.passport_number"))
          newErrors["student.passport_number"] = "Passport number is required";
        break;
      }

      case 2: {
        const prevEdu =
          getNestedValue(formData, "student.previous_educations[0]") || {};
        if (!prevEdu.qualification)
          newErrors["student.previous_educations[0].qualification"] =
            "Qualification is required";
        if (!prevEdu.institution_name)
          newErrors["student.previous_educations[0].institution_name"] =
            "Institution name is required";
        if (!prevEdu.end_date)
          newErrors["student.previous_educations[0].end_date"] =
            "Graduation year is required";

        const eng =
          getNestedValue(formData, "student.english_proficiencies[0]") || {};
        if (!eng.test_type)
          newErrors["student.english_proficiencies[0].test_type"] =
            "Please select a test";

        break;
      }

      case 3: {
        if (!formData.university_id)
          newErrors["university_id"] = "University is required";
        if (!formData.program_id)
          newErrors["program_id"] = "Program is required";
        break;
      }

      case 4: {
        const ec =
          getNestedValue(formData, "student.emergency_contacts[0]") || {};
        if (ec.name && !ec.phone)
          newErrors["student.emergency_contacts[0].phone"] =
            "Phone is required for emergency contact";
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

  const nextStage = async () => {
    if (validateStage(stage)) {
      addCompletedStage(stage);
      setStage((s) => Math.min(s + 1, stages.length));
    } else {
    }
  };

  const prevStage = () => setStage((s) => Math.max(1, s - 1));

  const canAccessStage = (id) => {
    if (id === 1) return true;
    if (id === stage) return true;
    return completedStages.includes(id - 1);
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = Cookies.get("token");
        const partnerId = localStorage.getItem("partnerId");
      } catch (err) {
        console.error("Error during initial fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      const token = Cookies.get("token");

      const res = await api.get("/document-types", {
        params: { init_only: initOnly },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setDocumentTypes(res.data || []);
    };

    fetchDocumentTypes();
  }, [initOnly]);

  useEffect(() => {
    const fetchDocumentTypes = async () => {
      try {
        const token = Cookies.get("token");

        const res = await api.get("/document-types", {
          params: {
            init_only: true, // or false
          },
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setDocumentTypes(res.data || []);
      } catch (err) {
        console.error("Failed to fetch document types", err);
      }
    };

    fetchDocumentTypes();
  }, []);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    document_type_id: string
  ) => {
    const files: File[] = Array.from(e.target.files || []);
    if (!files.length) return;

    const placeholders: DocumentItem[] = files.map((file) => ({
      document_type_id,
      file_url: "",
      file_key: "",
      name: file.name,
      size: (file.size / 1024).toFixed(2) + " KB",
      raw: file,
      uploading: true,
      progress: 0,
    }));

    setFormData((prev) => {
      const docs = prev.documents.filter(
        (d) => d.document_type_id !== document_type_id
      );
      return { ...prev, documents: [...docs, ...placeholders] };
    });

    try {
      const presigned = await getPresignedUploads(files, "documents");

      const results = await uploadFilesToSpaces(
        files,
        presigned,
        (fileIndex, pct) => {
          // Update progress in state
          setFormData((prev) => {
            const docs = [...prev.documents];
            const idx = docs.findIndex((d) => d.raw === files[fileIndex]);
            if (idx !== -1) {
              docs[idx] = { ...docs[idx], progress: pct };
            }
            return { ...prev, documents: docs };
          });
        }
      );

      setFormData((prev) => {
        const docs = [...prev.documents];
        files.forEach((file, i) => {
          const idx = docs.findIndex((d) => d.raw === file);
          if (idx !== -1) {
            docs[idx] = {
              ...docs[idx],
              uploading: false,
              progress: 100,
              file_url: results[i].public_url,
              file_key: results[i].file_key,
            };
          }
        });
        return { ...prev, documents: docs };
      });

      showToast("File uploaded successfully", "success");
    } catch (err: any) {
      console.error("Error uploading file:", err);
      showToast(err?.message || "Upload failed", "error");

      setFormData((prev) => ({
        ...prev,
        documents: prev.documents.map((d) =>
          d.uploading ? { ...d, uploading: false } : d
        ),
      }));
    }
  };

  const removeDocument = async (document_type_id: string) => {
    const doc = formData.documents.find(
      (d) => d.document_type_id === document_type_id
    );
    if (!doc) return;

    if (doc.file_key) {
      try {
        const token = Cookies.get("token");
        await api.delete("/storage/file", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          data: { file_key: doc.file_key },
        });
        showToast("File deleted from storage successfully", "success");
      } catch (err) {
        console.error(err);
        showToast("Failed to delete file from storage", "error");
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter(
        (d) => d.document_type_id !== document_type_id
      ),
    }));
  };

  const isStageValid = (stageNum: number) => {
    switch (stageNum) {
      case 1:
        return (
          formData.student.name &&
          formData.student.birthday &&
          formData.student.gender !== null &&
          formData.student.email &&
          formData.student.phone &&
          formData.student.nationality &&
          formData.student.passport_number
        );

      case 2:
        return (
          formData.student.previous_educations[0]?.qualification &&
          formData.student.previous_educations[0]?.institution_name &&
          formData.student.previous_educations[0]?.end_date &&
          formData.student.english_proficiencies[0]?.test_type
        );

      case 3:
        return formData.university_id && formData.program_id;

      case 4:
        return true; // optional stage

      case 5:
        return formData.documents.length > 0;

      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    const allValid =
      validateStage(1) &&
      validateStage(2) &&
      validateStage(3) &&
      validateStage(4) &&
      validateStage(5);

    if (!allValid) return;

    const uploadingFiles = formData.documents?.filter((d) => d.uploading);
    if (uploadingFiles?.length > 0) {
      showToast("Please wait for all files to finish uploading.", "error");
      return;
    }

    const missingDocs = documentTypes.filter((docType) => {
      return !formData.documents.some(
        (d) => d.document_type_id === docType.id && d.file_url && !d.uploading
      );
    });

    if (missingDocs.length > 0) {
      showToast(
        `Please upload all required documents: ${missingDocs
          .map((d) => d.type)
          .join(", ")}`,
        "error"
      );
      return;
    }

    const payload: any = {
      program_id: formData.program_id,
      university_id: formData.university_id,
      intake_date: formData.intake_date,
      student: {
        ...formData.student,

        english_proficiencies: formData.student.english_proficiencies.map(
          (e) => ({
            test_type: e.test_type || "N/A",
            score: e.score || "",
            test_date: e.test_date
              ? new Date(e.test_date).toISOString().split("T")[0]
              : getCurrentDate(),
          })
        ),

        previous_educations: formData.student.previous_educations.map((p) => ({
          institution_name: p.institution_name || "N/A",
          qualification: p.qualification || "N/A",
          start_date: p.start_date
            ? new Date(p.start_date).toISOString().split("T")[0]
            : getCurrentDate(),
          end_date: p.end_date
            ? new Date(p.end_date).toISOString().split("T")[0]
            : getCurrentDate(),
          grade: p.grade || "N/A",
        })),

        emergency_contacts: formData.student.emergency_contacts.map((c) => ({
          name: c.name || "",
          relation: c.relation || "",
          phone: c.phone || "",
          email: c.email || "",
        })),
      },

      documents: formData.documents.map((d) => ({
        document_type_id: d.document_type_id,
        file_url: d.file_url,
        file_key: d.file_key,
      })),

      is_draft: !!formData.is_draft,
    };

    if (!formData.student_id) delete payload.student_id;

    try {
      await createPartnerApplication(payload);

      showToast("Application submitted successfully.", "success");

      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting application:", err);
      showToast("Failed to submit application.", "error");
    }
  };

  if (loading || universitiesLoading) {
    return (
      <section className="mx-auto mt-5 max-w-5xl">
        <div className="rounded-lg border border-slate-200 bg-card p-6">
          <Loading text="Fetching application data..." />
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-5">
      <div className="rounded-lg border border-slate-200 bg-card p-6">
        <div className="mb-6 flex items-start gap-x-3 border-b-2 border-slate-100 pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-100">
            <FileText className="text-blue-700" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              New Student Application
            </h3>
            <p className="text-sm text-slate-500">
              Complete all sections to submit student application
            </p>
          </div>
        </div>

        <div className="relative mb-8">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-[repeat(auto-fit,_minmax(150px,_1fr))]">
            {stages.map((s, index) => {
              const Icon = s.icon;
              const isActive = s.id === stage;
              const isCompleted = completedStages.includes(s.id);
              const canAccess = canAccessStage(s.id);

              return (
                <div key={s.id} className="relative flex flex-col items-center">
                  {index < stages.length - 1 && (
                    <div className="absolute -z-10 hidden bg-slate-300 sm:left-1/2 sm:top-6 sm:block sm:h-0.5 sm:w-full">
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
                    className={`mb-2 flex h-12 w-12 items-center justify-center rounded-md transition ${
                      isCompleted
                        ? "bg-blue-500 text-white"
                        : isActive
                        ? "scale-110 bg-blue-100 text-slate-900"
                        : canAccess
                        ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <Icon size={20} />
                  </button>

                  <span
                    className={`px-1 text-xs sm:text-sm ${
                      isActive ? "font-medium text-slate-900" : "text-slate-500"
                    }`}
                  >
                    {s.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-6 min-h-[400px] rounded-md border bg-slate-50 p-6">
          {stage === 1 && (
            <div className="mb-8">
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-slate-900">
                    Personal Information
                  </h4>
                  <div className="ml-4 flex-1 border-t-2 border-slate-900 opacity-70"></div>
                </div>
                <p className="text-sm text-slate-800">
                  Please fill in your personal details below.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InputField
                  label="Full Name"
                  field="student.name"
                  placeholder="Ahmad bin Ali"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Date of Birth"
                  field="student.birthday"
                  placeholder="DD/MM/YYYY"
                  type="date"
                  required={false}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />

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

                <SelectField
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

                <InputField
                  label="Passport Number"
                  field="student.passport_number"
                  placeholder="A1234567"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Email Address"
                  field="student.email"
                  type="email"
                  placeholder="ahmad.ali@gmail.com"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Phone Number"
                  field="student.phone"
                  type="tel"
                  placeholder="+60123456789"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Street Address"
                    field="student.current_address"
                    placeholder="No. 123, Jalan Tun Razak, Kuala Lumpur"
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
                  <h4 className="text-lg font-semibold text-slate-900">
                    Educational Background
                  </h4>
                  <div className="ml-4 flex-1 border-t-2 border-slate-900 opacity-70"></div>
                </div>
                <p className="text-sm text-slate-800">
                  Please fill in your educational background details below.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SelectField
                  label="Highest Qualification"
                  field="student.previous_educations[0].qualification"
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
                  field="student.previous_educations[0].institution_name"
                  placeholder="University of Malaya"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Field of Study"
                  field="student.previous_educations[0].field_of_study"
                  placeholder="Computer Science"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Started Date"
                  field="student.previous_educations[0].start_date"
                  type="number"
                  placeholder="2022"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Graduation Year"
                  field="student.previous_educations[0].end_date"
                  type="number"
                  placeholder="2025"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="GPA / Grade"
                  field="student.previous_educations[0].grade"
                  placeholder="3.75 / 4.0"
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
              </div>

              <h5 className="mb-2 mt-4 font-semibold text-slate-900">
                English Proficiency Test Results
              </h5>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SelectField
                  label="Test Type"
                  field="student.english_proficiencies[0].test_type"
                  options={ENGLISH_TEST_OPTIONS}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Overall Score"
                  field="student.english_proficiencies[0].score"
                  placeholder="7.0"
                  required={false}
                  formData={formData}
                  errors={errors}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Test Date"
                  field="student.english_proficiencies[0].test_date"
                  type="date"
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
                  <h4 className="text-lg font-semibold text-slate-900">
                    University & Program Selection
                  </h4>
                  <div className="ml-4 flex-1 border-t-2 border-slate-900 opacity-70"></div>
                </div>
                <p className="text-sm text-slate-800">
                  Please select your preferred university and program.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SelectField
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

                <SelectField
                  label="Program"
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

                {intakeDates.length > 1 && (
                  <div>
                    <label className="block text-p2 font-medium text-slate-900">
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
                )}
              </div>
            </div>
          )}

          {stage === 4 && (
            <div>
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-slate-900">
                    Emergency Contact Information
                  </h4>
                  <div className="ml-4 flex-1 border-t-2 border-slate-900 opacity-70"></div>
                </div>
                <p className="text-sm text-slate-800">
                  You may provide an emergency contact for safety purposes. This
                  is not required.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <InputField
                  label="Contact Name"
                  field="student.emergency_contacts[0].name"
                  placeholder="Ahmad bin Ismail"
                  formData={formData}
                  errors={errors}
                  required={false}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Relationship"
                  field="student.emergency_contacts[0].relation"
                  placeholder="Father / Mother / Guardian"
                  formData={formData}
                  errors={errors}
                  required={false}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Phone Number"
                  field="student.emergency_contacts[0].phone"
                  type="tel"
                  placeholder="+60123456789"
                  formData={formData}
                  errors={errors}
                  required={false}
                  updateFormData={updateFormData}
                />
                <InputField
                  label="Email Address"
                  field="student.emergency_contacts[0].email"
                  type="email"
                  placeholder="ahmad.ismail@example.com"
                  formData={formData}
                  errors={errors}
                  required={false}
                  updateFormData={updateFormData}
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Address"
                    field="student.emergency_contacts[0].address"
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
                  <h4 className="text-lg font-semibold text-slate-900">
                    Upload Required Documents
                  </h4>
                  <div className="ml-4 flex-1 border-t-2 border-slate-900 opacity-70"></div>
                </div>
                <p className="text-sm text-slate-800">
                  Please upload all necessary documents to complete your application.
                </p>
              </div>

              <div className="space-y-6">
                {documentTypes.map((docType) => (
                  <FileUploadField
                    key={docType.id}
                    label={
                      docType.type.charAt(0).toUpperCase() +
                      docType.type.slice(1)
                    }
                    field="documents"
                    documentTypeId={docType.id}
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={errors}
                    uploadHandler={handleFileUpload}
                    removeHandler={removeDocument}
                    multiple={false}
                    accept="application/pdf,image/*"
                  />
                ))}
              </div>

              {errors.documents && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.documents}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 sm:flex-row">
          <div className="text-sm text-slate-500">
            Step {stage} of {stages.length} — {completedStages.length} completed
          </div>

          <div className="flex gap-3">
            {stage > 1 && (
              <PrevButton
                onClick={prevStage}
                text="Previous"
                icon={<ArrowLeft className="h-4 w-4" />}
                disabled={stage === 1}
              />
            )}

            {stage < stages.length ? (
              <NextButton
                onClick={nextStage}
                text="Next"
                icon={<ArrowRight className="h-4 w-4" />}
                disabled={!isStageValid(stage)}
              />
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loadingCreatePartnerApplication}
                text="Submit Application"
              />
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
