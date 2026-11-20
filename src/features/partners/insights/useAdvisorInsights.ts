"use client";

import { useCallback, useEffect, useState } from "react";
import api from "lib/useApi";
import { partnersApi } from "features/partners/services";
import { completeCollection } from "features/overview/model/dashboardData";
import { parseApiError } from "utils/parseApiError";
import { advisorName, type InsightAdvisor, type InsightApplication } from "./insightsModel";

/**
 * Every Advisor plus every application (all statuses), counted on the page.
 * The API has no insights endpoint yet; this reads the two lists page by page.
 */
export function useAdvisorInsights() {
  const [advisors, setAdvisors] = useState<InsightAdvisor[]>([]);
  const [applications, setApplications] = useState<InsightApplication[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    Promise.all([
      completeCollection((page) => partnersApi.list({ page, page_size: 100 })),
      completeCollection((page) => api.get("/admin/applications", { params: { status: "all", limit: 100, offset: (page - 1) * 100 } })),
    ])
      .then(([partners, apps]) => {
        if (cancelled) return;
        setAdvisors(
          partners.map((p: any) => ({
            id: String(p.id),
            name: advisorName(p),
            type: p.type,
            country: p.country ?? null,
            nationality: p.nationality ?? null,
            is_active: !!p.is_active,
            is_verified: !!p.is_verified,
            created_at: p.created_at ?? null,
            last_login: p.last_login ?? null,
          }))
        );
        setApplications(apps.map((a: any) => ({ partner_id: String(a.partner_id), stage: a.stage ?? null })));
        setState("ready");
      })
      .catch((failure) => {
        if (cancelled) return;
        setError(parseApiError(failure, "Advisor insights couldn't load."));
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [round]);

  const retry = useCallback(() => setRound((r) => r + 1), []);
  return { advisors, applications, state, error, retry };
}
