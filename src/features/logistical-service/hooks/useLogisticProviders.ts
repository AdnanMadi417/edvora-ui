import { useState, useEffect, useCallback } from "react";
import { logisticServiceApi } from "../services";
import type { ServiceProviders } from "../types";

export function useLogisticProviders() {
  const [serviceProviders, setServiceProviders] = useState<ServiceProviders>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProviders = useCallback(() => {
    setLoading(true);
    setError(null);
    logisticServiceApi.providers
      .list()
      .then((res) => setServiceProviders(res.data))
      .catch(() => setError("Failed to fetch service providers"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  return { serviceProviders, loading, error, refetch: fetchProviders };
}
