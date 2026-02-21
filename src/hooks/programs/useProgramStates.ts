import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type StateOption = {
  id: string;
  name: string;
};

export function useKnowledgeHubStates() {
  const [states, setStates] = useState<StateOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStates = async () => {
      setLoading(true);
      try {
        const token = Cookies.get("token");
        const res = await api.get("/knowledge-hub/states", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setStates(res.data || []);
      } catch (err) {
        setError("Failed to fetch states");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStates();
  }, []);

  return { states, loading, error };
}
