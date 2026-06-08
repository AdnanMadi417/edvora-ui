import { useState } from "react";
import api from "lib/useApi";

type FormData = {
  program_id: string;
  note: string;
};

export const useChangeProgram = (applicationId: string | number) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({ program_id: "", note: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.program_id) newErrors.program_id = "Program is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return false;

    setLoading(true);
    try {
      await api.post(`/applications/${applicationId}/change-program`, {
        new_program_id: formData.program_id,
        notes: formData.note,
      });
      return true;
    } catch (err: any) {
      setErrors({ api: err?.message || "Failed to update program" });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { formData, errors, loading, updateFormData, submit };
};
