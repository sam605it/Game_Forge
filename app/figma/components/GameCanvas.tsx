"use client";

import GameRenderer from "@/app/components/GameRenderer";

export default function GameCanvas({ gameState }: { gameState: any }) {
  if (!gameState) {
    return (
      <div className="text-gray-400 text-lg">
        Describe a game to begin 🎮
      </div>
    );
  }

  return <GameRenderer gameState={gameState} />;
}

