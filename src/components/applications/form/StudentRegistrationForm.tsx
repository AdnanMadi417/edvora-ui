import React, { useState, useEffect } from "react";
import {
  User,
  FileText,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  CheckCircle,
  Building2,
  School,
  GraduationCap,
  Calendar,
  Users,
  Globe,
  BadgeCheck,
  Mail,
  Phone,
  MapPin,
  File, XCircle,
} from 'lucide-react';
import { NATIONALITIES } from "constants/lists";
import { useToast } from "components/context/ToastContext";

import { useAllQualifications } from "hooks/knowledge-hub/qualifications/useQualificationsList";
import { useCreatePartnerApplication } from "hooks/applications/useCreatePartnerApplication";
import { useGetApplicationRequiredFields } from "hooks/applications/useApplicationRequiredFields";
import { useDocumentType } from "hooks/useDocumentType";

import { useUniversities } from "hooks/useUniversities";
import { InputField, SelectField, RadioField } from "components/form";
import SearchableSelect from "../../form/SearchableSelect";
import SearchableDropdown from "../../form/search/SearchableDropdown";
import FileUploadField from "components/form/filesUpload/FileUploadField";

import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";
import { useMe } from "hooks/useMe";
import Loading from "components/loading/Loading";
import Button from "components/ui/buttons/Button";
import PrevButton from "components/ui/buttons/PrevButton";
import NextButton from "components/ui/buttons/NextButton";
import { useRouter } from "next/navigation";
import { useRemoveDocument } from "../../../services/removeDocument";

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
    field_of_study?: string;
    start_date: string;
    end_date: string;
    grade?: string;
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

interface FormDataType {
  program_id: string;
  university_id: string;
  intake_date: string;
  student_id: string;
  student: Student;
  documents: DocumentItem[];
  is_draft: boolean;
}

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
  { id: 1, name: "Basic Information", icon: User },
  { id: 2, name: "Documents", icon: FileText },
  { id: 3, name: "Additional Information", icon: ClipboardList },
  { id: 4, name: "Review & Submit", icon: CheckCircle },
];

