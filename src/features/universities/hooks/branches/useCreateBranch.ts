import { useState } from "react";
import { universityApi } from "../../services";
import type { CreateBranchPayload } from "../../types";

export function useCreateBranch() {
  const [branchLoading, setLoading] = useState(false);
  const [branchError, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const createBranch = async (universityId: string, payload: CreateBranchPayload) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const res = await universityApi.branches.create(universityId, payload);
      setSuccess(true);
      return res.data;
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to create branch");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createBranch, branchLoading, branchError, success };
}
