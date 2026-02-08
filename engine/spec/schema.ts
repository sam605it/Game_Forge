import { z } from "zod";
import { GameSpec } from "./gameSpec";

export const Vec2Schema = z.object({
  x: z.number(),
  y: z.number(),
});

export const ShapeSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("circle"), r: z.number().positive() }),
  z.object({ type: z.literal("rect"), w: z.number().positive(), h: z.number().positive() }),
]);

export const EntityMetaSchema = z
  .object({
    iconEmoji: z.string().optional(),
    iconId: z.string().optional(),
    iconName: z.string().optional(),
  })
  .optional();

export const EntitySchema = z.object({
  id: z.string(),
  kind: z.enum([
    "player",
    "enemy",
    "projectile",
    "goal",
    "wall",
    "hazard",
    "pickup",
    "spawner",
    "decor",
    "npc",
  ]),
  pos: Vec2Schema,
  vel: Vec2Schema.optional(),
  shape: ShapeSchema,
  color: z.string().optional(),
  meta: EntityMetaSchema,
});

export const WorldSchema = z.object({
  w: z.number().positive(),
  h: z.number().positive(),
});

export const GameSpecSchema = z.object({
  title: z.string(),
  prompt: z.string(),
  seed: z.number().int(),
  world: WorldSchema,
  entities: z.array(EntitySchema),
});

export const validateGameSpec = (spec: unknown): GameSpec => {
  return GameSpecSchema.parse(spec) as GameSpec;
};
