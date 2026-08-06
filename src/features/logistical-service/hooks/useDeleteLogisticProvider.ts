import { useState } from "react";
import { logisticServiceApi } from "../services";
import { parseApiError } from "utils/parseApiError";

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
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to delete provider."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteProvider, isDeleting, error, success };
}
