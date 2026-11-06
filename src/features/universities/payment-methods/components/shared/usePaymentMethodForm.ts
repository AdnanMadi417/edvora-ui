import { useEffect, useState } from "react";
import type { PaymentMethodPayload } from "../../types";
import { useApiFormErrors } from "hooks/useApiFormErrors";
import { scrollToFirstError } from "utils/scrollToError";

export function validatePaymentMethod(data: PaymentMethodPayload) {
  const errors: Record<string, string> = {};
  const length = data.name.trim().length;
  if (length < 3 || length > 100)
    errors.name = "Name must be between 3 and 100 characters.";
  const text = data.description
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;|&#160;/g, " ")
    .trim();
  if (text && text.length < 10)
    errors.description = "Description must be at least 10 characters.";
  return errors;
}

export function usePaymentMethodForm(
  initial: PaymentMethodPayload,
  resetKey: unknown
) {
  const [formData, setFormData] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState("");
  useEffect(() => {
    setFormData({ name: initial.name, description: initial.description });
    setErrors({});
    setApiError("");
  }, [resetKey, initial.name, initial.description]);
  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError("");
  };
  const handleApiError = useApiFormErrors({
    setErrors: (patch) => {
      setErrors(patch);
      scrollToFirstError(patch);
    },
    onUnmappedError: setApiError,
  });
  const validate = () => {
    const next = validatePaymentMethod(formData);
    setErrors(next);
    if (Object.keys(next).length) {
      scrollToFirstError(next);
      return false;
    }
    return true;
  };
  return {
    formData,
    errors,
    apiError,
    updateFormData,
    handleApiError,
    validate,
    valid: Object.keys(validatePaymentMethod(formData)).length === 0,
  };
}
