import { useState, useEffect } from "react";
import { universityApi } from "../services";
import type { UniversityDetails, Branch } from "../types";

export function useUniversityDetails(universityId: string) {
  const [university, setUniversity] = useState<UniversityDetails | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [universityLoading, setLoading] = useState(false);
  const [universityError, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!universityId) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await universityApi.universities.get(universityId);
        setUniversity(res.data.university);
        setBranches(res.data.branches);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to fetch university");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [universityId]);

  return { university, branches, universityLoading, universityError };
}
