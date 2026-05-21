
import { FormDataType, DocumentType, Student } from "features/applications/partner/components/form/utility-functions/types";

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

const isEmpty = (value: any) =>
  value === undefined || value === null || (typeof value === "string" && value.trim() === "");

const validateStudentFields = (
  student: Student,
  requiredFieldKeys: string[],
  errors: Record<string, string>
) => {
  const simpleFields: (keyof Student)[] = [
    "birthday",
    "nationality",
    "passport_number",
    "email",
    "phone",
    "current_address",
    "gender",
  ];

  simpleFields.forEach((key) => {
    const fullKey = `student.${key}`;
    if (requiredFieldKeys.includes(fullKey) && isEmpty(student[key])) {
      errors[fullKey] = "required";
    }
  });
};

const validateEmergencyContacts = (
  contacts: Student["emergency_contacts"],
  requiredFieldKeys: string[],
  errors: Record<string, string>
) => {
  const fields = ["name", "relation", "phone", "email"] as const;
  (contacts || []).forEach((contact, idx) => {
    const hasAnyData = fields.some((f) => !isEmpty(contact[f]));
    fields.forEach((f) => {
      const fullKey = `student.emergency_contacts[${idx}].${f}`;
      if ((requiredFieldKeys.includes(fullKey) || hasAnyData) && isEmpty(contact[f])) {
        errors[fullKey] = "required";
      }
    });
  });
};

const validateEducations = (
  educations: Student["previous_educations"],
  requiredFieldKeys: string[],
  errors: Record<string, string>
) => {
  const coreFields = ["qualification", "institution_name", "start_date", "end_date"] as const;
  const allFields = [...coreFields, "field_of_study"] as const;
  (educations || []).forEach((edu, idx) => {
    const hasAnyData = coreFields.some((f) => !isEmpty(edu[f]));
    allFields.forEach((f) => {
      const fullKey = `student.previous_educations[${idx}].${f}`;
      const isApiRequired = requiredFieldKeys.includes(fullKey);
      const isCore = (coreFields as readonly string[]).includes(f);
      if ((isApiRequired || (isCore && hasAnyData)) && isEmpty(edu[f as keyof typeof edu])) {
        errors[fullKey] = "required";
      }
    });
  });
};

export const validateFormData = (
  formData: FormDataType,
  stageNum: number,
  requiredFieldKeys: string[],
  documentTypes: DocumentType[],
  documentTypesLoading?: boolean
): ValidationResult => {
  const newErrors: Record<string, string> = {};
  const student = formData.student;

  if (stageNum === 1) {
    if (isEmpty(student.name))
      newErrors["student.name"] = "required";

    if (isEmpty(student.passport_number))
      newErrors["student.passport_number"] = "required";

    if (isEmpty(student.nationality))
      newErrors["student.nationality"] = "required";

    if (isEmpty(formData.university_id))
      newErrors["university_id"] = "required";

    if (isEmpty(formData.program_id))
      newErrors["program_id"] = "required";
  }

  if (stageNum === 2) {
    if (documentTypesLoading) {
      newErrors["documents"] = "Document types are still loading, please wait.";
    } else {
      documentTypes.forEach((docType) => {
        if (!(docType.is_required_for_init ?? docType.is_required_init_app_doc)) return;

        const uploaded = formData.documents.find(
          (d) => d.document_type_id === docType.id && d.file_url && !d.uploading
        );

        if (!uploaded) {
          newErrors[`documents.${docType.id}`] = "required";
        }
      });
    }
  }

  if (stageNum === 3) {
    if (requiredFieldKeys.includes("intake_date") && isEmpty(formData.intake_date)) {
      newErrors["intake_date"] = "required";
    }
    validateStudentFields(student, requiredFieldKeys, newErrors);
    validateEmergencyContacts(student.emergency_contacts || [], requiredFieldKeys, newErrors);
    validateEducations(student.previous_educations || [], requiredFieldKeys, newErrors);
  }

  return {
    isValid: Object.keys(newErrors).length === 0,
    errors: newErrors,
  };
};
