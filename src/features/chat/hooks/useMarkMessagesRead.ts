import { useCallback } from "react";
import api from "lib/useApi";
import { useMe } from "hooks/useMe";
import type { ChatMessage } from "../types";

interface UseMarkMessagesReadOptions {
  applicationId: string;
}

export function useMarkMessagesRead({ applicationId }: UseMarkMessagesReadOptions) {
  const { user } = useMe();

  const markMessagesRead = useCallback(
    async (messages: ChatMessage[]): Promise<string[]> => {
      if (!user) return [];

      const unread = messages.filter(
        (m) => m.sender_id !== user.id && m.read_at === null
      );

      if (unread.length === 0) return [];

      const markedIds: string[] = [];

      await Promise.all(
        unread.map(async (m) => {
          try {
            await api.put(`/applications/${applicationId}/messages/${m.id}/read`);
            markedIds.push(m.id);
          } catch (err) {
            console.error("Failed to mark message as read", m.id, err);
          }
        })
      );

      return markedIds;
    },
    [applicationId, user]
  );

  return { markMessagesRead };
}
