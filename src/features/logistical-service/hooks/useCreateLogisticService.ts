import { useState } from "react";
import { logisticServiceApi } from "../services";
import type { CreateLogisticServicePayload } from "../types";

export function useCreateLogisticService() {
  const [loadingCreateLogisticService, setLoading] = useState(false);
  const [errorCreateLogisticService, setError] = useState<string | null>(null);

  const createLogisticService = async (payload: CreateLogisticServicePayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await logisticServiceApi.services.create(payload);
      return res.data;
    } catch (err) {
      setError("Failed to create logistic service");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createLogisticService, loadingCreateLogisticService, errorCreateLogisticService };
}
