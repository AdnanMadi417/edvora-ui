import { useState } from "react";
import { universityConfigurationApi } from "features/universities/configuration/services";

export function useDeleteUniversityType() {
  const [isDeleting, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const deleteUniversityType = async (universityTypeId: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      await universityConfigurationApi.types.delete(universityTypeId);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail?.[0]?.msg || "Failed to delete university type");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteUniversityType, isDeleting, error, success };
}
