import { useState } from "react";
import api from "lib/useApi";
import Cookies from "js-cookie";

export function useMarkAsRead() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAsRead = async (notificationId: string) => {
    setLoading(true);
    setError(null);

    try {
      const token = Cookies.get("token");
      await api.put(`/me/notifications/${notificationId}/read`, null, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err: any) {
      setError(err.message || "Failed to mark notification as read");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { markAsRead, loading, error };
}
