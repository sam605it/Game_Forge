export type Level = {
  world: {
    width: number;
    height: number;
  };
  entities: any[];
};

import { generateSportsLevel } from "./generators/sports";
import { generatePlatformerLevel } from "./generators/platformer";
import { generateRacingLevel } from "./generators/racing";
import { generatePuzzleLevel } from "./generators/puzzle";
import { generateShooterLevel } from "./generators/shooter";
import { generateStrategyLevel } from "./generators/strategy";
import { generatePartyLevel } from "./generators/party";
import { generateSimulationLevel } from "./generators/simulation";
import { generateRPGLevel } from "./generators/rpg";
import { generateRhythmLevel } from "./generators/rhythm";
import { generateEducationalLevel } from "./generators/educational";
import { generateIdleLevel } from "./generators/idle";

export const LEVEL_GENERATORS: Record<string, Function> = {
  sports: generateSportsLevel,
  platformer: generatePlatformerLevel,
  racing: generateRacingLevel,
  puzzle: generatePuzzleLevel,
  shooter: generateShooterLevel,
  strategy: generateStrategyLevel,
  party: generatePartyLevel,
  simulation: generateSimulationLevel,
  rpg: generateRPGLevel,
  rhythm: generateRhythmLevel,
  educational: generateEducationalLevel,
  idle: generateIdleLevel,
};
