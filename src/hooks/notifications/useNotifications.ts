import { useState, useEffect, useCallback } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type Notifications = {
  id: string;
  type: string;
  title: string;
  body: string;
  application_id: string;
  data: {
    // message notifications
    snippet?: string;
    sender_id?: string;
    message_id?: string;
    sender_name?: string;
    // stage-change notifications
    actor_id?: string;
    actor_name?: string;
    actor_role?: string;
    to_stage_id?: string;
    to_status_id?: string;
    from_stage_id?: string;
    to_stage_code?: string;
    application_id?: string;
    from_status_id?: string;
    to_status_code?: string;
    from_stage_code?: string;
    from_status_code?: string;
  };
  created_at: string;
  read_at: string | null;
};

export function useAllNotifications() {
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      const res = await api.get("/me/notifications", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications(res.data?.items ?? res.data ?? []);
    } catch (err) {
      setError("Failed to fetch notifications");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return { notifications, loading, error, refetch: fetchNotifications };
}
