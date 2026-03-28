import { useState, useEffect } from "react";
import api from "../../../lib/useApi";

interface Branch {
  id: string;
  name: string;
  location: string;
  state: string;
}

interface UniversityDetails {
  id: string;
  name: string;
  country: string;
  is_active: boolean;
  description?: string;
  university_type_id: string;
  intake_months?: string[];
}

interface UniversityResponse {
  university: UniversityDetails;
  branches: Branch[];
}

export function useUniversityDetails(universityId: string) {
  const [university, setUniversity] = useState<UniversityDetails | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [universityLoading, setLoading] = useState(false);
  const [universityError, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!universityId) return;

    const fetchUniversity = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get<UniversityResponse>(
          `/knowledge-hub/universities/${universityId}`
        );

        setUniversity(res.data.university);
        setBranches(res.data.branches);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to fetch university");
      } finally {
        setLoading(false);
      }
    };

    fetchUniversity();
  }, [universityId]);

  return {
    university,
    branches,
    universityLoading,
    universityError,
  };
}