import { useState } from "react";
import api from "lib/useApi";
import { parseApiError } from "utils/parseApiError";

interface DeleteScholarshipsPayload {
  program_ids: string[];
  scholarship_names: string[];
}

export function useDeleteScholarships() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteScholarships = async (payload: DeleteScholarshipsPayload) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.delete("/knowledge-hub/scholarships", {
        data: payload,
      });
      return res.data;
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to delete scholarships"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteScholarships, loading, error };
}
