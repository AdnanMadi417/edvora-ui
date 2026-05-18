import { useState, useEffect } from "react";
import { logisticServiceApi } from "../services";
import type { LogisticLanguages } from "../types";

export function useLogisticLanguages() {
  const [logisticLanguages, setLogisticLanguages] = useState<LogisticLanguages>([]);
  const [loadingLogisticLanguage, setLoading] = useState(true);
  const [errorLogisticLanguage, setError] = useState<string | null>(null);

  useEffect(() => {
    logisticServiceApi.languages
      .list()
      .then((res) => setLogisticLanguages(res.data))
      .catch(() => setError("Failed to fetch logistic languages"))
      .finally(() => setLoading(false));
  }, []);

  return { logisticLanguages, loadingLogisticLanguage, errorLogisticLanguage };
}
