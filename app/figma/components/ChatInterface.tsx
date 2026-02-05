"use client";

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
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
        <input
          className="w-full rounded border px-3 py-2 text-black"
          placeholder="Describe a game or action…"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.currentTarget.value.trim()) {
              onSendMessage(e.currentTarget.value);
              e.currentTarget.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}
