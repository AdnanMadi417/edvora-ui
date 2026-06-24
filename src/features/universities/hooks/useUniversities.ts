import { useState, useEffect } from "react";
import { universityApi } from "../services";
import type { University } from "../types";

const PAGE_SIZE = 100; // API maximum

export function useUniversities() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const first = await universityApi.universities.list({ page: 1, page_size: PAGE_SIZE });
      const { items: firstItems = [], total = 0 } = first.data ?? {};

      const totalPages = Math.ceil(total / PAGE_SIZE);

      if (totalPages <= 1) {
        setUniversities(firstItems);
        return;
      }

      // Only reached if total > 100 — fetch remaining pages concurrently
      const rest = await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, i) =>
          universityApi.universities.list({ page: i + 2, page_size: PAGE_SIZE })
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
  };

  useEffect(() => { fetch(); }, []);

  return { universities, loading, error, refetch: fetch };
}
