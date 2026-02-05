import { z } from "zod";

export const GenreEnum = z.enum([
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
]);

export const DifficultyEnum = z.enum([
  "easy",
  "medium",
  "hard",
]);

export const GameSchema = z.object({
  genre: GenreEnum,

  themeId: z.string(),

  playerIcon: z.string(),

  difficulty: DifficultyEnum.optional().default("easy"),

  description: z.string().optional(),

  // Optional modifiers the AI may include
  modifiers: z.object({
    gravity: z.number().optional(),
    friction: z.number().optional(),
    speed: z.number().optional(),
  }).optional(),
});

export type GameState = z.infer<typeof GameSchema>;
