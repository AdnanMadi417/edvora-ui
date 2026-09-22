"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import api from "lib/useApi";
import { getApiErrorCode, parseApiError } from "utils/parseApiError";
import type {
  ApplicationTimelineItem,
  PaginatedApplicationTimeline,
} from "features/applications/shared/applicationTypes";

const PAGE_SIZE = 20;

/**
 * Newest-first activity feed for an application. Loads page 1 on mount and
 * whenever `refreshKey` changes (e.g. the parent's `updated_at`, so the feed
 * catches up after an action); `loadMore` appends the next page.
 */
export function useApplicationTimeline(applicationId?: string, refreshKey?: string) {
  const [items, setItems] = useState<ApplicationTimelineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Guards against a slow earlier response landing after a newer request.
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (pageToLoad: number, append: boolean) => {
      if (!applicationId) return;
      const id = ++requestId.current;
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError(null);
      setErrorCode(null);
      try {
        const res = await api.get<PaginatedApplicationTimeline>(
          `/applications/${applicationId}/timeline`,
          { params: { page: pageToLoad, page_size: PAGE_SIZE } }
        );
        if (id !== requestId.current) return;
        const incoming = res.data?.items ?? [];
        setItems((prev) => (append ? [...prev, ...incoming] : incoming));
        setTotal(res.data?.total ?? 0);
        setPage(pageToLoad);
      } catch (err: unknown) {
        if (id !== requestId.current) return;
        setErrorCode(getApiErrorCode(err));
        setError(parseApiError(err, "Failed to load activity history"));
        if (!append) {
          setItems([]);
          setTotal(0);
        }
      } finally {
        if (id === requestId.current) {
          setLoading(false);
          setLoadingMore(false);
        }
      }
    },
    [applicationId]
  );

  useEffect(() => {
    fetchPage(1, false);
  }, [fetchPage, refreshKey]);

  const loadMore = () => fetchPage(page + 1, true);
  const hasMore = items.length < total;

  return { items, total, loading, loadingMore, error, errorCode, hasMore, loadMore, refetch: () => fetchPage(1, false) };
}
