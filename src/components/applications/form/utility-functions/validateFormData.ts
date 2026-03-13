import { FormDataType, DocumentType, Student } from "components/applications/form/utility-functions/types";

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

  if (stageNum === 3) {

    validateStudentFields(student, requiredFieldKeys, newErrors);

    validateEmergencyContacts(student.emergency_contacts, requiredFieldKeys, newErrors);

    validateEducations(student.previous_educations, requiredFieldKeys, newErrors);
  }

  return {
    isValid: Object.keys(newErrors).length === 0,
    errors: newErrors,
  };
};