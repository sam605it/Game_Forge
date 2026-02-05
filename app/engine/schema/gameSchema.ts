export const GENRES = [
  "sports",
  "racing",
  "platformer",
  "puzzle",
  "shooter",
  "strategy",
  "party",
  "simulation",
  "rpg",
  "rhythm",
  "educational",
  "idle",
] as const;

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export type GameState = {
  genre: (typeof GENRES)[number];
  themeId: string;
  playerIcon: string;
  difficulty?: (typeof DIFFICULTIES)[number];
  description?: string;
  modifiers?: {
    gravity?: number;
    friction?: number;
    speed?: number;
  };
};

export function isGameState(raw: unknown): raw is GameState {
  if (!raw || typeof raw !== "object") return false;
  const candidate = raw as Record<string, unknown>;

  return (
    typeof candidate.genre === "string" &&
    GENRES.includes(candidate.genre as (typeof GENRES)[number]) &&
    typeof candidate.themeId === "string" &&
    typeof candidate.playerIcon === "string" &&
    (candidate.difficulty === undefined ||
      DIFFICULTIES.includes(candidate.difficulty as (typeof DIFFICULTIES)[number]))
  );
}
