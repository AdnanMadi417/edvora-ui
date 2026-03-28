import { useState, useEffect } from "react";
import api from "../../../lib/useApi";

export interface Branch {
  id: string;
  name: string;
  location: string;
  state: string;
}

export function useAllBranches(universityId?: string) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setLoading] = useState(false);
  const [branchesError, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!universityId) return;

    const fetchBranches = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.get(
          `/knowledge-hub/universities/${universityId}/branches`
        );
        setBranches(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to fetch branches");
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [universityId]);

  return { branches, branchesLoading, branchesError };
}