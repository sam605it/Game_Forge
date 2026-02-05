"use client";

import { useState } from "react";
import ChatInterface from "./components/ChatInterface";
import GameCanvas from "../engine/GameCanvas";
import { getIconFromPrompt } from "@/app/lib/getIconFromPrompt";
import type { ChatMessage } from "@/app/types";

export default function App() {
  const [gameState, setGameState] = useState<any>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  async function handleSend(text: string) {
    setIsTyping(true);

    const iconKey = getIconFromPrompt(text);
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };

    const assistantMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: "Game world updated.",
    };

    setMessages((prev) => [...prev, userMessage, assistantMessage]);

    const nextState = {
      title: text,
      playerIconKey: iconKey,
      world: { width: 800, height: 400 },
      description: `${iconKey} ${text}`,
      availableActions: ["Swing", "Aim", "Quit"],
    };

    setGameState(nextState);
    setIsTyping(false);
  }

  return (
    <div className="h-screen flex bg-white text-black">
      <div className="w-[380px] border-r">
        <ChatInterface
          messages={messages}
          isTyping={isTyping}
          onSendMessage={handleSend}
        />
      </div>

      <div className="flex-1 flex items-center justify-center">
        <GameCanvas gameState={gameState} />
      </div>
    </div>
  );
}
