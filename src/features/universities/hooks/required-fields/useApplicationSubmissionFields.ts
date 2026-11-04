import { useCallback, useEffect, useState } from "react";
import { universityApi } from "../../services";
import type { SubmissionField } from "../../types";

export function useApplicationSubmissionFields() {
  const [submissionFields, setSubmissionFields] = useState<SubmissionField[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await universityApi.applicationFields.listSubmission();
      setSubmissionFields(response.data);
    } catch (error: any) {
      setError(
        error?.response?.data?.detail?.[0]?.msg ||
          "Failed to fetch submission fields"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);
  return { submissionFields, loading, error, refetch };
}
