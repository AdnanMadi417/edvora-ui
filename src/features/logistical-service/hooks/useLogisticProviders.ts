import { useState, useEffect } from "react";
import { logisticServiceApi } from "../services";
import type { ServiceProviders } from "../types";

export function useLogisticProviders() {
  const [serviceProviders, setServiceProviders] = useState<ServiceProviders>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    logisticServiceApi.providers
      .list()
      .then((res) => setServiceProviders(res.data))
      .catch(() => setError("Failed to fetch service providers"))
      .finally(() => setLoading(false));
  }, []);

  return { serviceProviders, loading, error };
}
