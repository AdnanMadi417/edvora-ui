import { useState, useEffect, useCallback } from "react";
import { universityApi } from "../../services";
import type { University } from "../../types";

const PAGE_SIZE = 100; // API maximum

interface UseUniversitiesParams {
  includeInactive?: boolean;
  isPublic?: boolean;
  hasLanguageCenter?: boolean;
  isHidden?: boolean;
}

export function useUniversities({ includeInactive = false, isPublic, hasLanguageCenter, isHidden }: UseUniversitiesParams = {}) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseParams: Record<string, unknown> = { page: 1, page_size: PAGE_SIZE };
      if (includeInactive) baseParams.include_inactive_universities = true;
      if (isPublic !== undefined) baseParams.is_public = isPublic;
      if (hasLanguageCenter !== undefined) baseParams.has_language_center = hasLanguageCenter;
      if (isHidden !== undefined) baseParams.is_hidden = isHidden;

      const first = await universityApi.universities.list(baseParams);
      const { items: firstItems = [], total = 0 } = first.data ?? {};

      const totalPages = Math.ceil(total / PAGE_SIZE);

      if (totalPages <= 1) {
        setUniversities(firstItems);
        return;
      }

      // Only reached if total > 100 — fetch remaining pages concurrently
      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          universityApi.universities.list({ ...baseParams, page: i + 2 })
        )
      );

      setUniversities([
        ...firstItems,
        ...rest.flatMap((r) => r.data?.items ?? []),
      ]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch universities");
    } finally {
      setLoading(false);
    }
  }, [includeInactive, isPublic, hasLanguageCenter, isHidden]);

  useEffect(() => { fetch(); }, [fetch]);

  return { universities, loading, error, refetch: fetch };
}
