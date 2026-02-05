import { generatePlatformerLevel } from "./platformer";
import { generateRacingLevel } from "./racing";
import { generateSportsLevel } from "./sports";

export type Level = {
  world: {
    width: number;
    height: number;
  };
  entities: any[];
};

const fallbackLevel = (): Level => ({
  world: { width: 800, height: 450 },
  entities: [],
});

export const LEVEL_GENERATORS: Record<string, (game: any) => Level> = {
  sports: generateSportsLevel,
  platformer: generatePlatformerLevel,
  racing: generateRacingLevel,
  puzzle: fallbackLevel,
  shooter: fallbackLevel,
  strategy: fallbackLevel,
  party: fallbackLevel,
  simulation: fallbackLevel,
  rpg: fallbackLevel,
  rhythm: fallbackLevel,
  educational: fallbackLevel,
  idle: fallbackLevel,
};
