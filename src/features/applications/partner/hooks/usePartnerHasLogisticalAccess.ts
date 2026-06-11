import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

const QUALIFYING_STAGES = [
  "Student Arrival & Enrollment",
  "Partner Commission Invoicing",
];

const PAGE_SIZE = 20;

export function usePartnerHasLogisticalAccess() {
  const [hasAccess, setHasAccess] = useState(false);
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

          if (items.some((app) => QUALIFYING_STAGES.includes(app.stage))) {
            found = true;
            break;
          }

          offset += PAGE_SIZE;
        }

        setHasAccess(found);
      } catch {
        // silently fail — page stays restricted
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  return { hasAccess, loading };
}
