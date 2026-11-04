import { useState } from "react";
import { programApi } from "../../services";
import { parseApiError } from "utils/parseApiError";

/**
 * Deep-copies a program into another branch of the same university
 * (POST /knowledge-hub/programs/{id}/copy). Returns the 201 body, which
 * mirrors the program-detail GET: `{ program, required_documents,
 * commission, exchange_rates }` — the new program's id is at
 * `res.program.id`. Sets `error` and re-throws so the caller can branch on
 * the backend error `code` as well.
 */
export function useCopyProgramToBranch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const copyProgramToBranch = async (programId: string, branchId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await programApi.programs.copyToBranch(programId, branchId);
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to copy program"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { copyProgramToBranch, loading, error };
}
