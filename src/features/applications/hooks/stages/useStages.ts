import { useState, useEffect, useCallback } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type Stages = {
  id: string;
  name: string;
  code: string;
  order_index: number;
};

export function useAllStages() {
  const [stages, setStages] = useState<Stages[]>([]);
  const [stagesLoading, setLoading] = useState<boolean>(false);
  const [stagesError, setError] = useState<string>("");

  const fetchStages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = Cookies.get("token");
      const res = await api.get("/applications/stages", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setStages(res.data || []);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch stages");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStages();
  }, [fetchStages]);

  return { stages, stagesLoading, stagesError, refetch: fetchStages };
}
