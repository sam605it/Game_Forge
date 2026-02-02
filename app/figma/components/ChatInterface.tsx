import React from "react";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type ChatInterfaceProps = {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  isDarkMode: boolean;
};

export function ChatInterface({
  messages,
  onSendMessage,
  isTyping,
  isDarkMode,
}: ChatInterfaceProps) {
  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex-1 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`text-sm ${
              msg.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block px-3 py-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-white"
              }`}
            >
              {msg.content}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="text-xs text-slate-400">Typing…</div>
        )}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const input = e.currentTarget.message as HTMLInputElement;
          if (input.value.trim()) {
            onSendMessage(input.value);
            input.value = "";
          }
        }}
      >
        <input
          name="message"
          placeholder="Type a message…"
          className="flex-1 rounded px-3 py-2 bg-slate-800 text-white text-sm"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
        >
          Send
        </button>
      </form>
    </div>
  );
}
