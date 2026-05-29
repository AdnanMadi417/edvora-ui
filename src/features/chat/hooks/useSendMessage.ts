import { useState, useCallback } from "react";
import api from "lib/useApi";
import type { ChatMessage } from "../types";

interface UseSendMessageOptions {
  applicationId: string;
}

export function useSendMessage({ applicationId }: UseSendMessageOptions) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (messageText: string): Promise<ChatMessage | null> => {
      if (!messageText.trim()) return null;

      setSending(true);
      setError(null);

      try {
        const response = await api.post<ChatMessage>(
          `/applications/${applicationId}/messages`,
          { message_text: messageText }
        );
        return response.data;
      } catch (err: any) {
        setError(err.message || "Failed to send message");
        return null;
      } finally {
        setSending(false);
      }
    },
    [applicationId]
  );

  return { sendMessage, sending, error };
}
