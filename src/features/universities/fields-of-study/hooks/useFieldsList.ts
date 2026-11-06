import { useState, useEffect } from "react";
import { fieldsOfStudyApi } from "../services";

import type { FieldOfStudy } from "../types";
export type { FieldOfStudy } from "../types";

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
        const res = await fieldsOfStudyApi.list();
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
