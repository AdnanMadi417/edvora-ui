import { useState } from "react";
import { universityApi } from "../services";

export function useDeleteUniversity() {
  const [isDeleting, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const deleteUniversity = async (universityId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await universityApi.universities.delete(universityId);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to delete university");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteUniversity, isDeleting, error, success };
}
