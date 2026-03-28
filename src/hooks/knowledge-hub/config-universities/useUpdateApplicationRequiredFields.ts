import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export type ApplicationRequiredField = {
  id: string;
  field_key: string;
  is_required: boolean;
  field_name: string;
};

export function useUpdateApplicationRequiredFields() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const updateRequiredFields = async (
    universityTypeId: string,
    payload: ApplicationRequiredField[]
  ) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      const res = await api.put(
        `/admin/university-types/${universityTypeId}/application-required-fields`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setSuccess(true);
      return res.data;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to update application required fields"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateRequiredFields,
    loading,
    error,
    success,
  };
}