import { useState } from "react";
import { serviceTypesApi } from "../services";
import type { CreateLogisticServicePayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useCreateLogisticService() {
  const [loadingCreateLogisticService, setLoading] = useState(false);
  const [errorCreateLogisticService, setError] = useState<string | null>(null);

  const createLogisticService = async (
    payload: CreateLogisticServicePayload
  ) => {
    try {
      setLoading(true);
      setError(null);
      const res = await serviceTypesApi.create(payload);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to create logistic service"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createLogisticService,
    loadingCreateLogisticService,
    errorCreateLogisticService,
  };
}
