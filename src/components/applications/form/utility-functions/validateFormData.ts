
import { FormDataType, DocumentType,Student } from "components/applications/form/utility-functions/types";

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

const validateContacts = (
  contacts: Student["emergency_contacts"],
  requiredFieldKeys: string[],
  errors: Record<string, string>
) => {
  contacts.forEach((c, idx) => {
    ["name", "relation", "phone", "email"].forEach((f) => {
      const key = `student.emergency_contacts[${idx}].${f}`;
      if (requiredFieldKeys.includes(key)) {
        const value = c[f as keyof typeof c];
        if (value === undefined || value === null || (typeof value === "string" && value.trim() === "")) {
          errors[key] = "required";
        }
      }
    });
  });
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
  (contacts || []).forEach((contact, idx) => {
    ["name", "relation", "phone", "email"].forEach((f) => {
      const fullKey = `student.emergency_contacts[${idx}].${f}`;
      if (requiredFieldKeys.includes(fullKey) && isEmpty(contact[f as keyof typeof contact])) {
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
  (educations || []).forEach((edu, idx) => {
    ["qualification", "institution_name", "start_date", "end_date"].forEach((f) => {
      const fullKey = `student.previous_educations[${idx}].${f}`;
      if (requiredFieldKeys.includes(fullKey) && isEmpty(edu[f as keyof typeof edu])) {
        errors[fullKey] = "required";
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

  if (stageNum === 1) {
    const firstEducation = student.previous_educations?.[0];

    if (isEmpty(student.name))
      newErrors["student.name"] = "required";

    if (isEmpty(formData.university_id))
      newErrors["university_id"] = "required";

    if (isEmpty(formData.program_id))
      newErrors["program_id"] = "required";

    if (isEmpty(student.passport_number))
      newErrors["student.passport_number"] = "required";
  }

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

  if (stageNum === 3) {

    validateStudentFields(student, requiredFieldKeys, newErrors);

    validateEmergencyContacts(student.emergency_contacts, requiredFieldKeys, newErrors);

    validateEducations(student.previous_educations, requiredFieldKeys, newErrors);
  }


  if (stageNum === 3) {
    validateStudentFields(student, requiredFieldKeys, newErrors);
    validateEmergencyContacts(student.emergency_contacts || [], requiredFieldKeys, newErrors);
    validateEducations(student.previous_educations || [], requiredFieldKeys, newErrors);
  }

  return {
    isValid: Object.keys(newErrors).length === 0,
    errors: newErrors,
  };
};