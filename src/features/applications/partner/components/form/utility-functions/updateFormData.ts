import { Dispatch, SetStateAction } from "react";
import { setNestedValue } from "features/applications/partner/components/form/utility-functions/setNestedValue";

interface UpdateFormDataParams<T> {
  fieldPath: string;
  value: any;
  setFormData: Dispatch<SetStateAction<T>>;
  setErrors?: Dispatch<SetStateAction<Record<string, string>>>;
}

export const updateFormData = <T>({
                                    fieldPath,
                                    value,
                                    setFormData,
                                    setErrors,
                                  }: UpdateFormDataParams<T>) => {
  setFormData(prev => setNestedValue(prev as any, fieldPath, value));

  if (setErrors) {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldPath];
      return newErrors;
    });
  }
};
