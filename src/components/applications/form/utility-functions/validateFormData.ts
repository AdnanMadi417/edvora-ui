// validateFormData.ts
import { FormDataType, DocumentItem, DocumentType,Student } from "components/applications/form/utility-functions/types";

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

// validateFormData.ts

const validateContacts = (
  contacts: Student["emergency_contacts"],
  requiredFieldKeys: string[]
): Record<string, string> => {
  const errors: Record<string, string> = {};
  contacts.forEach((c, idx) => {
    ["name", "relation", "phone", "email"].forEach((f) => {
      const key = `student.emergency_contacts[${idx}].${f}`;
      if (requiredFieldKeys.includes(key) && !c[f as keyof typeof c]?.trim?.()) {
        errors[key] = "required";
      }
    });
  });
  return errors;
};

const validateEducations = (
  educations: Student["previous_educations"],
  requiredFieldKeys: string[],
  errors: Record<string, string>
) => {
  educations.forEach((edu, idx) => {
    ["institution_name", "qualification", "start_date", "end_date"].forEach((f) => {
      const key = `student.previous_educations[${idx}].${f}`;
      if (requiredFieldKeys.includes(key) && !edu[f as keyof typeof edu]?.trim?.()) {
        errors[key] = "required";
      }
    });
  });
};

export const validateFormData = (
  formData: FormDataType,
  stageNum: number,
  requiredFieldKeys: string[],
  documentTypes: DocumentType[]
): ValidationResult => {
  const newErrors: Record<string, string> = {};
  const student = formData.student;

  const isEmpty = (value: any) =>
    value === undefined || value === null || (typeof value === "string" && value.trim() === "");

  // Stage 1: Basic Info
  if (stageNum === 1) {
    if (isEmpty(student.name)) newErrors["student.name"] = "required";
    if (isEmpty(student.previous_educations?.[0]?.qualification))
      newErrors["student.previous_educations[0].qualification"] = "required";
    if (isEmpty(formData.university_id)) newErrors["university_id"] = "required";
    if (isEmpty(formData.program_id)) newErrors["program_id"] = "required";
  }

  // Stage 2: Documents
  if (stageNum === 2) {
    documentTypes.forEach((docType) => {
      if (!docType.is_required_init_app_doc) return;

      const uploaded = formData.documents.find(
        (d) => d.document_type_id === docType.id && d.file_url && !d.uploading
      );

      if (!uploaded) {
        newErrors[`documents.${docType.id}`] = "required";
      }
    });
  }

  // Stage 3: Additional Info
  if (stageNum === 3) {
    // Basic student fields
    Object.keys(student).forEach((key) => {
      if (requiredFieldKeys.includes(`student.${key}`)) {
        const value = student[key as keyof typeof student];
        if (isEmpty(value)) newErrors[`student.${key}`] = "required";
      }
    });

    // Contacts
    validateContacts(student.emergency_contacts, requiredFieldKeys, newErrors);

    // Previous educations
    validateEducations(student.previous_educations, requiredFieldKeys, newErrors);
  }

  return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
};
