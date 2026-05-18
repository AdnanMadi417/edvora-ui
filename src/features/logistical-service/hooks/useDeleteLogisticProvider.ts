import { useState } from "react";
import { logisticServiceApi } from "../services";

export function useDeleteLogisticProvider() {
  const [isDeleting, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const deleteProvider = async (id: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await logisticServiceApi.providers.delete(id);
      setSuccess(true);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail?.[0]?.msg || "Failed to delete provider.";
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteProvider, isDeleting, error, success };
}
