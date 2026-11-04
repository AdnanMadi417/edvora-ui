import { useState } from "react";
import { programApi } from "../../services";
import { parseApiError } from "utils/parseApiError";

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
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to delete programs"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deletePrograms, deleteProgramsLoading, deleteProgramsError, success };
}
