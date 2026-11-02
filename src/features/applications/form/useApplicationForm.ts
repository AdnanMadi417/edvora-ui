"use client";

// State, validation, uploads and submit for the Advisor's application form.
// Shared by "New application" (/partner/applications/apply-now) and "Apply
// for programme" (/partner/applications/apply-for-program, programme preset
// from the Knowledge Hub). Behaviour matches the two forms it replaces.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "components/ub/feedback/ToastContext";
import { useAllQualifications } from "features/knowledge-hub/qualifications/hooks";
import { useCreatePartnerApplication } from "features/applications/partner/hooks/useCreatePartnerApplication";
import { useGetApplicationRequiredFields } from "features/applications/partner/hooks/useApplicationRequiredFields";
import { useDocumentType } from "hooks/useDocumentType";
import { useUniversities } from "hooks/useUniversities";
import { useMe } from "hooks/useMe";
import { useRemoveDocument } from "services/removeDocument";
import { getPresignedUploads, uploadFilesToSpaces } from "services/uploadService";
import { usePartnerProgramIntakeMonths } from "features/programs/hooks";
import { isDateInIntakeMonths, nextIntakeMonth, resolveIntakeDate } from "features/programs/utils/intakeMonths";
import { parseApiError } from "utils/parseApiError";
import { getCurrentDate } from "features/applications/partner/components/form/utility-functions/getCurrentDate";
import { updateFormData as updateNestedFormData } from "features/applications/partner/components/form/utility-functions/updateFormData";
import { validateFormData } from "features/applications/partner/components/form/utility-functions/validateFormData";
import type { DocumentItem, FormDataType } from "features/applications/partner/components/form/utility-functions/types";
import { APPLICATION_FORM_STEPS, buildPayload, missingRequiredDocuments, visibleSteps, type ApplicationFormStepId } from "./applicationFormModel";

export interface ApplicationFormPreset {
  program_id?: string;
  university_id?: string;
  intake_date?: string;
}

const emptyForm = (preset: ApplicationFormPreset = {}): FormDataType => ({
  program_id: preset.program_id ?? "",
  university_id: preset.university_id ?? "",
  intake_date: preset.intake_date || getCurrentDate().toString(),
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
    previous_educations: [{ institution_name: "", qualification: "", start_date: "", end_date: "", grade: "" }],
  },
  documents: [],
  is_draft: false,
});

