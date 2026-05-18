import { useState, useEffect } from "react";
import { logisticServiceApi } from "../services";
import type { LogisticServiceLocations } from "../types";

export function useLogisticServiceLocations() {
  const [logisticServiceLocations, setLogisticServiceLocations] = useState<LogisticServiceLocations>([]);
  const [loadingServiceLocations, setLoading] = useState(true);
  const [errorServiceLocations, setError] = useState<string | null>(null);

  useEffect(() => {
    logisticServiceApi.locations
      .list()
      .then((res) => setLogisticServiceLocations(res.data))
      .catch(() => setError("Failed to fetch logistic service locations"))
      .finally(() => setLoading(false));
  }, []);

  return { logisticServiceLocations, loadingServiceLocations, errorServiceLocations };
}
