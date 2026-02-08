export const CATEGORIES = [
  "sports",
  "racing",
  "action",
  "shooter",
  "platformer",
  "puzzle",
  "strategy",
  "arcade",
  "simulation",
  "rhythm_music",
  "word_trivia",
  "party_social",
] as const;

export type Category = (typeof CATEGORIES)[number];
