import { useState } from "react";
import { logisticServiceApi } from "../services";
import type { CreateLogisticsProviderPayload } from "../types";
import { parseApiError } from "utils/parseApiError";

export function useCreateLogisticProvider() {
  const [loadingCreateLogisticsProvider, setLoading] = useState(false);
  const [errorCreateLogisticsProvider, setError] = useState<string | null>(null);

  const createLogisticsProvider = async (payload: CreateLogisticsProviderPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await logisticServiceApi.providers.create(payload);
      return res.data;
    } catch (err) {
      setError(parseApiError(err, "Failed to create logistics provider"));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { createLogisticsProvider, loadingCreateLogisticsProvider, errorCreateLogisticsProvider };
}
