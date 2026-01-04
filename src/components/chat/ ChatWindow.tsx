"use client";

import { useEffect } from "react";
import { useChatMessages } from "hooks/chat/useChatMessages";
import { useSendMessage } from "hooks/chat/useSendMessage";
import { useMarkMessagesRead } from "hooks/chat/useMarkMessagesRead";
import { useChatPolling } from "hooks/chat/useChatPolling";
import { useMe } from "hooks/useMe";

import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

interface ChatWindowProps {
  applicationId: string;
}

export default function ChatWindow({ applicationId }: ChatWindowProps) {
  const { user } = useMe();

  const {
    messages,
    loading,
    error,
    since,
    appendMessages,
  } = useChatMessages(applicationId);

  const { sendMessage, sending } = useSendMessage(applicationId);
  const { markAsRead } = useMarkMessagesRead(applicationId);

  // Polling for new messages
  useChatPolling({
    applicationId,
    since,
    onNewMessages: (newMessages) => {
      appendMessages(newMessages);
    },
  });

  // Mark messages as read when messages change
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <MessageList
        messages={messages}
        currentUserId={user?.id}
        loading={loading}
        error={error}
      />

      <ChatInput
        onSend={sendMessage}
        sending={sending}
      />
    </div>
  );
}
