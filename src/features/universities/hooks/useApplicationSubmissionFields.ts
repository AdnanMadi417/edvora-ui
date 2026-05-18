import { useState, useEffect } from "react";
import { universityApi } from "../services";
import type { SubmissionField } from "../types";

export function useApplicationSubmissionFields() {
  const [submissionFields, setSubmissionFields] = useState<SubmissionField[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await universityApi.applicationFields.listSubmission();
        setSubmissionFields(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail?.[0]?.msg || "Failed to fetch submission fields");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return { submissionFields, loading, error };
}
