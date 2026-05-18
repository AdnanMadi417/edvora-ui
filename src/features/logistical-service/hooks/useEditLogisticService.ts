import { useState } from "react";
import { logisticServiceApi } from "../services";
import type { EditLogisticServicePayload } from "../types";

export function useEditLogisticService() {
  const [loadingEditLogisticService, setLoading] = useState(false);
  const [errorEditLogisticService, setError] = useState<string | null>(null);

  const editLogisticService = async (id: string, payload: EditLogisticServicePayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await logisticServiceApi.services.update(id, payload);
      return res.data;
    } catch (err) {
      setError("Failed to update logistic service");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { editLogisticService, loadingEditLogisticService, errorEditLogisticService };
}
