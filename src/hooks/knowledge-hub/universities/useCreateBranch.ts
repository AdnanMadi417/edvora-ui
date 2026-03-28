import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

interface CreateBranchPayload {
  name: string;
  location: string;
  state_id: string;
}

export function useCreateBranch() {
  const [branchLoading, setLoading] = useState<boolean>(false);
  const [branchError, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const createBranch = async (
    universityId: string,
    payload: CreateBranchPayload
  ) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      const response = await api.post(
        `/knowledge-hub/universities/${universityId}/branches`,
        payload,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setSuccess(true);

      return response.data;
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to create branch"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createBranch,
    branchLoading,
    branchError,
    success,
  };
}