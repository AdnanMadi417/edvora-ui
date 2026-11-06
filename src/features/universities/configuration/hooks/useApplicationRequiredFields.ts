import { useState } from "react";
import { universityConfigurationApi } from "features/universities/configuration/services";
import type { ApplicationRequiredField } from "features/universities/configuration/types";

export function useApplicationRequiredFields() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ApplicationRequiredField[]>([]);

  const getRequiredFields = async (universityTypeId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await universityConfigurationApi.applicationFields.listRequired(universityTypeId);
      setData(res.data);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to fetch application required fields");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getRequiredFields, loading, error, data };
}
