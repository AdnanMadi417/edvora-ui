import { useState, useEffect } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export type FieldOfStudy = {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
};

export function useAllFields() {
  const [fields, setFields] = useState<FieldOfStudy[]>([]);
  const [fieldsLoading, setLoading] = useState<boolean>(false);
  const [fieldsError, setError] = useState<string>("");
  const [refetchCounter, setRefetchCounter] = useState(0);

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      setError("");

      try {
        const token = Cookies.get("token");

        const res = await api.get("/knowledge-hub/fields-of-study", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setFields(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch fields of study");
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, [refetchCounter]);

  return {
    fields,
    fieldsLoading,
    fieldsError,
    refetch: () => setRefetchCounter((c) => c + 1),
  };
}
