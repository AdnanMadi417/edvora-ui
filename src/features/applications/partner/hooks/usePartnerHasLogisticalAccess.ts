import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

const QUALIFYING_STAGE = "Visa Processing";
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
          count += items.filter((app) => app.stage === QUALIFYING_STAGE).length;
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
