import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

const QUALIFYING_STAGE_CODE = "VISA_PROCESSING";
const PAGE_SIZE = 20;

export function usePartnerHasLogisticalAccess() {
  const [hasAccess, setHasAccess] = useState(false);
  const [visaProcessingCount, setVisaProcessingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      try {
        const token = Cookies.get("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        let partnerId = localStorage.getItem("partnerId");
        if (!partnerId) {
          const meRes = await api.get("/auth/me", { headers });
          partnerId = meRes.data.partner_id ?? meRes.data.id;
          if (partnerId) localStorage.setItem("partnerId", partnerId);
        }
        if (!partnerId) return;

        // Qualifying stages are Visa Processing and everything after it in the
        // pipeline (Student Arrival & Enrollment, Partner Commission Invoicing, ...),
        // not just an exact match on "Visa Processing".
        const stagesRes = await api.get("/applications/stages", { headers });
        const stages: { name: string; code: string; order_index: number }[] = stagesRes.data ?? [];
        const visaProcessingStage = stages.find((s) => s.code === QUALIFYING_STAGE_CODE);
        const qualifyingStageNames = new Set(
          visaProcessingStage
            ? stages
                .filter((s) => s.order_index >= visaProcessingStage.order_index)
                .map((s) => s.name)
            : []
        );

        let offset = 0;
        let total = Infinity;
        let count = 0;

        while (offset < total) {
          const res = await api.get(`/partners/${partnerId}/applications`, {
            headers,
            params: { limit: PAGE_SIZE, offset },
          });
          total = res.data?.total ?? 0;
          const items: { stage: string }[] = res.data?.items ?? [];
          count += items.filter((app) => qualifyingStageNames.has(app.stage)).length;
          offset += PAGE_SIZE;
          if (items.length === 0) break;
        }

        setVisaProcessingCount(count);
        setHasAccess(count > 0);
      } catch {
        // silently fail — page stays restricted
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  return { hasAccess, loading, visaProcessingCount };
}
