import { useState, useEffect } from "react";
import api from "../../../lib/useApi";

export type SubmissionField = {
  id: string;
  field_key: string;
  field_name: string;
};

export function useApplicationSubmissionFields() {
  const [submissionFields, setSubmissionFields] = useState<SubmissionField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchFields = async () => {
      setLoading(true);
      setError("");

      try {
        const res = await api.get(
          `/admin/application-submission-fields`
        );

        setSubmissionFields(res.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.detail?.[0]?.msg ||
          "Failed to fetch submission fields"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  return {
    submissionFields,
    loading,
    error,
  };
}