import { useState } from "react";
import { logisticServiceApi } from "../services";
import { parseApiError } from "utils/parseApiError";

export function useDeleteLogisticService() {
  const [isDeleting, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const deleteLogisticService = async (id: string) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await logisticServiceApi.services.delete(id);
      setSuccess(true);
    } catch (err: unknown) {
      setError(parseApiError(err, "Failed to delete service."));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { deleteLogisticService, isDeleting, error, success };
}
