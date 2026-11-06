import { useState, useEffect } from "react";
import { serviceTypesApi } from "../services";
import type { LogisticServices } from "../types";

export function useLogisticServices() {
  const [logisticServices, setLogisticServices] = useState<LogisticServices>(
    []
  );
  const [loadingLogisticServices, setLoading] = useState(true);
  const [errorLogisticServices, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    serviceTypesApi
      .list()
      .then((res) => {
        if (active) setLogisticServices(res.data);
      })
      .catch(() => {
        if (active) setError("Failed to fetch logistics service types.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const refetchLogisticServices = () => setRefreshKey((k) => k + 1);

  return {
    logisticServices,
    loadingLogisticServices,
    errorLogisticServices,
    refetchLogisticServices,
  };
}
