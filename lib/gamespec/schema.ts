import { z } from "zod";
import type { infer as ZodInfer } from "zod";

export const GameSpecSchema = z.object({
  title: z.string(),
  template: z.enum([
    "mini_golf",
    "pinball",
    "topdown_shooter",
    "platformer",
    "grid_puzzle",
  ]),
  theme: z.object({
    skin: z.string(),
    palette: z.string(),
    mood: z.string().optional(),
    exclude: z.array(z.string()).optional(),
  }),
  world: z.object({
    width: z.number(),
    height: z.number(),
    physics: z.object({
      gravity: z.tuple([z.number(), z.number()]),
      friction: z.number(),
      restitution: z.number(),
    }),
    camera: z.object({
      mode: z.enum(["static", "follow"]),
    }),
  }),
  level: z.object({
    seed: z.string(),
    layout: z.any(),
  }),
  entities: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      pos: z.tuple([z.number(), z.number()]),
      size: z.tuple([z.number(), z.number()]),
      sprite: z.object({
        iconId: z.string(),
      }),
      props: z.any().optional(),
    }),
  ),
  rules: z.object({
    winCondition: z.string(),
    maxStrokes: z.number().optional(),
  }),
  notes: z.array(z.string()).optional(),
  error: z
    .object({
      message: z.string(),
    })
    .optional(),
});

export type GameSpec = ZodInfer<typeof GameSpecSchema>;
