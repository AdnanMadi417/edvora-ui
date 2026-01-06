import { useState, useCallback, useEffect } from "react";
import api from "lib/useApi";

interface UseUnreadCountOptions {
  applicationId: string;
  enabled?: boolean;
}

export function useUnreadCount({
                                 applicationId,
                                 enabled = true,
                               }: UseUnreadCountOptions) {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await api.get<{ count: number }>(
        `/applications/${applicationId}/unread-count`
      );

      setUnreadCount(response.data.count);
    } catch (err: any) {
      setError(err.message || "Failed to fetch unread count");
    } finally {
      setLoading(false);
    }
  }, [applicationId, enabled]);

  // Auto-fetch when enabled & applicationId changes
  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount,
  };
}
