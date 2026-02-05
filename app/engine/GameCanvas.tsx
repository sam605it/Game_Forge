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

  return (
    <div className="flex flex-col items-center gap-4">
      {/* UI TEXT */}
      <div className="max-w-xl text-center space-y-4">
        <h1 className="text-2xl font-bold">Game World</h1>

        <p className="text-lg whitespace-pre-line">
          {gameState.description}
        </p>

        <div className="flex gap-2 justify-center">
          {gameState.availableActions?.map((a: string) => (
            <button
              key={a}
              className="px-4 py-2 rounded bg-black text-white"
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      {/* GAME RENDERER */}
      <GameRenderer gameState={gameState} />
    </div>
  );
}
