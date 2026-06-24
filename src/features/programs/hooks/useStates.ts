import { useState, useEffect } from "react";
import { programApi } from "../services";
import type { StateOption } from "../types";

export function useStates() {
  const [states, setStates] = useState<StateOption[]>([]);
  const [stateLoading, setLoading] = useState(false);
  const [stateError, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await programApi.states.list();
        setStates(res.data || []);
      } catch {
        setError("Failed to fetch states");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { states, stateLoading, stateError };
}
