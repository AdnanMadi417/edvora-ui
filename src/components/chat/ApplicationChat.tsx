import { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  User,
  Download,
  CheckCheck,
  Check,
  X,
  CornerUpRight,
  MoreHorizontal,
  Copy,
  Trash2,
} from "lucide-react";
import { conversations } from "components/data/applications";

import ChatWindow from "../chat/ChatInput";

export default function EnhancedReplyChat() {
  const [messages, setMessages] = useState<Message[]>(conversations);

  const [newMessage, setNewMessage] = useState("");
  const [viewAs, setViewAs] = useState("partner");
  const [replyTo, setReplyTo] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);
  const messageRefs = useRef({});

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const newMsg = {
      id: messages.length + 1,
      sender: viewAs,
      senderName: viewAs === "partner" ? "John Chen" : "Sarah Lee",
      text: newMessage,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      read: false,
      replyTo: replyTo
        ? {
            id: replyTo.id,
            text: replyTo.text,
            senderName: replyTo.senderName,
          }
        : null,
    };
    setMessages([...messages, newMsg]);
    setNewMessage("");
    setReplyTo(null);
  };

  const handleCopy = (text, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
    setOpenMenuId(null);
  };

  const handleDelete = (id) => {
    setMessages(messages.filter((msg) => msg.id !== id));
    setOpenMenuId(null);
  };

  const scrollToMessage = (msgId) => {
    const element = messageRefs.current[msgId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.style.backgroundColor = "rgba(59, 130, 246, 0.1)";
      setTimeout(() => {
        element.style.backgroundColor = "transparent";
      }, 1500);
    }
  };

  return (
    <div className="flex h-[450px] flex-col overflow-hidden bg-card">
      <header className="bg-blue-600 px-3 py-2 text-text-special ">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card shadow-sm">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div>
              <h2 className="text-p2 font-semibold">
                {viewAs === "partner" ? "Sarah Lee" : "John Chen"}
              </h2>
              <p className="flex items-center gap-1.5 text-caption text-blue-100">
                Active now
              </p>
            </div>
          </div>

          <div className="flex gap-1 rounded-full bg-blue-700/50 px-1.5 py-1.5 shadow-inner backdrop-blur-sm">
            <button
              onClick={() => setViewAs("partner")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                viewAs === "partner"
                  ? "scale-105 bg-card text-blue-600 shadow-sm"
                  : "text-text-special hover:bg-blue-600/70"
              }`}
            >
              Partner
            </button>
            <button
              onClick={() => setViewAs("manager")}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 ${
                viewAs === "manager"
                  ? "scale-105 bg-card text-blue-600 shadow-sm"
                  : "text-text-special hover:bg-blue-600/70"
              }`}
            >
              Manager
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center content-center text-center text-gray-500 m-auto">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Send className="h-6 w-6 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-700">No messages yet</p>
            <p className="text-xs text-gray-400">
              Start the conversation by sending a message.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg) => {
              const isOwn = msg.sender === viewAs;

              return (
                <div
                  key={msg.id}
                  ref={(el) => (messageRefs.current[msg.id] = el)}
                  style={{
                    animation: `fadeIn 0.3s ease-out`,
                    transition: "background-color 1.5s ease-out",
                  }}
                  className={`group relative flex ${
                    isOwn ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[75%] rounded-md border px-3 py-2 text-text-primary ${
                      isOwn
                        ? "rounded-br-none border-none bg-gray-200/50 text-caption"
                        : "rounded-bl-none border-default bg-card"
                    }`}
                  >
                    <button
                      onClick={() =>
                        setOpenMenuId(openMenuId === msg.id ? null : msg.id)
                      }
                      className={`absolute -top-2 ${
                        isOwn ? "-left-8" : "-right-8"
                      } hidden rounded-full bg-gray-100 p-1 outline-0 transition hover:bg-gray-200 group-hover:block`}
                    >
                      <MoreHorizontal className="h-4 w-4 text-text-muted" />
                    </button>

                    {openMenuId === msg.id && (
                      <div
                        className={`absolute z-20 ${
                          isOwn ? "left-1" : "right-0"
                        } -top-2 w-36 rounded-md border border-default bg-card before:absolute before:top-3 before:h-0 before:w-0 before:border-y-8 before:border-y-transparent ${
                          isOwn
                            ? "before:right-full before:border-r-8 before:border-r-white"
                            : "before:left-full before:border-l-8 before:border-l-white"
                        }`}
                      >
                        <button
                          onClick={() => {
                            setReplyTo(msg);
                            setOpenMenuId(null);
                          }}
                          aria-label="Reply to message"
                          className="mx-auto my-1 flex w-[90%] items-center gap-2 rounded-md px-3 py-2 text-caption text-gray-700 transition-all duration-150 hover:bg-gray-100"
                        >
                          <CornerUpRight className="h-4 w-4 text-blue-500" />
                          Reply
                        </button>

                        <button
                          onClick={() => handleCopy(msg.text, msg.id)}
                          aria-label="Copy message"
                          className="mx-auto my-1 flex w-[90%] items-center gap-2 rounded-md px-3 py-2 text-caption text-gray-700 transition-all duration-150 hover:bg-gray-100"
                        >
                          <Copy className="h-4 w-4 text-gray-400" />
                          {copiedId === msg.id ? "Copied!" : "Copy"}
                        </button>

                        {isOwn && (
                          <button
                            onClick={() => handleDelete(msg.id)}
                            aria-label="Delete message"
                            className="mx-auto my-1 flex w-[90%] items-center gap-2 rounded-md px-3 py-2 text-caption text-red-600 transition-all duration-150 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    )}

                    {!isOwn && (
                      <p className="mb-1 text-[11px] font-semibold text-text-muted">
                        {msg.senderName}
                      </p>
                    )}

                    {msg.replyTo && (
                      <div
                        onClick={() => scrollToMessage(msg.replyTo.id)}
                        className={`mb-2 cursor-pointer rounded-md border-l-2 px-2 py-1 text-xs transition-all ${
                          isOwn
                            ? "border-blue-600 bg-gray-200/70 text-text-primary"
                            : "border-blue-600 bg-gray-200/50 text-text-secondary"
                        }`}
                      >
                    <span className="font-medium">
                      {msg.replyTo.senderName}:{" "}
                    </span>
                        <span className="italic">
                      {msg.replyTo.text.length > 60
                        ? msg.replyTo.text.slice(0, 60) + "..."
                        : msg.replyTo.text}
                    </span>
                      </div>
                    )}

                    <p className="text-caption leading-relaxed">{msg.text}</p>

                    {msg.file && (
                      <div
                        className={`mt-2 flex items-center gap-2 rounded-md p-2 text-caption ${
                          isOwn ? "bg-gray-200/70" : "bg-gray-200/70"
                        }`}
                      >
                        <Paperclip className="h-4 w-4" />
                        <div className="flex-1">
                          <p className="font-medium">{msg.file.name}</p>
                          <p className="opacity-70">{msg.file.size}</p>
                        </div>
                        <Download className="h-4 w-4 cursor-pointer hover:opacity-70" />
                      </div>
                    )}

                    <div className="mt-1 flex items-center justify-end gap-1 text-[11px] opacity-70">
                      <span>{msg.time}</span>
                      {isOwn &&
                        (msg.read ? (
                          <CheckCheck className="h-4 w-4" />
                        ) : (
                          <Check className="h-4 w-4" />
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </main>

      {replyTo && (
        <div className="flex items-center justify-between border-t border-default bg-card px-3 py-2 text-caption text-text-primary">
          <div className="flex flex-1 items-center gap-2 truncate">
            <CornerUpRight className="h-4 w-4 flex-shrink-0 text-blue-500" />
            <div className="min-w-0 flex-1">
              <span className="font-semibold">{replyTo.senderName}: </span>
              <span className="truncate">
                {replyTo.text.length > 60
                  ? replyTo.text.slice(0, 60) + "..."
                  : replyTo.text}
              </span>
            </div>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="ml-2 flex-shrink-0"
          >
            <X className="h-4 w-4 text-text-secondary hover:text-text-muted" />
          </button>
        </div>
      )}


      <footer className="border-t border-default bg-card p-3">
        <div className="flex items-center gap-2">
          <button className="rounded-full p-2 transition hover:bg-gray-100">
            <Paperclip className="h-5 w-5 text-text-muted" />
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            className="flex-1 rounded-full border border-default px-3 py-1.5 text-caption focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <button
            onClick={handleSend}
            className="rounded-full bg-blue-600 p-2 text-text-special transition hover:bg-blue-700"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </footer>


      <div className="h-full">
        <ChatWindow applicationId={applicationId} />
      </div>


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
      `}</style>
    </div>
  );
}
