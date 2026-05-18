import { useState } from "react";
import { logisticServiceApi } from "../services";
import type { EditLogisticsProviderPayload } from "../types";

export function useEditLogisticProvider() {
  const [loadingEditLogisticsProvider, setLoading] = useState(false);
  const [errorEditLogisticsProvider, setError] = useState<string | null>(null);

  const editLogisticsProvider = async (id: string, payload: EditLogisticsProviderPayload) => {
    try {
      setLoading(true);
      setError(null);
      const res = await logisticServiceApi.providers.update(id, payload);
      return res.data;
    } catch (err) {
      setError("Failed to update logistics provider");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { editLogisticsProvider, loadingEditLogisticsProvider, errorEditLogisticsProvider };
}
