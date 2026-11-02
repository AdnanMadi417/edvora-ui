
import { FormDataType, DocumentType, Student } from "features/applications/partner/components/form/utility-functions/types";

export type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

const isEmpty = (value: any) =>
  value === undefined || value === null || (typeof value === "string" && value.trim() === "");

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const isValidPhone = (value: string) =>
  /^\+?[\d\s\-()]{7,20}$/.test(value.trim());

const isValidPassport = (value: string) =>
  /^[A-Z0-9]{6,20}$/i.test(value.trim());

const minAge = 15;
const maxAge = 80;

const isValidBirthday = (value: string): string | null => {
  const date = new Date(value);
  if (isNaN(date.getTime())) return "Enter a valid date of birth";
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear() -
    (today < new Date(today.getFullYear(), date.getMonth(), date.getDate()) ? 1 : 0);
  if (age < minAge) return `Student must be at least ${minAge} years old`;
  if (age > maxAge) return `Please enter a valid date of birth`;
  return null;
};

const validateStudentFields = (
  student: Student,
  requiredFieldKeys: string[],
  errors: Record<string, string>
) => {
  if (requiredFieldKeys.includes("student.birthday")) {
    if (isEmpty(student.birthday)) {
      errors["student.birthday"] = "Enter the date of birth.";
    } else {
      const err = isValidBirthday(student.birthday);
      if (err) errors["student.birthday"] = err;
    }
  }

  if (requiredFieldKeys.includes("student.nationality") && isEmpty(student.nationality))
    errors["student.nationality"] = "Choose the student's nationality.";

  if (requiredFieldKeys.includes("student.passport_number")) {
    if (isEmpty(student.passport_number)) {
      errors["student.passport_number"] = "Enter the passport number.";
    } else if (!isValidPassport(student.passport_number)) {
      errors["student.passport_number"] = "Must be 6–20 letters and digits, no spaces";
    }
  }

  if (requiredFieldKeys.includes("student.email")) {
    if (isEmpty(student.email)) {
      errors["student.email"] = "Enter an email address.";
    } else if (!isValidEmail(student.email)) {
      errors["student.email"] = "Enter a valid email address (e.g. name@example.com)";
    }
  }

  if (requiredFieldKeys.includes("student.phone")) {
    if (isEmpty(student.phone)) {
      errors["student.phone"] = "Enter a phone number.";
    } else if (!isValidPhone(student.phone)) {
      errors["student.phone"] = "Enter a valid phone number (7–20 digits, may include + and spaces)";
    }
  }

  if (requiredFieldKeys.includes("student.current_address")) {
    if (isEmpty(student.current_address)) {
      errors["student.current_address"] = "Enter the current address.";
    } else if (student.current_address.trim().length < 5) {
      errors["student.current_address"] = "Address must be at least 5 characters";
    }
  }

  if (requiredFieldKeys.includes("student.gender") && isEmpty(student.gender))
    errors["student.gender"] = "Choose a gender.";
};

