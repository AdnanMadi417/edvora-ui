import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export type ApplicationRequiredField = {
  id: string;
  field_key: string;
  is_required: boolean;
  field_name: string;
};

export function useGetApplicationRequiredFields() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<ApplicationRequiredField[]>([]);

  const getRequiredFields = async (universityTypeId: string) => {
    setLoading(true);
    setError("");

    try {
      const token = Cookies.get("token");

      const res = await api.get(
        `/admin/university-types/${universityTypeId}/application-required-fields`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setData(res.data);
      return res.data;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to fetch application required fields"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getRequiredFields,
    loading,
    error,
    data,
  };
}