import { useState, useEffect } from "react";
import { universityApi } from "../services";
import type { Branch } from "../types";

export function useBranches(universityId?: string) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchesLoading, setLoading] = useState(false);
  const [branchesError, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!universityId) return;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await universityApi.branches.list(universityId);
        setBranches(res.data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "Failed to fetch branches");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [universityId]);

  return { branches, branchesLoading, branchesError };
}
