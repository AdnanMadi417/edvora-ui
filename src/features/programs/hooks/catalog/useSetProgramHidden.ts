import { useState } from "react";
import { programApi } from "../../services";
import { parseApiError } from "utils/parseApiError";

export function useSetProgramHidden() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setProgramHidden = async (programId: string, isHidden: boolean) => {
    setLoading(true);
    setError("");
    try {
      const res = await programApi.programs.update(programId, { is_hidden: isHidden });
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, isHidden ? "Failed to hide program" : "Failed to unhide program"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { setProgramHidden, loading, error };
}
