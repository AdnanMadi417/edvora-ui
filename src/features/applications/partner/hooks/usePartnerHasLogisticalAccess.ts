import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";
import { useMe } from "hooks/useMe";

const QUALIFYING_STAGE_CODE = "VISA_PROCESSING";
const PAGE_SIZE = 20;

function readStoredPartnerId(): string | null {
  try {
    return localStorage.getItem("partnerId");
  } catch {
    return null;
  }
}

export function usePartnerHasLogisticalAccess() {
  const { user, loading: userLoading } = useMe();
  // Same precedence as sign-in (useSignIn.ts): the partner record's id, else the user id.
  const sessionPartnerId = user ? user.partner_id ?? user.id ?? null : null;
  const [hasAccess, setHasAccess] = useState(false);
  const [visaProcessingCount, setVisaProcessingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      // The partner id comes from localStorage (set at sign-in) or the shared
      // session, never from a fresh /auth/me call here.
      const storedPartnerId = readStoredPartnerId();
      const partnerId = storedPartnerId ?? sessionPartnerId;
      if (!partnerId) {
        // Session still loading: wait for the next run. Otherwise there is
        // no partner to check and the page stays restricted.
        if (!userLoading) setLoading(false);
        return;
      }
      if (!storedPartnerId) {
        try {
          localStorage.setItem("partnerId", partnerId);
        } catch {
          // ignore
        }
      }

      try {
        const token = Cookies.get("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

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

        if (cancelled) return;
        setVisaProcessingCount(count);
        setHasAccess(count > 0);
      } catch {
        // silently fail — page stays restricted
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    check();
    return () => {
      cancelled = true;
    };
  }, [sessionPartnerId, userLoading]);

  return { hasAccess, loading, visaProcessingCount };
}
