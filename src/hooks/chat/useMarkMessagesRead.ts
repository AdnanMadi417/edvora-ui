import { useCallback } from "react";
import api from "lib/useApi";
import { useMe } from "../useMe";
import type { ChatMessage } from "./useChatMessages";

interface UseMarkMessagesReadOptions {
  applicationId: string;
}

export function useMarkMessagesRead({
                                      applicationId,
                                    }: UseMarkMessagesReadOptions) {
  const { user } = useMe();

  const markMessagesRead = useCallback(
    async (messages: ChatMessage[]) => {
      if (!user) return;

      const unreadIncomingMessages = messages.filter(
        (message) =>
          message.sender_id !== user.id && message.read_at === null
      );

      if (unreadIncomingMessages.length === 0) return;

      try {
        await Promise.all(
          unreadIncomingMessages.map((message) =>
            api.put(
              `/applications/${applicationId}/messages/${message.id}/read`
            )
          )
        );
      } catch (err) {
        // Silent failure is OK here; unread-count will self-heal later
        console.error("Failed to mark messages as read", err);
      }
    },
    [applicationId, user]
  );

  return {
    markMessagesRead,
  };
}
