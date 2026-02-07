"use client";

import { useState } from "react";
import ChatInterface from "./components/ChatInterface";
import GamePreview from "@/app/components/GamePreview";
import type { ChatMessage } from "@/app/types";
import type { GameSpec } from "@/lib/gamespec/schema";

export default function App() {
  const [gameSpec, setGameSpec] = useState<GameSpec | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const createMessageId = () =>
    globalThis.crypto?.randomUUID?.() ?? `msg-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  async function handleSend(text: string) {
    setIsTyping(true);

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: text }),
      });

      if (!response.ok) {
        throw new Error(`Game API failed: ${response.status}`);
      }

      const spec = (await response.json()) as GameSpec;
      setGameSpec(spec);
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "assistant",
          content: `Generated ${spec.template} with ${spec.theme.skin} theme.`,
        },
      ]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          id: createMessageId(),
          role: "assistant",
          content: "Sorry, I could not generate that game.",
        },
      ]);
    }

    setIsTyping(false);
  }

  return (
    <div className="flex h-full w-full gap-6 text-black">
      <aside className="flex w-[320px] flex-col rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">Chatbox</div>
            <div className="text-xs text-slate-500">Prompt-driven generator</div>
          </div>
          <span className="text-slate-400">▾</span>
        </div>
        <div className="flex-1">
          <ChatInterface
            messages={messages}
            isTyping={isTyping}
            onSendMessage={handleSend}
          />
        </div>
      </aside>

      <section className="flex flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <GamePreview spec={gameSpec} />
      </section>
    </div>
  );
}
