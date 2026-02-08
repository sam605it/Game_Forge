import type { Category, GameSpecV1 } from "../types";

import sportsMiniGolf from "./bunny-mini-golf.v1.json";
import sportsBowling from "./tiger-bowling.v1.json";
import racing from "./racing-desert-kart.v1.json";
import shooter from "./shooter-space-survival.v1.json";
import platforming from "./platforming-forest-jump.v1.json";
import puzzle from "./puzzle-push-crates.v1.json";
import rhythm from "./rhythm-beat-tapper.v1.json";
import trivia from "./word-trivia-animals.v1.json";
import strategy from "./strategy-tower-defense.v1.json";
import simulation from "./simulation-sandbox-blocks.v1.json";
import arcade from "./arcade-coin-chase.v1.json";
import action from "./action-dodge-meteors.v1.json";
import party from "./party-social-tag-round.v1.json";

export const CATEGORY_EXAMPLES: Record<Category, GameSpecV1> = {
  sports: sportsMiniGolf as unknown as GameSpecV1,
  racing: racing as unknown as GameSpecV1,
  shooter: shooter as unknown as GameSpecV1,
  platformer: platforming as unknown as GameSpecV1,
  puzzle: puzzle as unknown as GameSpecV1,
  rhythm_music: rhythm as unknown as GameSpecV1,
  word_trivia: trivia as unknown as GameSpecV1,
  strategy: strategy as unknown as GameSpecV1,
  simulation: simulation as unknown as GameSpecV1,
  arcade: arcade as unknown as GameSpecV1,
  action: action as unknown as GameSpecV1,
  party_social: party as unknown as GameSpecV1,
};

export const GOLDEN_EXAMPLES: Record<string, GameSpecV1> = {
  sportsMiniGolf: sportsMiniGolf as unknown as GameSpecV1,
  sportsBowling: sportsBowling as unknown as GameSpecV1,
  racing: racing as unknown as GameSpecV1,
  shooter: shooter as unknown as GameSpecV1,
  platformer: platforming as unknown as GameSpecV1,
  puzzle: puzzle as unknown as GameSpecV1,
  rhythm: rhythm as unknown as GameSpecV1,
  trivia: trivia as unknown as GameSpecV1,
  strategy: strategy as unknown as GameSpecV1,
  simulation: simulation as unknown as GameSpecV1,
  arcade: arcade as unknown as GameSpecV1,
  action: action as unknown as GameSpecV1,
  party: party as unknown as GameSpecV1,
};
