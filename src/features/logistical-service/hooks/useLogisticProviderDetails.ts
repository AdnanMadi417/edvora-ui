import { useState, useEffect } from "react";
import { logisticServiceApi } from "../services";
import type { ServiceProvider } from "../types";

export function useLogisticProviderDetails(id: string) {
  const [service, setService] = useState<ServiceProvider | null>(null);
  const [loadingService, setLoading] = useState(true);
  const [errorService, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setService(null);
    setError(null);
    setLoading(Boolean(id));
    if (!id) return;
    logisticServiceApi.providers
      .get(id)
      .then((res) => {
        if (active) setService(res.data);
      })
      .catch(() => {
        if (active) setError("Failed to fetch logistics provider details.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  return { service, loadingService, errorService };
}
