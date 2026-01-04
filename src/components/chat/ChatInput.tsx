"use client";

import { useState } from "react";

interface ChatInputProps {
  onSend: (text: string) => Promise<void>;
  sending: boolean;
}

export default function ChatInput({ onSend, sending }: ChatInputProps) {
  const [text, setText] = useState("");

  const handleSend = async () => {
    if (!text.trim()) return;
    await onSend(text);
    setText("");
  };

  return (
    <div className="border-t p-4 flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type a message…"
        className="flex-1 rounded-md border px-3 py-2 text-sm"
      />

      <button
        onClick={handleSend}
        disabled={sending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        Send
      </button>
    </div>
  );
}