const validateEmergencyContacts = (
  contacts: Student["emergency_contacts"],
  requiredFieldKeys: string[],
  errors: Record<string, string>
) => {
  const fields = ["name", "relation", "phone", "email"] as const;
  (contacts || []).forEach((contact, idx) => {
    const hasAnyData = fields.some((f) => !isEmpty(contact[f]));

    if ((requiredFieldKeys.includes(`student.emergency_contacts[${idx}].name`) || hasAnyData) && isEmpty(contact.name))
      errors[`student.emergency_contacts[${idx}].name`] = "Enter the emergency contact's name.";
    else if (!isEmpty(contact.name) && contact.name.trim().length < 2)
      errors[`student.emergency_contacts[${idx}].name`] = "Name must be at least 2 characters";

    if ((requiredFieldKeys.includes(`student.emergency_contacts[${idx}].relation`) || hasAnyData) && isEmpty(contact.relation))
      errors[`student.emergency_contacts[${idx}].relation`] = "Enter how they're related to the student.";

    if ((requiredFieldKeys.includes(`student.emergency_contacts[${idx}].phone`) || hasAnyData) && isEmpty(contact.phone)) {
      errors[`student.emergency_contacts[${idx}].phone`] = "Enter the emergency contact's phone number.";
    } else if (!isEmpty(contact.phone) && !isValidPhone(contact.phone)) {
      errors[`student.emergency_contacts[${idx}].phone`] = "Enter a valid phone number";
    }

    if (!isEmpty(contact.email) && !isValidEmail(contact.email))
      errors[`student.emergency_contacts[${idx}].email`] = "Enter a valid email address";
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
        const labels: Record<string, string> = {
          qualification: "Qualification",
          institution_name: "Institution name",
          start_date: "Start date",
          end_date: "End date",
          field_of_study: "Field of study",
        };
        errors[fullKey] = `${labels[f] ?? f} is required`;
      }
    });

    if (!isEmpty(edu.institution_name) && edu.institution_name.trim().length < 3)
      errors[`student.previous_educations[${idx}].institution_name`] = "Institution name must be at least 3 characters";

    if (!isEmpty(edu.start_date) && !isEmpty(edu.end_date) && new Date(edu.start_date) > new Date(edu.end_date))
      errors[`student.previous_educations[${idx}].end_date`] = "End date must be after start date";
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
    if (isEmpty(student.name)) {
      newErrors["student.name"] = "Enter the student's full name as on the passport.";
    } else if (student.name.trim().length < 3) {
      newErrors["student.name"] = "Name must be at least 3 characters";
    } else if (student.name.trim().length > 100) {
      newErrors["student.name"] = "Name must not exceed 100 characters";
    } else if (!/^[\p{L}\s'\-\.]+$/u.test(student.name.trim())) {
      newErrors["student.name"] = "Name must contain letters only";
    }

    if (isEmpty(student.passport_number)) {
      newErrors["student.passport_number"] = "Enter the passport number.";
    } else if (student.passport_number.trim().length < 6) {
      newErrors["student.passport_number"] = "Passport number must be at least 6 characters";
    } else if (student.passport_number.trim().length > 20) {
      newErrors["student.passport_number"] = "Passport number must not exceed 20 characters";
    } else if (!isValidPassport(student.passport_number)) {
      newErrors["student.passport_number"] = "Passport number must contain only letters and digits, no spaces";
    }

    if (isEmpty(student.nationality))
      newErrors["student.nationality"] = "Choose the student's nationality.";

    if (isEmpty(formData.university_id))
      newErrors["university_id"] = "Choose an Institution.";

    if (isEmpty(formData.program_id))
      newErrors["program_id"] = "Choose a programme.";
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
        if (!uploaded)
          newErrors[`documents.${docType.id}`] = `${docType.type} is required`;
      });
    }
  }

  if (stageNum === 3) {
    if (requiredFieldKeys.includes("intake_date") && isEmpty(formData.intake_date))
      newErrors["intake_date"] = "Choose an intake.";

    validateStudentFields(student, requiredFieldKeys, newErrors);
    validateEmergencyContacts(student.emergency_contacts || [], requiredFieldKeys, newErrors);
    validateEducations(student.previous_educations || [], requiredFieldKeys, newErrors);
  }

  return {
    isValid: Object.keys(newErrors).length === 0,
    errors: newErrors,
  };
};

export const isStageComplete = (
  formData: FormDataType,
  stageNum: number,
  requiredFieldKeys: string[],
  documentTypes: DocumentType[],
  documentTypesLoading?: boolean
): boolean => {
  const student = formData.student;

  if (stageNum === 1) {
    return (
      !isEmpty(student.name) &&
      !isEmpty(student.passport_number) &&
      !isEmpty(student.nationality) &&
      !isEmpty(formData.university_id) &&
      !isEmpty(formData.program_id)
    );
  }

  if (stageNum === 2) {
    if (documentTypesLoading) return false;
    return documentTypes.every((docType) => {
      if (!(docType.is_required_for_init ?? docType.is_required_init_app_doc)) return true;
      return formData.documents.some(
        (d) => d.document_type_id === docType.id && d.file_url && !d.uploading
      );
    });
  }

  if (stageNum === 3) {
    if (requiredFieldKeys.includes("intake_date") && isEmpty(formData.intake_date)) return false;

    const simpleFields = ["birthday", "nationality", "passport_number", "email", "phone", "current_address", "gender"] as const;
    for (const key of simpleFields) {
      if (requiredFieldKeys.includes(`student.${key}`) && isEmpty(student[key as keyof Student])) return false;
    }

    for (const [idx, contact] of (student.emergency_contacts || []).entries()) {
      for (const f of ["name", "relation", "phone"] as const) {
        if (requiredFieldKeys.includes(`student.emergency_contacts[${idx}].${f}`) && isEmpty(contact[f])) return false;
      }
    }

    for (const [idx, edu] of (student.previous_educations || []).entries()) {
      for (const f of ["qualification", "institution_name", "start_date", "end_date"] as const) {
        if (requiredFieldKeys.includes(`student.previous_educations[${idx}].${f}`) && isEmpty(edu[f])) return false;
      }
    }
  }

  return true;
};
