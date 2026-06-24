import { useState, useEffect } from "react";
import { logisticServiceApi } from "../services";
import type { ServiceProvider } from "../types";

export function useLogisticProviderDetails(id: string) {
  const [service, setService] = useState<ServiceProvider | null>(null);
  const [loadingService, setLoading] = useState(true);
  const [errorService, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    logisticServiceApi.providers
      .get(id)
      .then((res) => setService(res.data))
      .catch(() => setError("Failed to fetch logistic service details"))
      .finally(() => setLoading(false));
  }, [id]);

  return { service, loadingService, errorService };
}
