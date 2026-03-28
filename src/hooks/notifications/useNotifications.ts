import { useState, useEffect } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export type Notifications = {
  id: string;
  type: string;
  title: string;
  body: string;
  application_id: string;
  data: {
    snippet: string;
    sender_id: string;
    message_id: string;
    sender_name: string;
    application_id: string;
  };
  created_at: string;
  read_at: string | null;
};

export function useAllNotifications() {
  const [notifications, setNotifications] = useState<Notifications[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = Cookies.get("token");

        const res = await api.get("/me/notifications", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        setNotifications(res.data);
      } catch (err) {
        setError("Failed to fetch account managers");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return { notifications, loading, error };
}