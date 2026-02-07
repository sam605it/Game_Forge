"use client";

import { useState } from "react";
import { ChatMessage } from "@/app/types";

interface Props {
  messages: ChatMessage[];
  isTyping?: boolean;
  onSendMessage: (text: string) => void;
}

export default function ChatInterface({
  messages = [],
  isTyping = false,
  onSendMessage,
}: Props) {
  const [draft, setDraft] = useState("");

  function handleSend() {
    if (!draft.trim()) return;
    onSendMessage(draft.trim());
    setDraft("");
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className="text-sm">
            <b className="capitalize">{m.role}:</b> {m.content}
          </div>
        ))}

        {isTyping && (
          <div className="text-xs opacity-50">GameGenie is thinking…</div>
        )}
      </div>

      <div className="border-t p-3">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <input
            className="w-full bg-transparent text-sm text-black outline-none"
            placeholder=""
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                handleSend();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            className="rounded-full bg-slate-200 px-3 py-1.5 text-sm text-slate-700"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