export function useApplicationForm(preset?: ApplicationFormPreset) {
  const { showToast } = useToast();
  const router = useRouter();
  const { user } = useMe();
  const partnerId = user?.partner_id;

  const { universities, loading: universitiesLoading, error: universitiesError } = useUniversities();
  const { createPartnerApplication, loadingCreatePartnerApplication } = useCreatePartnerApplication(partnerId);
  const { data: requiredFields, getRequiredFields } = useGetApplicationRequiredFields();
  const { qualifications } = useAllQualifications();

  const [formData, setFormData] = useState<FormDataType>(() => emptyForm(preset));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [step, setStep] = useState<ApplicationFormStepId>("student");
  const [completed, setCompleted] = useState<ApplicationFormStepId[]>([]);

  // Preset arrives from the URL (Knowledge Hub → Apply).
  useEffect(() => {
    if (!preset?.program_id && !preset?.university_id && !preset?.intake_date) return;
    setFormData((prev) => ({
      ...prev,
      program_id: preset.program_id || prev.program_id,
      university_id: preset.university_id || prev.university_id,
      intake_date: preset.intake_date || prev.intake_date,
    }));
  }, [preset?.program_id, preset?.university_id, preset?.intake_date]);

  const { documentTypes, loading: documentTypesLoading, error: documentTypesError } = useDocumentType({
    initOnly: true,
    programId: formData.program_id || undefined,
    nationality: formData.student.nationality || undefined,
  });
  const safeDocumentTypes = useMemo(() => documentTypes ?? [], [documentTypes]);

  const requiredFieldKeys: string[] = useMemo(
    () => ((requiredFields as any)?.fields ?? []).filter((f: any) => f.is_required).map((f: any) => f.field_key),
    [requiredFields],
  );

  const { intakeMonths, loading: loadingIntakeMonths, error: intakeMonthsError } = usePartnerProgramIntakeMonths(formData.program_id, partnerId);

  // These lists fail silently otherwise: the picker just renders empty.
  useEffect(() => void (universitiesError && showToast(universitiesError, "error")), [universitiesError]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => void (documentTypesError && showToast(documentTypesError, "error")), [documentTypesError]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => void (intakeMonthsError && showToast(intakeMonthsError, "error")), [intakeMonthsError]); // eslint-disable-line react-hooks/exhaustive-deps

  // Resolve intake_date to one of the programme's real intake months even when
  // the month picker never renders (a programme with one intake month skips it).
  useEffect(() => {
    if (loadingIntakeMonths || intakeMonths.length === 0) return;
    if (isDateInIntakeMonths(formData.intake_date, intakeMonths)) return;
    const month = nextIntakeMonth(intakeMonths);
    if (month) setFormData((prev) => ({ ...prev, intake_date: resolveIntakeDate(month) }));
  }, [intakeMonths, loadingIntakeMonths]); // eslint-disable-line react-hooks/exhaustive-deps

  // Each Institution decides which extra fields it needs.
  useEffect(() => {
    if (partnerId && formData.university_id) getRequiredFields(partnerId, formData.university_id);
  }, [partnerId, formData.university_id]); // eslint-disable-line react-hooks/exhaustive-deps

  const steps = useMemo(() => visibleSteps(requiredFieldKeys.length > 0), [requiredFieldKeys.length]);
  useEffect(() => {
    if (!steps.some((s) => s.id === step)) setStep("review");
  }, [steps, step]);

  const update = useCallback((fieldPath: string, value: unknown) => updateNestedFormData<FormDataType>({ fieldPath, value, setFormData, setErrors }), []);

  const validate = useCallback(
    (id: ApplicationFormStepId) => {
      const { isValid, errors: next } = validateFormData(formData, APPLICATION_FORM_STEPS[id].legacyStage, requiredFieldKeys, safeDocumentTypes, documentTypesLoading);
      setErrors(next);
      return isValid;
    },
    [formData, requiredFieldKeys, safeDocumentTypes, documentTypesLoading],
  );

  const validateField = useCallback(
    (field: string) => {
      const { errors: stepErrors } = validateFormData(formData, APPLICATION_FORM_STEPS[step].legacyStage, requiredFieldKeys, safeDocumentTypes, documentTypesLoading);
      setErrors((prev) => ({ ...prev, [field]: stepErrors[field] }));
    },
    [formData, step, requiredFieldKeys, safeDocumentTypes, documentTypesLoading],
  );

  const next = () => {
    if (!validate(step)) return false;
    setCompleted((c) => (c.includes(step) ? c : [...c, step]));
    const i = steps.findIndex((s) => s.id === step);
    setStep(steps[Math.min(i + 1, steps.length - 1)].id);
    return true;
  };
  const back = () => {
    const i = steps.findIndex((s) => s.id === step);
    if (i > 0) setStep(steps[i - 1].id);
  };

  const upload = async (file: File, documentTypeId: string) => {
    const placeholder: DocumentItem = { document_type_id: documentTypeId, file_url: "", file_key: "", name: file.name, size: `${(file.size / 1024).toFixed(2)} KB`, raw: file, uploading: true, progress: 0 };
    setFormData((prev) => ({ ...prev, documents: [...prev.documents.filter((d) => d.document_type_id !== documentTypeId), placeholder] }));
    try {
      const presigned = await getPresignedUploads([file], "documents");
      const [result] = await uploadFilesToSpaces([file], presigned, (_i, pct) =>
        setFormData((prev) => ({ ...prev, documents: prev.documents.map((d) => (d.raw === file ? { ...d, progress: pct } : d)) })),
      );
      setFormData((prev) => ({
        ...prev,
        documents: prev.documents.map((d) => (d.raw === file ? { ...d, uploading: false, progress: 100, file_url: result.public_url, file_key: result.file_key } : d)),
      }));
      setErrors((e) => ({ ...e, [`documents.${documentTypeId}`]: undefined, documents: undefined }));
    } catch (err: unknown) {
      showToast(parseApiError(err, `Couldn't upload ${file.name}. Try again.`), "error");
      setFormData((prev) => ({ ...prev, documents: prev.documents.filter((d) => d.raw !== file) }));
    }
  };

  const { removeDocument } = useRemoveDocument(formData, setFormData, showToast);

  const submit = async () => {
    for (const s of steps) {
      if (!validate(s.id)) {
        setStep(s.id);
        return;
      }
    }
    if (formData.documents.some((d) => d.uploading)) {
      showToast("Wait for the uploads to finish, then submit.", "error");
      return;
    }
    if (!safeDocumentTypes.length) {
      showToast("Document types are still loading. Try again in a moment.", "error");
      return;
    }
    const missing = missingRequiredDocuments(safeDocumentTypes, formData.documents);
    if (missing.length) {
      setStep("documents");
      showToast(`Upload the required documents: ${missing.map((d) => d.type).join(", ")}`, "error");
      return;
    }
    try {
      await createPartnerApplication(buildPayload(formData));
      showToast("Application submitted.", "success");
      router.push("/partner/applications");
    } catch (err: unknown) {
      showToast(parseApiError(err, "Couldn't submit the application. Try again."), "error");
    }
  };

  const goTo = (id: ApplicationFormStepId) => setStep(id);

  return {
    formData,
    errors,
    update,
    validateField,
    step,
    steps,
    completed,
    goTo,
    next,
    back,
    submit,
    submitting: loadingCreatePartnerApplication,
    upload,
    removeDocument,
    universities,
    universitiesLoading,
    documentTypes: safeDocumentTypes,
    documentTypesLoading,
    qualifications,
    requiredFieldKeys,
    intakeMonths,
    loadingIntakeMonths,
  };
}
