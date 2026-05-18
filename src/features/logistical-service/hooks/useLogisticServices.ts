import { useState, useEffect } from "react";
import { logisticServiceApi } from "../services";
import type { LogisticServices } from "../types";

export function useLogisticServices() {
  const [logisticServices, setLogisticServices] = useState<LogisticServices>([]);
  const [loadingLogisticServices, setLoading] = useState(true);
  const [errorLogisticServices, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setLoading(true);
    logisticServiceApi.services
      .list()
      .then((res) => setLogisticServices(res.data))
      .catch(() => setError("Failed to fetch logistic services"))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const refetchLogisticServices = () => setRefreshKey((k) => k + 1);

  return { logisticServices, loadingLogisticServices, errorLogisticServices, refetchLogisticServices };
}
