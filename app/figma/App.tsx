"use client";

import { useState } from "react";
import ChatInterface from "./components/ChatInterface";
import GameCanvas from "../engine/GameCanvas";
import { getIconFromPrompt } from "@/app/lib/getIconFromPrompt";

export default function App() {
  const [gameState, setGameState] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);

  async function handleSend(text: string) {
    setIsTyping(true);

    const iconKey = getIconFromPrompt(text);

    const nextState = {
      title: text,
      playerIconKey: iconKey,
      world: { width: 800, height: 400 },

      description: `${iconKey} ${text}`,
      log: [
        ...(gameState?.log ?? []),
        { role: "player", content: text },
        { role: "engine", content: "Game world updated." },
      ],
      availableActions: ["Swing", "Aim", "Quit"],
    };

    setGameState(nextState);
    setIsTyping(false);
  }

  return (
    <div className="h-screen flex bg-white text-black">
      <div className="w-[380px] border-r">
        <ChatInterface
          gameState={gameState}
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
