import { useState, useEffect, useCallback } from "react";
import { notificationsApi } from "../services";
import type { Notification, ReadStatus } from "../types";

interface UseAllNotificationsOptions {
  readStatus?: ReadStatus;
  page?: number;
  pageSize?: number;
  /** ISO datetime — only return notifications created after this (for polling). */
  since?: string;
}

export function useAllNotifications({
  readStatus = "all",
  page = 1,
  pageSize = 20,
  since,
}: UseAllNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await notificationsApi.list({
        read_status: readStatus,
        page,
        page_size: pageSize,
        ...(since ? { since } : {}),
      });
      setNotifications(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    } catch (err) {
      setError("Failed to fetch notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [readStatus, page, pageSize, since]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, total, page, pageSize, loading, error, refetch: fetchNotifications };
}
