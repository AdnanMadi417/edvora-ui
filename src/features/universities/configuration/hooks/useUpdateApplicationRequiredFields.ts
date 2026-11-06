import { useState } from "react";
import { universityConfigurationApi } from "features/universities/configuration/services";
import type { ApplicationRequiredField } from "features/universities/configuration/types";

export function useUpdateApplicationRequiredFields() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const updateRequiredFields = async (universityTypeId: string, payload: ApplicationRequiredField[]) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await universityConfigurationApi.applicationFields.updateRequired(universityTypeId, payload);
      setSuccess(true);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to update application required fields");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { updateRequiredFields, loading, error, success };
}
