"use client";

import React, { useEffect, useState, useRef } from "react";
import { useChatMessages } from "features/chat/hooks/useChatMessages";
import { useSendMessage } from "features/chat/hooks/useSendMessage";
import { useMarkMessagesRead } from "features/chat/hooks/useMarkMessagesRead";
import { useChatPolling } from "features/chat/hooks/useChatPolling";
import { useMe } from "hooks/useMe";
import { useUnreadCount, useAllNotifications } from "features/notifications/hooks";
import api from "lib/useApi";
import { Send, User } from "lucide-react";
import Loading from "components/ub/feedback/states/Loading";
import NoMessagesFound from "components/ub/feedback/states/NoMessagesFound";
import { useToast } from "components/ub/feedback/notifications/ToastContext";

interface AgentPartnerChatProps {
  applicationId: string;
}

export default function AgentPartnerChat({
  applicationId,
}: AgentPartnerChatProps) {
  const { user } = useMe();
  const { showToast } = useToast();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { messages, error, fetchInitialMessages, fetchNewMessages, setMessages } =
    useChatMessages({ applicationId });

  const { sendMessage, sending, error: sendError } = useSendMessage({ applicationId });

  const handleSendMessage = async (text: string) => {
    const result = await sendMessage(text);
    if (!result) {
      showToast(sendError || "Failed to send message", "error");
    }
    return result;
  };
  const { markMessagesRead } = useMarkMessagesRead({ applicationId });
  const { refetch: refetchUnreadCount } = useUnreadCount({ enabled: false });
  // Only unread notifications matter here (we're looking for ones to mark
  // read), so pull a large page of just those rather than paging through
  // everything — page_size 100 is the API's max.
  const { notifications, refetch: refetchNotifications } = useAllNotifications({
    readStatus: "unread",
    pageSize: 100,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchInitialMessages();
      setLoading(false);
    };
    init();
  }, [fetchInitialMessages]);

  useChatPolling({ enabled: !loading, fetchNewMessages });

  useEffect(() => {
    if (messages.length === 0) return;

    markMessagesRead(messages).then(async (markedIds) => {
      if (markedIds.length === 0) return;
      const now = new Date().toISOString();
      setMessages((prev) =>
        prev.map((m) => (markedIds.includes(m.id) ? { ...m, read_at: now } : m))
      );

      const relatedNotifications = notifications.filter(
        (n) => n.read_at === null && n.data.message_id && markedIds.includes(n.data.message_id)
      );
      if (relatedNotifications.length > 0) {
        await Promise.allSettled(
          relatedNotifications.map((n) => api.put(`/me/notifications/${n.id}/read`))
        );
        await refetchNotifications();
      }

      refetchUnreadCount();
    });
  }, [messages, markMessagesRead, setMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (date: string) =>
    new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (error) {
    return <div className="p-4 text-sm text-ub-tone-danger-text">{error}</div>;
  }

  return (
    <div className="flex h-[70vh] max-h-[600px] min-h-[320px] flex-col bg-ub-surface">
      <header className="bg-ub-action-primary px-3 py-3 text-ub-action-primary-text">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ub-surface shadow-sm">
            <User className="h-5 w-5 text-ub-text-link" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold sm:text-base">Application</h2>
            <p className="text-xs text-ub-action-primary-text opacity-80">Active now</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-ub-surface-subtle p-3 sm:p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <Loading text="Getting your messages ready..." />
          </div>
        ) : messages.length === 0 ? (
          <NoMessagesFound
            title="No Messages Yet"
            subtitle="You can contact us anytime if you have questions or need assistance."
          />
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => {
              const isMine = msg.sender_id === user?.id;
              return (
                <div
                  key={msg.id}
                  style={{ animation: "fadeIn 0.2s ease-out" }}
                  className={`relative max-w-[75%] break-words rounded-md px-3 py-2 text-sm ${
                    isMine
                      ? "ml-auto rounded-br-none bg-ub-tone-brand-bg text-ub-text-primary"
                      : "mr-auto rounded-bl-none border border-ub-border bg-ub-surface"
                  }`}
                >
                  {!isMine && (
                    <span className="mb-1 block text-xs font-medium text-ub-text-secondary">
                      {msg.sender_name || "Unknown"}
                    </span>
                  )}
                  <span>{msg.message_text}</span>
                  <span className="mt-1 block text-right text-xs text-ub-text-secondary">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      <footer className="border-t border-ub-border bg-ub-surface p-2 sm:p-3">
        <ChatInput onSend={handleSendMessage} sending={sending} />
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; }
        }
      `}</style>
    </div>
  );
}

function ChatInput({
  onSend,
  sending,
}: {
  onSend: (text: string) => Promise<any>;
  sending: boolean;
}) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    const result = await onSend(text);
    if (result) setText("");
  };

  return (
    <div className="flex w-full items-center gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type your message..."
        disabled={sending}
        className="w-full rounded-full border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ub-border-focus disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={sending || !text.trim()}
        className="rounded-full bg-ub-action-primary p-2 text-white transition hover:bg-ub-action-primary-hover disabled:opacity-50"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
