import { useState, useEffect } from "react";
import { universityApi } from "../../services";
import type { UniversityTypeDetails } from "../../types";

export function useUniversityTypeDetails(universityTypeId: string) {
  const [university, setUniversity] = useState<UniversityTypeDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!universityTypeId) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await universityApi.types.get(universityTypeId);
        setUniversity(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch university type details");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [universityTypeId]);

  return { university, loading, error };
}
