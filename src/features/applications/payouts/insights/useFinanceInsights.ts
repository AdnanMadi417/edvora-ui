"use client";

import { useCallback, useEffect, useState } from "react";
import { completeCollection } from "features/overview/model/dashboardData";
import { parseApiError } from "utils/parseApiError";
import { commissionsApi } from "../services";
import type { CommissionQueueItem } from "../types";

/**
 * Every row of the commission queue, settled ones included, for the insights.
 * The API has no finance summary endpoint; this reads the queue page by page
 * (100 per page, its maximum) and the page counts it.
 */
export function useFinanceInsights() {
  const [items, setItems] = useState<CommissionQueueItem[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    completeCollection((page) => commissionsApi.list({ page, page_size: 100 }))
      .then((rows) => {
        if (cancelled) return;
        setItems(rows as CommissionQueueItem[]);
        setState("ready");
      })
      .catch((failure) => {
        if (cancelled) return;
        setError(parseApiError(failure, "Finance insights couldn't load."));
        setState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [round]);

  const retry = useCallback(() => setRound((r) => r + 1), []);
  return { items, state, error, retry };
}
