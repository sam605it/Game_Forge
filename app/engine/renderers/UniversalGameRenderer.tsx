"use client";

import { SportsRenderer } from "./SportsRenderer";
import { RacingRenderer } from "./RacingRenderer";
import { PlatformerRenderer } from "./PlatformerRenderer";
import { PuzzleRenderer } from "./PuzzleRenderer";
import { ShooterRenderer } from "./ShooterRenderer";
import { StrategyRenderer } from "./StrategyRenderer";
import { PartyRenderer } from "./PartyRenderer";
import { SimulationRenderer } from "./SimulationRenderer";
import { RPGRenderer } from "./RPGRenderer";
import { RhythmRenderer } from "./RhythmRenderer";
import { IdleRenderer } from "./IdleRenderer";

export default function UniversalGameRenderer({ gameState }: { gameState: any }) {
  if (!gameState?.genre) {
    return <div className="p-4 text-red-500">Invalid game state</div>;
  }

  switch (gameState.genre) {
    case "sports":
      return <SportsRenderer gameState={gameState} />;

    case "racing":
      return <RacingRenderer gameState={gameState} />;

    case "platformer":
      return <PlatformerRenderer gameState={gameState} />;

    case "puzzle":
    case "educational":
      return <PuzzleRenderer gameState={gameState} />;

    case "shooter":
      return <ShooterRenderer gameState={gameState} />;

    case "strategy":
      return <StrategyRenderer gameState={gameState} />;

    case "party":
      return <PartyRenderer gameState={gameState} />;

    case "simulation":
      return <SimulationRenderer gameState={gameState} />;

    case "rpg":
      return <RPGRenderer gameState={gameState} />;

    case "rhythm":
      return <RhythmRenderer gameState={gameState} />;

    case "idle":
      return <IdleRenderer gameState={gameState} />;

    default:
      return <div className="p-4">No renderer for genre: {gameState.genre}</div>;
  }
}
