import { useState, useCallback } from "react";
import api from "lib/useApi";

export interface ChatMessage {
  id: string;
  application_id: string;
  sender_id: string;
  sender_name: string;
  message_text: string;
  created_at: string;
  read_at: string | null;
}

interface UseChatMessagesOptions {
  applicationId: string;
  limit?: number;
}

export function useChatMessages({
                                  applicationId,
                                  limit = 50,
                                }: UseChatMessagesOptions) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastSeenCreatedAt =
    messages.length > 0 ? messages[messages.length - 1].created_at : null;

  /**
   * Initial load (open chat)
   */
  const fetchInitialMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<ChatMessage[]>(
        `/applications/${applicationId}/messages`,
        {
          params: { limit },
        }
      );

      setMessages(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load chat messages");
    } finally {
      setLoading(false);
    }
  }, [applicationId, limit]);

  /**
   * Fetch only new messages (polling)
   */
  const fetchNewMessages = useCallback(async () => {
    if (!lastSeenCreatedAt) return;

    try {
      const response = await api.get<ChatMessage[]>(
        `/applications/${applicationId}/messages`,
        {
          params: {
            since: lastSeenCreatedAt,
            limit,
          },
        }
      );

      if (response.data.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newOnly = response.data.filter((m) => !existingIds.has(m.id));
          return newOnly.length > 0 ? [...prev, ...newOnly] : prev;
        });
      }
    } catch (err) {
      // polling errors should NOT break UI
      console.error("Failed to fetch new messages", err);
    }
  }, [applicationId, lastSeenCreatedAt, limit]);

  return {
    messages,
    loading,
    error,
    fetchInitialMessages,
    fetchNewMessages,
    lastSeenCreatedAt,
    setMessages,
  };
}
