import { useState } from "react";
import { universityApi } from "../../services";
import type { ApplicationRequiredField } from "../../types";

export function useApplicationRequiredFieldById() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ApplicationRequiredField | null>(null);

  const getRequiredFieldById = async (requiredFieldId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await universityApi.applicationFields.getRequiredById(requiredFieldId);
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
