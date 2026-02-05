import type { GenreId } from "./genreTypes";

export const genreSystems: Record<GenreId, string[]> = {
  sports: ["physics", "collision", "score", "timer"],
  racing: ["physics", "lap", "collision", "cameraFollow"],
  platformer: ["gravity", "collision", "jump", "cameraFollow"],
  puzzle: ["grid", "interaction", "winCondition"],
  shooter: ["physics", "collision", "projectiles", "health"],
  strategy: ["turns", "selection", "ai"],
  party: ["input", "score", "chaos"],
  simulation: ["time", "economy", "agents"],
  rpg: ["stats", "dialogue", "quests", "inventory"],
  rhythm: ["timeline", "inputTiming", "score"],
  educational: ["progress", "feedback", "validation"],
  idle: ["time", "automation", "increment"],
};
