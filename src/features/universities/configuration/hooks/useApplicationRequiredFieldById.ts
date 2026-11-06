import { useState } from "react";
import { universityConfigurationApi } from "features/universities/configuration/services";
import type { ApplicationRequiredField } from "features/universities/configuration/types";

export function useApplicationRequiredFieldById() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ApplicationRequiredField | null>(null);

  const getRequiredFieldById = async (requiredFieldId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await universityConfigurationApi.applicationFields.getRequiredById(requiredFieldId);
      setData(res.data);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to fetch application required field");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { getRequiredFieldById, loading, error, data };
}
