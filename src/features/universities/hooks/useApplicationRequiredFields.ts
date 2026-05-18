import { useState } from "react";
import { universityApi } from "../services";
import type { ApplicationRequiredField } from "../types";

export function useApplicationRequiredFields() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<ApplicationRequiredField[]>([]);

  const getRequiredFields = async (universityTypeId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await universityApi.applicationFields.listRequired(universityTypeId);
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
