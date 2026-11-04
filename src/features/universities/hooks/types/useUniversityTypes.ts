import { useState, useEffect } from "react";
import { universityApi } from "../../services";
import type { UniversityType } from "../../types";

export function useUniversityTypes() {
  const [universities, setUniversities] = useState<UniversityType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [refetchCounter, setRefetchCounter] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await universityApi.types.list();
        setUniversities(res.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch university types");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [refetchCounter]);

  const refetchUniversityTypes = () => setRefetchCounter((c) => c + 1);

  return { universities, loading, error, refetchUniversityTypes };
}
