import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

const STAGE_4_NAME = "Student Arrival & Enrollment";
const PAGE_SIZE = 20;

export function usePartnerHasStage4() {
  const [hasStage4, setHasStage4] = useState(false);
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
        let found = false;

        while (!found && offset < total) {
          const res = await api.get(`/partners/${partnerId}/applications`, {
            headers,
            params: { limit: PAGE_SIZE, offset },
          });
          total = res.data?.total ?? 0;
          const items: { stage: string }[] = res.data?.items ?? [];

          if (items.some((app) => app.stage === STAGE_4_NAME)) {
            found = true;
            break;
          }

          offset += PAGE_SIZE;
        }

        setHasStage4(found);
      } catch {
        // silently fail — page stays hidden
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  return { hasStage4, loading };
}
