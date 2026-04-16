import { useState, useCallback, useEffect } from "react";
import api from "lib/useApi";

interface UseUnreadCountOptions {
  enabled?: boolean;
  pollIntervalMs?: number;
}

export function useUnreadCount({
  enabled = true,
  pollIntervalMs,
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
        `/me/notifications/unread-count`
      );

      setUnreadCount(response.data.count);
    } catch (err: any) {
      setError(err.message || "Failed to fetch unread count");
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  useEffect(() => {
    if (!enabled || !pollIntervalMs) return;
    const interval = setInterval(fetchUnreadCount, pollIntervalMs);
    return () => clearInterval(interval);
  }, [enabled, fetchUnreadCount, pollIntervalMs]);

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount,
  };
}
