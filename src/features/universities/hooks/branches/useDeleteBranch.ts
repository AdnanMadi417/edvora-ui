import { useState } from "react";
import { universityApi } from "../../services";

export function useDeleteBranch() {
  const [deleteLoading, setLoading] = useState(false);
  const [deleteError, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const deleteBranch = async (universityId: string, branchId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await universityApi.branches.delete(universityId, branchId);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to delete branch");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteBranch, deleteLoading, deleteError, success };
}