export default function StudentRegistrationForm() {
  const [stage, setStage] = useState(1);
  const [completedStages, setCompletedStages] = useState([]);
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  const { user } = useMe();
  const router = useRouter();
  const partnerId = user?.partner_id;

  const {
    universities,
    loading: universitiesLoading,
    error: universitiesError,
  } = useUniversities();

  const universityMap = React.useMemo(() => {
    return Object.fromEntries(universities.map((u) => [u.id, u]));
  }, [universities]);
  const {
    createPartnerApplication,
    loadingCreatePartnerApplication,
    errorCreatePartnerApplication,
  } = useCreatePartnerApplication(partnerId);

  const {
    data: requiredFields,
    loading: requiredFieldsLoading,
    getRequiredFields,
  } = useGetApplicationRequiredFields();

  const { documentTypes } = useDocumentType(true);

  const requiredFieldKeys =
    requiredFields?.fields
      ?.filter((f) => f.is_required)
      ?.map((f) => f.field_key) || [];

  const hasStudentInfoFields = requiredFieldKeys.some(
    (key) =>
      key.startsWith("student.") &&
      !key.includes("previous_educations") &&
      !key.includes("emergency_contacts")
  );

  const hasEducationalFields = requiredFieldKeys.some(
    (key) =>
      key.startsWith("student.previous_educations") ||
      key.startsWith("student.previous_educations[0].")
  );

  const hasEmergencyFields = requiredFieldKeys.some(
    (key) =>
      key.startsWith("student.emergency_contacts") ||
      key.startsWith("student.emergency_contacts[0].")
  );

  const isFieldRequired = (key: string) => {
    return requiredFieldKeys.includes(key);
  };

  const shouldShowStage3 = requiredFieldKeys.length > 0;
  const visibleStages = shouldShowStage3
    ? stages
    : stages.filter((s) => s.id !== 3);

  const { qualifications } = useAllQualifications();

  const safeDocumentTypes = documentTypes ?? [];

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
      birthday: getCurrentDate().toString(),
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

  const contact = formData.student.emergency_contacts[0];

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const updateFormData = (fieldPath: string, value: any) => {
    setFormData((prev) => {
      const keys = fieldPath.split(/[\.\[\]]/).filter(Boolean);
      const newState = { ...prev };

      if (keys[0] === "student") {
        if (
          keys[1] === "emergency_contacts" &&
          !newState.student.emergency_contacts?.length
        ) {
          newState.student.emergency_contacts = [
            { name: "", relation: "", phone: "", email: "" },
          ];
        }
        if (
          keys[1] === "previous_educations" &&
          !newState.student.previous_educations?.length
        ) {
          newState.student.previous_educations = [
            {
              institution_name: "",
              qualification: "",
              start_date: "",
              end_date: "",
              grade: "",
            },
          ];
        }
        if (
          keys[1] === "english_proficiencies" &&
          !newState.student.english_proficiencies?.length
        ) {
          newState.student.english_proficiencies = [
            { test_type: "", score: "", test_date: "" },
          ];
        }
      }

      return setNestedValue(newState, fieldPath, value);
    });

    setErrors((prev) => ({ ...prev, [fieldPath]: undefined }));
  };

  const validateStage = (stageNum: number) => {
    const newErrors: Record<string, string> = {};

    const addError = (path: string, message: string) => {
      newErrors[path] = message;
    };

    const isEmpty = (value: any) =>
      value === undefined || value === null || String(value).trim() === "";

    const student = formData.student;

    if (stageNum === 1) {
      if (isEmpty(student.name))
        addError("student.name", "Student name is required");
      if (isEmpty(student.previous_educations[0]?.qualification))
        addError(
          "student.previous_educations[0].qualification",
          "Qualification is required"
        );
      if (isEmpty(formData.university_id))
        addError("university_id", "University is required");
      if (isEmpty(formData.program_id))
        addError("program_id", "Program is required");
    }

    if (stageNum === 2) {
      if (!formData.documents?.length)
        addError("documents", "Please upload at least one document");

      safeDocumentTypes.forEach((docType) => {
        const uploaded = formData.documents.find(
          (d) => d.document_type_id === docType.id && d.file_url && !d.uploading
        );
        if (!uploaded)
          addError(`documents.${docType.id}`, `${docType.type} is required`);
      });
    }

    if (stageNum === 3) {

      Object.keys(student).forEach((key) => {
        if (isFieldRequired(`student.${key}`)) {
          const value = student[key as keyof Student];
          if (isEmpty(value)) addError(`student.${key}`, `${key} is required`);
        }
      });

      student.emergency_contacts?.forEach((c, idx) => {
        ["name", "relation", "phone", "email"].forEach((f) => {
          const key = `student.emergency_contacts[${idx}].${f}`;
          if (isFieldRequired(key) && isEmpty(c[f as keyof typeof c])) {
            addError(key, `${f} is required`);
          }
        });
      });

      // Check previous education
      student.previous_educations?.forEach((edu, idx) => {
        ["institution_name", "qualification", "start_date", "end_date"].forEach(
          (f) => {
            const key = `student.previous_educations[${idx}].${f}`;
            if (isFieldRequired(key) && isEmpty(edu[f as keyof typeof edu])) {
              addError(key, `${f.replace("_", " ")} is required`);
            }
          }
        );
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStage = async () => {
    const isValid = validateStage(stage);

    if (!isValid) return;

    setCompletedStages((prev) =>
      prev.includes(stage) ? prev : [...prev, stage]
    );

    setStage((s) => Math.min(s + 1, visibleStages.length));
  };

  const prevStage = () => setStage((s) => Math.max(1, s - 1));

  const canAccessStage = (id) => {
    if (id === 1) return true;
    if (id === stage) return true;
    const idx = visibleStages.findIndex((s) => s.id === id);
    return idx > 0 && completedStages.includes(visibleStages[idx - 1].id);
  };

  useEffect(() => {
    if (partnerId && formData.university_id) {
      getRequiredFields(partnerId, formData.university_id);
    }
  }, [partnerId, formData.university_id]);

  useEffect(() => {
    if (!shouldShowStage3 && stage === 3) {
      setStage(4);
    }
  }, [shouldShowStage3, stage]);

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

  const { removeDocument } = useRemoveDocument(
    formData,
    setFormData,
    showToast
  );

  const isStageValid = React.useMemo(() => {
    // Validate current stage without setting errors (silent check)
    const newErrors: Record<string, string> = {};
    const student = formData.student;

    const isEmpty = (value: any) =>
      value === undefined || value === null || String(value).trim() === "";

    if (stage === 1) {
      if (isEmpty(student.name)) newErrors["student.name"] = "required";
      if (isEmpty(student.previous_educations[0]?.qualification))
        newErrors["student.previous_educations[0].qualification"] = "required";
      if (isEmpty(formData.university_id)) newErrors["university_id"] = "required";
      if (isEmpty(formData.program_id)) newErrors["program_id"] = "required";
    }

    if (stage === 2) {
      safeDocumentTypes.forEach((docType) => {
        const uploaded = formData.documents.find(
          (d) => d.document_type_id === docType.id && d.file_url && !d.uploading
        );
        if (!uploaded) newErrors[`documents.${docType.id}`] = "required";
      });
    }

    if (stage === 3) {
      // Student fields
      Object.keys(student).forEach((key) => {
        if (isFieldRequired(`student.${key}`)) {
          const value = student[key as keyof Student];
          if (isEmpty(value)) newErrors[`student.${key}`] = "required";
        }
      });

      // Emergency contacts
      student.emergency_contacts?.forEach((c, idx) => {
        ["name", "relation", "phone", "email"].forEach((f) => {
          const key = `student.emergency_contacts[${idx}].${f}`;
          if (isFieldRequired(key) && isEmpty(c[f as keyof typeof c])) {
            newErrors[key] = "required";
          }
        });
      });

      // Previous education
      student.previous_educations?.forEach((edu, idx) => {
        ["institution_name", "qualification", "start_date", "end_date"].forEach(
          (f) => {
            const key = `student.previous_educations[${idx}].${f}`;
            if (isFieldRequired(key) && isEmpty(edu[f as keyof typeof edu])) {
              newErrors[key] = "required";
            }
          }
        );
      });
    }

    return Object.keys(newErrors).length === 0;
  }, [stage, formData, safeDocumentTypes, isFieldRequired]);

  const handleSubmit = async () => {
    for (const s of visibleStages) {
      if (!validateStage(s.id)) return;
    }

    if (formData.documents?.some((d) => d.uploading)) {
      showToast("Please wait for all files to finish uploading.", "error");
      return;
    }

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

    if (!documentTypes.length) {
      showToast("Document types are still loading, please wait.", "error");
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
        router.push("/partner/applications");
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting application:", err);
      showToast("Failed to submit application.", "error");
    }
  };

  if (universitiesLoading) {
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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
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
            {visibleStages.map((s, index) => {
              const Icon = s.icon;
              const isActive = s.id === stage;
              const isCompleted = completedStages.includes(s.id);
              const canAccess = canAccessStage(s.id);

              return (
                <div
                  key={s.id}
                  className="group relative flex flex-col items-center"
                >
                  {index < visibleStages.length - 1 && (
                    <div className="absolute left-1/2 top-6 -z-10 hidden h-1 w-full bg-slate-200 sm:block">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? "w-full bg-blue-500" : "w-0"
                        }`}
                      />
                    </div>
                  )}

                  <button
                    onClick={() => canAccess && setStage(s.id)}
                    disabled={!canAccess}
                    className={`relative mb-3 flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300
      ${
        isCompleted
          ? "border-blue-500 bg-blue-500 text-white shadow-md"
          : isActive
          ? "scale-110 border-blue-700 bg-blue-50 text-blue-700 shadow-sm"
          : canAccess
          ? "border-slate-300 bg-white text-slate-500 hover:border-slate-400 hover:bg-slate-50"
          : "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
      }`}
                  >
                    <Icon
                      size={20}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                  </button>

                  <span
                    className={`text-center text-xs transition-colors duration-300 sm:text-sm ${
                      isActive
                        ? "font-semibold text-blue-700"
                        : "text-slate-500"
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
                />

                <SearchableSelect
                  label="Study Level"
                  field="student.previous_educations[0].qualification"
                  options={qualifications.map((q) => ({
                    value: String(q.id),
                    label:
                      q.name.charAt(0).toUpperCase() +
                      q.name.slice(1).toLowerCase(),
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
          )}

          {stage === 2 && (
            <div>
              <div className="mb-6">
                <div className="mb-2 flex items-center">
                  <h4 className="text-lg font-semibold text-slate-900">
                    Upload Required Documents
                  </h4>
                  <div className="ml-4 flex-1 border-t-2 border-slate-900 opacity-70"></div>
                </div>
                <p className="text-sm text-slate-800">
                  Please upload all necessary documents to complete your
                  application.
                </p>
              </div>

              <div className="space-y-6">
                {safeDocumentTypes.map((docType) => (
                  <FileUploadField
                    key={docType.id}
                    label={docType.type}
                    field="documents"
                    documentTypeId={docType.id}
                    formData={formData}
                    updateFormData={updateFormData}
                    errors={{
                      ...errors,
                      documents: errors[`documents.${docType.id}`],
                    }}
                    uploadHandler={handleFileUpload}
                    removeHandler={removeDocument}
                    multiple={false}
                    accept="application/pdf,image/*"
                  />
                ))}
              </div>

              {errors.documents && (
                <p className="mt-2 text-xs text-red-600">{errors.documents}</p>
              )}
            </div>
          )}

          {stage === 3 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-5">
                <h4 className="text-xl font-semibold text-slate-900">
                  Additional Required Details
                </h4>
                <p className="mt-1 text-sm text-slate-500">
                  This university requires extended information. All fields are
                  mandatory.
                </p>
              </div>

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

                    {isFieldRequired("student.passport_number") && (
                      <InputField
                        label="Passport Number"
                        field="student.passport_number"
                        placeholder="A1234567"
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
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <InputField
                      label="Name"
                      field="student.emergency_contacts[0].name"
                      placeholder="John Doe"
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                    />

                    <InputField
                      label="Relation"
                      field="student.emergency_contacts[0].relation"
                      placeholder="Father / Mother / Guardian"
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                    />

                    <InputField
                      label="Phone Number"
                      field="student.emergency_contacts[0].phone"
                      placeholder="+60123456789"
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                    />

                    <InputField
                      label="Email"
                      field="student.emergency_contacts[0].email"
                      placeholder="john.doe@gmail.com"
                      formData={formData}
                      errors={errors}
                      updateFormData={updateFormData}
                    />
                  </div>
                </div>
              )}

              {hasEducationalFields && (
                <div className="mb-8">
                  <h3 className="mb-4 font-semibold uppercase text-slate-900">
                    Educational Background
                  </h3>

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
                      label="Started Year"
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
                </div>
              )}
            </div>
          )}

          {stage === 4 && (
            <div className="space-y-8">
              <div className="border-b border-slate-200 pb-4">
                <h4 className="text-xl font-semibold text-slate-900">
                  Review Your Application
                </h4>
                <p className="text-sm text-slate-500">
                  Please verify all information before submitting.
                </p>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-blue-50 px-5 py-4">
                  <Building2 className="h-4 w-4 text-blue-600" />
                  <h5 className="text-sm font-semibold text-slate-800 md:text-base">
                    Application Info
                  </h5>
                </div>
                <div className="grid gap-3 p-5 text-sm md:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <School className="h-3.5 w-3.5" />
                      University
                    </div>
                    <p className="mt-1 font-medium text-slate-900">
                      {universities.find((u) => u.id === formData.university_id)
                        ?.name || "-"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Program
                    </div>
                    <p className="mt-1 font-medium text-slate-900">
                      {universities
                        .find((u) => u.id === formData.university_id)
                        ?.programs?.find((p) => p.id === formData.program_id)
                        ?.name || "-"}
                    </p>
                  </div>

                  {formData.intake_date && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Calendar className="h-3.5 w-3.5" />
                        Intake Date
                      </div>
                      <p className="mt-1 font-medium text-slate-900">
                        {formData.intake_date}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-blue-50 px-5 py-4">
                  <User className="h-4 w-4 text-blue-600" />
                  <h5 className="text-sm font-semibold text-slate-800 md:text-base">
                    Student Basic Information
                  </h5>
                </div>
                <div className="grid gap-4 p-5 text-sm md:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <User className="h-3.5 w-3.5" />
                      Full Name
                    </div>
                    <p className="mt-1 font-medium text-slate-900">
                      {formData.student.name || "-"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Calendar className="h-3.5 w-3.5" />
                      Date of Birth
                    </div>
                    <p className="mt-1 font-medium text-slate-900">
                      {formData.student.birthday || "-"}
                    </p>
                  </div>

                  {formData.student.gender !== null && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Users className="h-3.5 w-3.5" />
                        Gender
                      </div>
                      <p className="mt-1 font-medium text-slate-900">
                        {formData.student.gender ? "Male" : "Female"}
                      </p>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Globe className="h-3.5 w-3.5" />
                      Nationality
                    </div>
                    <p className="mt-1 font-medium text-slate-900">
                      {formData.student.nationality || "-"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Passport
                    </div>
                    <p className="mt-1 font-medium text-slate-900">
                      {formData.student.passport_number || "-"}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </div>
                    <p className="mt-1 font-medium text-slate-900">
                      {formData.student.email || "-"}
                    </p>
                  </div>

                  {formData.student.phone && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Phone className="h-3.5 w-3.5" />
                        Phone
                      </div>
                      <p className="mt-1 font-medium text-slate-900">
                        {formData.student.phone}
                      </p>
                    </div>
                  )}

                  {formData.student.current_address && (
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        Address
                      </div>
                      <p className="mt-1 font-medium text-slate-900">
                        {formData.student.current_address}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition">
                <div className="flex items-center gap-2 border-b border-slate-100 bg-blue-50 px-5 py-4">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <h5 className="text-sm font-semibold text-slate-800 md:text-base">
                    Documents
                  </h5>
                </div>

                <div className="grid gap-4 p-5 text-sm grid-cols-1">
                  {documentTypes.map((docType) => {

                    const uploadedDoc = formData.documents?.find(
                      (doc) => doc.document_type_id === docType.id
                    );

                    return (
                      <div
                        key={docType.id}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <File className="h-3.5 w-3.5" />
                          {docType.description}
                        </div>
                        <div className="mt-1">

                            {uploadedDoc ? (
                              <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" /> Uploaded
                          </span>
                            ) : (
                              <span className="flex items-center gap-1 text-red-500">
                            <XCircle className="h-4 w-4" /> Missing
                          </span>
                            )}

                          </div>

                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex-col content-center justify-content items-center gap-2 space-y-2 sm:flex-row md:flex md:justify-between">
          <div className="text-sm text-slate-500">
            Step {stage} of {visibleStages.length} — {completedStages.length}{" "}
            completed
          </div>

          <div className="flex gap-3">
            {stage > 1 && (
              <PrevButton
                onClick={prevStage}
                text="Previous"
                icon={<ArrowLeft className="h-4 w-4" />}
                disabled={stage === 1 || loadingCreatePartnerApplication}
              />
            )}

            {stage < visibleStages.length ? (
              <NextButton
                onClick={nextStage}
                text="Next"
                icon={<ArrowRight className="h-4 w-4" />}
                disabled={!isStageValid || loadingCreatePartnerApplication}
              />
            ) : (
              <Button
                onClick={handleSubmit}
                text="Submit Application"
                disabled={!isStageValid || loadingCreatePartnerApplication}
              />
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
