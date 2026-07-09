export type UniversityFormData = {
  name: string;
  country?: string;
  code?: string;
  description?: string;
  website?: string;
  university_type_id: string;
  is_active?: boolean;
  branches: Array<{
    name: string;
    location: string;
    state_id: string;
  }>;
};

export type UniversityValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

export const validateUniversity = (formData: UniversityFormData): UniversityValidationResult => {
  const errors: Record<string, string> = {};

  // name — required, 3–255 chars
  if (!formData.name?.trim()) {
    errors.name = "University name is required";
  } else if (formData.name.trim().length < 3) {
    errors.name = "University name must be at least 3 characters";
  } else if (formData.name.trim().length > 255) {
    errors.name = "University name must not exceed 255 characters";
  }

  // country — required only when the field is present in the form (edit form), max 100 (String100)
  if (formData.country !== undefined) {
    if (!formData.country?.trim())
      errors.country = "Country is required";
    else if (formData.country.trim().length > 100)
      errors.country = "Country must not exceed 100 characters";
  }

  // university_type_id — required
  if (!formData.university_type_id) {
    errors.university_type_id = "University type is required";
  }

  // website — optional, max 255
  if (formData.website && formData.website.trim().length > 255) {
    errors.website = "Website URL must not exceed 255 characters";
  }

  // branches — at least one required, each with name + location + state_id
  if (!formData.branches || formData.branches.length === 0) {
    errors.branches = "At least one branch is required";
  } else {
    formData.branches.forEach((b, i) => {
      if (!b.name?.trim())
        errors[`branches[${i}].name`] = "Branch name is required";
      else if (b.name.trim().length < 3)
        errors[`branches[${i}].name`] = "Branch name must be at least 3 characters";
      else if (b.name.trim().length > 255)
        errors[`branches[${i}].name`] = "Branch name must not exceed 255 characters";

      if (!b.location?.trim())
        errors[`branches[${i}].location`] = "Location is required";
      else if (b.location.trim().length < 3)
        errors[`branches[${i}].location`] = "Location must be at least 3 characters";
      else if (b.location.trim().length > 255)
        errors[`branches[${i}].location`] = "Location must not exceed 255 characters";

      if (!b.state_id)
        errors[`branches[${i}].state_id`] = "State is required";
    });
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const isUniversityComplete = (formData: UniversityFormData): boolean => {
  if (!formData.name?.trim() || formData.name.trim().length < 3) return false;
  if (formData.country !== undefined && !formData.country?.trim()) return false;
  if (!formData.university_type_id) return false;
  if (!formData.branches || formData.branches.length === 0) return false;
  if (formData.branches.some((b) =>
    !b.name?.trim() || b.name.trim().length < 3 ||
    !b.location?.trim() || b.location.trim().length < 3 ||
    !b.state_id
  )) return false;
  return true;
};
