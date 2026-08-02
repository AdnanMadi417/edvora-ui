import { useState } from "react";
import { programApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useDeleteProgram() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const deleteProgram = async (programId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await programApi.programs.delete(programId);
      setSuccess(true);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to delete program"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteProgram, loading, error, success };
}
