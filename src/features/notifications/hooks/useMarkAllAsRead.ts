import { useState } from "react";
import { notificationsApi } from "../services";

export function useMarkAllAsRead() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const markAllAsRead = async () => {
    setLoading(true);
    setError(null);

    try {
      await notificationsApi.markAllAsRead();
    } catch (err: any) {
      setError(err.message || "Failed to mark all notifications as read");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { markAllAsRead, loading, error };
}
