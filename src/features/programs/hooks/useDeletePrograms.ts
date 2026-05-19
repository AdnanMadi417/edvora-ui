import { useState } from "react";
import { programApi } from "../services";

export function useDeletePrograms() {
  const [deleteProgramsLoading, setLoading] = useState(false);
  const [deleteProgramsError, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const deletePrograms = async (programIds: string[]) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await programApi.programs.batchDelete(programIds);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to delete programs");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deletePrograms, deleteProgramsLoading, deleteProgramsError, success };
}
