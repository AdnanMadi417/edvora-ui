import { useCallback, useEffect, useState } from "react";
import { universityConfigurationApi } from "features/universities/configuration/services";
import type { SubmissionField } from "features/universities/configuration/types";

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
      const response = await universityConfigurationApi.applicationFields.listSubmission();
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
