import { useState } from "react";
import { universityApi } from "../../services";
import { parseApiError } from "utils/parseApiError";

export function useSetUniversityHidden() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setUniversityHidden = async (universityId: string, isHidden: boolean) => {
    setLoading(true);
    setError("");
    try {
      const res = await universityApi.universities.update(universityId, { is_hidden: isHidden });
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, isHidden ? "Failed to hide university" : "Failed to unhide university"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { setUniversityHidden, loading, error };
}
