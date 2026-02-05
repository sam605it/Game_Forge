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
      return <SportsRenderer />;

    case "racing":
      return <RacingRenderer />;

    case "platformer":
      return <PlatformerRenderer />;

    case "puzzle":
    case "educational":
      return <PuzzleRenderer />;

    case "shooter":
      return <ShooterRenderer />;

    case "strategy":
      return <StrategyRenderer />;

    case "party":
      return <PartyRenderer />;

    case "simulation":
      return <SimulationRenderer />;

    case "rpg":
      return <RPGRenderer />;

    case "rhythm":
      return <RhythmRenderer />;

    case "idle":
      return <IdleRenderer />;

    default:
      return <div className="p-4">No renderer for genre: {gameState.genre}</div>;
  }
}
