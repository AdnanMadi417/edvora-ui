import { useState } from "react";
import { programApi } from "../services";

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
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to delete program");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteProgram, loading, error, success };
}
