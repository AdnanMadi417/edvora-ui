import { useState } from "react";
import api from "lib/useApi";

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
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || "Failed to delete scholarships";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteScholarships, loading, error };
}
