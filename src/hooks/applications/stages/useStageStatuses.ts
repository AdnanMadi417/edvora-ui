import { useState, useEffect } from "react";
import api from "../../../lib/useApi";
import Cookies from "js-cookie";

export type Stages = {
  id: string;
  name: string;
  is_requires_reason: boolean;
  is_requires_document_selection: boolean;
  is_triggers_stage_advance: boolean;
};

export function useAllStageStatuses() {
  const [stageStatuses, setStages] = useState<Stages[]>([]);
  const [stageStatusesLoading, setLoading] = useState<boolean>(false);
  const [stageStatusesError, setError] = useState<string>("");

  useEffect(() => {
    const fetchStages = async () => {
      setLoading(true);
      setError("");

      try {
        const token = Cookies.get("token");

        const res = await api.get("/applications/stage-statuses", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setStages(res.data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch Stages of study");
      } finally {
        setLoading(false);
      }
    };

    fetchStages();
  }, []);

  return {
    stageStatuses,
    stageStatusesLoading,
    stageStatusesError,
  };
}
