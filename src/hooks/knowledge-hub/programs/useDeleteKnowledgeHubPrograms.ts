import { useState } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export function useDeleteKnowledgeHubPrograms() {
  const [deleteProgramsLoading, setLoading] = useState<boolean>(false);
  const [deleteProgramsError, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  /**
   * Batch delete programs
   */
  const deletePrograms = async (programIds: string[]) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const token = Cookies.get("token");

      await api.delete("/knowledge-hub/programs", {
        data: {
          program_ids: programIds,
        },
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setSuccess(true);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.response?.data?.detail?.[0]?.msg ||
        "Failed to delete programs"
      );

      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deletePrograms,
    deleteProgramsLoading,
    deleteProgramsError,
    success,
  };
}