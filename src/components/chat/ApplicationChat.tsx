"use client";

import React, { useEffect, useState, useRef } from "react";
import { useChatMessages } from "hooks/chat/useChatMessages";
import { useSendMessage } from "hooks/chat/useSendMessage";
import { useMarkMessagesRead } from "hooks/chat/useMarkMessagesRead";
import { useChatPolling } from "hooks/chat/useChatPolling";
import { useMe } from "hooks/useMe";
import { useUnreadCount } from "hooks/notifications/useUnreadCount";
import { useAllNotifications } from "hooks/notifications/useNotifications";
import api from "lib/useApi";
import { Send, User } from "lucide-react";
import Loading from "../loading/Loading";
import NoMessagesFound from "../emptyData/NoMessagesFound";

interface AgentPartnerChatProps {
  applicationId: string;
}

export default function AgentPartnerChat({
  applicationId,
}: AgentPartnerChatProps) {
  const { user } = useMe();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const { messages, error, fetchInitialMessages, fetchNewMessages, setMessages } =
    useChatMessages({ applicationId });

  const { sendMessage, sending } = useSendMessage({ applicationId });
  const { markMessagesRead } = useMarkMessagesRead({ applicationId });
  const { refetch: refetchUnreadCount } = useUnreadCount({ enabled: false });
  const { notifications, refetch: refetchNotifications } = useAllNotifications();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchInitialMessages();
      setLoading(false);
    };

    init();
  }, [fetchInitialMessages]);

  useChatPolling({
    enabled: !loading,
    fetchNewMessages,
  });

  useEffect(() => {
    if (messages.length === 0) return;

    markMessagesRead(messages).then(async (markedIds) => {
      if (markedIds.length === 0) return;
      const now = new Date().toISOString();
      setMessages((prev) =>
        prev.map((m) => (markedIds.includes(m.id) ? { ...m, read_at: now } : m))
      );

      // Mark corresponding notifications as read
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
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  if (error) {
    return <div className="p-4 text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="flex h-[70vh] max-h-[600px] min-h-[320px] flex-col bg-card">
      <header className="bg-blue-600 px-3 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm">
            <User className="h-5 w-5 text-blue-600" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold sm:text-base">
              Application
            </h2>
            <p className="text-xs text-blue-100">Active now</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto bg-gray-50 p-3 sm:p-4">
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
                      ? "ml-auto rounded-br-none bg-gray-200/50"
                      : "mr-auto rounded-bl-none border border-default bg-card"
                  }`}
                >
                  {!isMine && (
                    <span className="mb-1 block text-xs font-medium text-slate-500">
                      {msg.sender_name || "Unknown"}{" "}
                    </span>
                  )}

                  <span>{msg.message_text}</span>

                  <span className="mt-1 block text-right text-xs text-slate-600">
                    {formatTime(msg.created_at)}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <div ref={bottomRef} />
      </main>

      <footer className="border-t border-default bg-card p-2 sm:p-3">
        <ChatInput onSend={sendMessage} sending={sending} />
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
          }
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
    await onSend(text);
    setText("");
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
        className="w-full rounded-full border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
      />

      <button
        onClick={handleSend}
        disabled={sending || !text.trim()}
        className="rounded-full bg-blue-600 p-2 text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        <Send className="h-5 w-5" />
      </button>
    </div>
  );
}
