import { useState, useCallback } from "react";
import api from "lib/useApi";
import type { ChatMessage } from "../types";

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

  const fetchInitialMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get<ChatMessage[]>(
        `/applications/${applicationId}/messages`,
        { params: { limit } }
      );
      setMessages(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to load chat messages");
    } finally {
      setLoading(false);
    }
  }, [applicationId, limit]);

  const fetchNewMessages = useCallback(async () => {
    if (!lastSeenCreatedAt) return;

    try {
      const response = await api.get<ChatMessage[]>(
        `/applications/${applicationId}/messages`,
        { params: { since: lastSeenCreatedAt, limit } }
      );

      if (response.data.length > 0) {
        setMessages((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newOnly = response.data.filter((m) => !existingIds.has(m.id));
          return newOnly.length > 0 ? [...prev, ...newOnly] : prev;
        });
      }
    } catch (err) {
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
