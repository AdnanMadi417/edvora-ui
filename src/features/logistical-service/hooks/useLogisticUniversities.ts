import { useState, useEffect } from "react";
import { logisticServiceApi } from "../services";
import type { LogisticUniversities } from "../types";

export function useLogisticUniversities() {
  const [logisticUniversities, setLogisticUniversities] = useState<LogisticUniversities>([]);
  const [loadingLogisticUniversity, setLoading] = useState(true);
  const [errorLogisticUniversity, setError] = useState<string | null>(null);

  useEffect(() => {
    logisticServiceApi.universities
      .list()
      .then((res) => setLogisticUniversities(res.data))
      .catch(() => setError("Failed to fetch logistic universities"))
      .finally(() => setLoading(false));
  }, []);

  return { logisticUniversities, loadingLogisticUniversity, errorLogisticUniversity };
}
