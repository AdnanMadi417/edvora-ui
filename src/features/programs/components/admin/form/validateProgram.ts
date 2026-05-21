import { FormData } from "./RegisterProgram";

export type ProgramValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

const isEmpty = (v: any) =>
  v === undefined || v === null || (typeof v === "string" && v.trim() === "") || v === 0;

export const validateProgram = (formData: FormData): ProgramValidationResult => {
  const errors: Record<string, string> = {};

  // name — required, min 5, max 255
  if (!formData.name.trim()) {
    errors.name = "Program name is required";
  } else if (formData.name.trim().length < 5) {
    errors.name = "Program name must be at least 5 characters";
  } else if (formData.name.trim().length > 255) {
    errors.name = "Program name must not exceed 255 characters";
  }

  // uni_id — required
  if (!formData.uni_id) errors.uni_id = "University is required";

  // qualification_id — required
  if (!formData.qualification_id) errors.qualification_id = "Qualification level is required";

  // field_of_study_id — required (frontend rule, backend nullable)
  if (!formData.field_of_study_id) errors.field_of_study_id = "Field of study is required";

  // duration — optional, if provided: positive, max 999.99 (Numeric5,2)
  if (formData.duration) {
    const dur = Number(formData.duration);
    if (isNaN(dur) || dur <= 0) {
      errors.duration = "Duration must be greater than 0";
    } else if (dur > 999.99) {
      errors.duration = "Duration cannot exceed 999.99 years";
    } else if (!/^\d{1,3}(\.\d{1,2})?$/.test(String(formData.duration))) {
      errors.duration = "Duration must be a number with up to 2 decimal places";
    }
  }

  // english_required_score — optional, max 50 chars (String50)
  if (formData.english_required_score?.trim() && formData.english_required_score.trim().length > 50) {
    errors.english_required_score = "Score must not exceed 50 characters";
  }

  // delivery mode — at least one must be true
  if (!formData.is_on_campus && !formData.is_online) {
    errors.is_on_campus = "At least one delivery mode must be selected (On-Campus or Online)";
  }

  // tuition_fee — optional, max 9,999,999,999.99 (Numeric12,2)
  if (formData.tuition_fee && Number(formData.tuition_fee) > 9_999_999_999.99) {
    errors.tuition_fee = "Tuition fee cannot exceed 9,999,999,999.99";
  }

  // commission_amount — optional, integer, max 29,999
  if (formData.commission_amount && Number(formData.commission_amount) > 29_999) {
    errors.commission_amount = "Commission amount cannot exceed RM 29,999";
  }

  // commission_notes — optional, max 500 chars (String500)
  if (formData.commission_notes && formData.commission_notes.trim().length > 500) {
    errors.commission_notes = "Commission notes must not exceed 500 characters";
  }

  // yearly_fees — if rows exist, year > 0 and fee > 0
  (formData.yearly_fees || []).forEach((y, i) => {
    if (!y.year || Number(y.year) <= 0)
      errors[`yearly_fees[${i}].year`] = "Year must be greater than 0";
    if (!y.fee || Number(y.fee) <= 0)
      errors[`yearly_fees[${i}].fee`] = "Fee must be greater than 0";
  });

  // one_time_fees — description required, fee > 0
  (formData.one_time_fees || []).forEach((f, i) => {
    if (!f.description?.trim())
      errors[`one_time_fees[${i}].description`] = "Description is required";
    if (!f.fee || Number(f.fee) <= 0)
      errors[`one_time_fees[${i}].fee`] = "Fee must be greater than 0";
  });

  // scholarships — name + description required when has_scholarship
  if (formData.has_scholarship) {
    (formData.scholarships || []).forEach((s, i) => {
      if (!s.name?.trim()) {
        errors[`scholarships[${i}].name`] = "Scholarship name is required";
      } else if (s.name.trim().length < 5) {
        errors[`scholarships[${i}].name`] = "Name must be at least 5 characters";
      }
      if (!s.description?.trim()) {
        errors[`scholarships[${i}].description`] = "Description is required";
      } else if (s.description.trim().length < 5) {
        errors[`scholarships[${i}].description`] = "Description must be at least 5 characters";
      }
    });
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

// Empty-only check — controls button disable state
export const isProgramComplete = (formData: FormData): boolean => {
  if (!formData.name.trim() || formData.name.trim().length < 5) return false;
  if (!formData.uni_id) return false;
  if (!formData.qualification_id) return false;
  if (!formData.field_of_study_id) return false;
  if (!formData.is_on_campus && !formData.is_online) return false;
  if (formData.commission_amount && Number(formData.commission_amount) > 29_999) return false;
  if ((formData.yearly_fees || []).some((y) => !y.year || Number(y.year) <= 0 || !y.fee || Number(y.fee) <= 0)) return false;
  if ((formData.one_time_fees || []).some((f) => !f.description?.trim() || !f.fee || Number(f.fee) <= 0)) return false;
  if (formData.has_scholarship) {
    if ((formData.scholarships || []).some((s) => !s.name?.trim() || s.name.trim().length < 5 || !s.description?.trim() || s.description.trim().length < 5)) return false;
  }
  return true;
};
