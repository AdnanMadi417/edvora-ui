import React, { useState, useEffect } from "react";
import {
  User,
  FileText,
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  CheckCircle,
} from 'lucide-react';

import { useToast } from "components/context/ToastContext";
import { useAllQualifications } from "hooks/knowledge-hub/qualifications/useQualificationsList";
import { useCreatePartnerApplication } from "hooks/applications/useCreatePartnerApplication";
import { useGetApplicationRequiredFields } from "hooks/applications/useApplicationRequiredFields";
import { useDocumentType } from "hooks/useDocumentType";
import { useUniversities } from "hooks/useUniversities";
import { useRemoveDocument } from "services/removeDocument";

import { getCurrentDate } from "components/applications/form/utility-functions/getCurrentDate";
import { updateFormData as updateNestedFormData } from "components/applications/form/utility-functions/updateFormData";
import { validateFormData } from "components/applications/form/utility-functions/validateFormData";

import StageReview from "./stages/StageReview";
import StageBasicInfo from "components/applications/form/stages/StageBasicInfo";
import StageDocuments from "components/applications/form/stages/StageDocuments";
import StageAdditionalInfo from "components/applications/form/stages/StageAdditionalInfo";

import {
  getPresignedUploads,
  uploadFilesToSpaces,
} from "services/uploadService";
import { useMe } from "hooks/useMe";
import { usePartnerProgramIntakeDates } from "hooks/knowledge-hub/programs/usePartnerProgramIntakeDates";
import Loading from "components/loading/Loading";
import Button from "components/ui/buttons/Button";
import PrevButton from "components/ui/buttons/PrevButton";
import NextButton from "components/ui/buttons/NextButton";
import { useRouter } from "next/navigation";

import { FormDataType, DocumentItem } from "components/applications/form/utility-functions/types";

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

  const { user } = useMe();
  const router = useRouter();
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

  const {
    data: requiredFields,
    loading: requiredFieldsLoading,
    getRequiredFields,
  } = useGetApplicationRequiredFields();

  const [formData, setFormData] = useState<FormDataType>({
    program_id: "",
    university_id: "",
    intake_date: getCurrentDate().toString(),
    student_id: "",
    student: {
      name: "",
      birthday:"",
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

  const { documentTypes, loading: documentTypesLoading } = useDocumentType({
    initOnly: true,
    programId: formData.program_id || undefined,
    nationality: formData.student.nationality || undefined,
  });
  const { qualifications } = useAllQualifications();
  const safeDocumentTypes = documentTypes ?? [];

  const requiredFieldKeys =
    requiredFields?.fields
      ?.filter((f) => f.is_required)
      ?.map((f) => f.field_key) || [];

  const shouldShowStage3 = requiredFieldKeys.length > 0;
  const visibleStages = shouldShowStage3
    ? stages
    : stages.filter((s) => s.id !== 3);

  const { intakeDates, loading: loadingIntakeDates } = usePartnerProgramIntakeDates(formData.program_id, partnerId);

  useEffect(() => {
    if (intakeDates.length > 0) {
      setFormData((prev) => ({ ...prev, intake_date: intakeDates[0] }));
    }
  }, [intakeDates]);

  const contact = formData.student.emergency_contacts[0];

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const updateFormData = (fieldPath: string, value: any) => {
    updateNestedFormData<FormDataType>({
      fieldPath,
      value,
      setFormData,
      setErrors,
    });
  };

  const handleValidateStage = React.useCallback(
    (stageNum: number) => {
      const { isValid, errors } = validateFormData(
        formData,
        stageNum,
        requiredFieldKeys,
        safeDocumentTypes,
        documentTypesLoading
      );
      setErrors(errors);
      return isValid;
    },
    [formData, requiredFieldKeys, safeDocumentTypes, documentTypesLoading]
  );

  const nextStage = async () => {
    if (!handleValidateStage(stage)) return;

    setCompletedStages((prev) =>
      prev.includes(stage) ? prev : [...prev, stage]
    );

    setStage((s) => Math.min(s + 1, visibleStages.length));
  };

  const prevStage = () => {
    const currentIndex = visibleStages.findIndex((s) => s.id === stage);
    if (currentIndex > 0) {
      setStage(visibleStages[currentIndex - 1].id);
    }
  };

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
    return validateFormData(formData, stage, requiredFieldKeys, documentTypes, documentTypesLoading).isValid;
  }, [stage, formData, requiredFieldKeys, documentTypes, documentTypesLoading]);

  const handleSubmit = async () => {
    for (const s of visibleStages) {
      if (!handleValidateStage(s.id)) return;
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

      if (!docType.is_required_init_app_doc) return false;

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
      program_id: formData.program_id || undefined,
      university_id: formData.university_id || undefined,
      intake_date: formData.intake_date || getCurrentDate(),
      student: {
        name: formData.student.name || "",
        birthday: formData.student.birthday || null,
        nationality: formData.student.nationality || "",
        passport_number: formData.student.passport_number || "",
        email: formData.student.email || "",
        phone: formData.student.phone || "",
        current_address: formData.student.current_address || "",
        gender: formData.student.gender ?? null,
        emergency_contacts: formData.student.emergency_contacts
          .filter((c) => c.name || c.phone)
          .map((c) => ({
            name: c.name,
            relation: c.relation,
            phone: c.phone,
            email: c.email,
          })),

        english_proficiencies: formData.student.english_proficiencies
          .filter((e) => e.test_type || e.score)
          .map((e) => ({
            test_type: e.test_type || undefined,
            score: e.score || undefined,
            test_date: e.test_date
              ? new Date(e.test_date).toISOString().split("T")[0]
              : undefined,
          })),

        previous_educations: formData.student.previous_educations
          .filter((p) => p.institution_name)
          .map((p) => ({
            institution_name: p.institution_name,
            qualification: p.qualification || undefined,
            start_date: p.start_date
              ? new Date(p.start_date).toISOString().split("T")[0]
              : undefined,
            end_date: p.end_date
              ? new Date(p.end_date).toISOString().split("T")[0]
              : undefined,
            grade: p.grade || undefined,
          })),
      },

      documents: formData.documents
        .filter((d) => d.file_url && !d.uploading)
        .map((d) => ({
          document_type_id: d.document_type_id,
          file_url: d.file_url,
          file_key: d.file_key,
        })),

      is_draft: formData.is_draft ?? false,
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
    <section className="mx-auto mt-5 max-w-5xl">
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
            <StageBasicInfo
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              universities={universities}
            />
          )}

          {stage === 2 && (
            <StageDocuments
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              documentTypes={safeDocumentTypes}
              handleFileUpload={handleFileUpload}
              removeDocument={removeDocument}
            />
          )}

          {stage === 3 && (
            <StageAdditionalInfo
              formData={formData}
              errors={errors}
              updateFormData={updateFormData}
              requiredFieldKeys={requiredFieldKeys}
              qualifications={qualifications}
              intakeDates={intakeDates}
              loadingIntakeDates={loadingIntakeDates}
            />
          )}

          {stage === 4 && (
            <StageReview
              formData={formData}
              universities={universities}
              documentTypes={documentTypes}
            />
          )}

        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500">
            Step {stage} of {visibleStages.length} — {completedStages.length}{" "}
            completed
          </div>

          <div className="flex gap-3">
            {stage > 1 && (
              <PrevButton
                onClick={prevStage}
                text="Prev"
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
