import type { GameSpecV1 } from "@/types";
import { CATEGORIES } from "@/engine/categories";
import { CONTROL_SCHEMES, ENTITY_KINDS, RULE_TYPES, SHAPES } from "@/engine/capabilities";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === "string";

const isVec2 = (value: unknown): value is { x: number; y: number } =>
  isRecord(value) && isFiniteNumber(value.x) && isFiniteNumber(value.y);

const isSize2 = (value: unknown): value is { width: number; height: number } =>
  isRecord(value) && isFiniteNumber(value.width) && isFiniteNumber(value.height);

export const validateSpecSchema = (spec: GameSpecV1): string[] => {
  const errors: string[] = [];

  if (!isString(spec.id)) errors.push("id must be string.");
  if (!isString(spec.title)) errors.push("title must be string.");
  if (!CATEGORIES.includes(spec.category)) errors.push("category must be valid.");
  if (!isString(spec.description)) errors.push("description must be string.");
  if (!Array.isArray(spec.assets)) errors.push("assets must be array.");

  if (!isRecord(spec.world)) errors.push("world must be object.");
  if (!isSize2(spec.world.size)) errors.push("world.size invalid.");
  if (!isRecord(spec.world.physics)) errors.push("world.physics invalid.");
  if (
    !Array.isArray(spec.world.physics.gravity) ||
    spec.world.physics.gravity.length !== 2 ||
    !isFiniteNumber(spec.world.physics.gravity[0]) ||
    !isFiniteNumber(spec.world.physics.gravity[1])
  ) {
    errors.push("world.physics.gravity invalid.");
  }
  if (!isFiniteNumber(spec.world.physics.friction)) errors.push("world.physics.friction invalid.");
  if (!isFiniteNumber(spec.world.physics.restitution)) errors.push("world.physics.restitution invalid.");
  if (!isFiniteNumber(spec.world.physics.timeStep)) errors.push("world.physics.timeStep invalid.");

  if (!isRecord(spec.world.camera)) errors.push("world.camera invalid.");
  if (!isString(spec.world.camera.mode)) errors.push("world.camera.mode invalid.");

  if (!Array.isArray(spec.entities)) errors.push("entities must be array.");
  for (const entity of spec.entities) {
    if (!isRecord(entity)) {
      errors.push("entity must be object.");
      continue;
    }
    if (!isString(entity.id)) errors.push("entity.id invalid.");
    if (!ENTITY_KINDS.includes(entity.kind as typeof ENTITY_KINDS[number])) errors.push("entity.kind invalid.");
    if (!isVec2(entity.position)) errors.push("entity.position invalid.");
    if (!isVec2(entity.velocity)) errors.push("entity.velocity invalid.");
    if (!isSize2(entity.size)) errors.push("entity.size invalid.");
    if (!isFiniteNumber(entity.rotation)) errors.push("entity.rotation invalid.");
    if (!isRecord(entity.render) || !isString(entity.render.type)) errors.push("entity.render invalid.");
    if (entity.render?.type === "shape" && entity.render.shape && !SHAPES.includes(entity.render.shape)) {
      errors.push("entity.render.shape invalid.");
    }
    if (!isRecord(entity.collider) || !isString(entity.collider.type)) errors.push("entity.collider invalid.");
  }

  if (!Array.isArray(spec.rules)) errors.push("rules must be array.");
  for (const rule of spec.rules) {
    if (!isRecord(rule) || !RULE_TYPES.includes(rule.type as typeof RULE_TYPES[number])) {
      errors.push("rule.type invalid.");
    }
  }

  if (!isRecord(spec.controls) || !CONTROL_SCHEMES.includes(spec.controls.scheme)) {
    errors.push("controls.scheme invalid.");
  }
  if (!isRecord(spec.controls) || !isRecord(spec.controls.mappings)) {
    errors.push("controls.mappings invalid.");
  }

  if (!isRecord(spec.ui) || !Array.isArray(spec.ui.hud)) {
    errors.push("ui.hud invalid.");
  } else {
    if (!spec.ui.hud.every((item) => isRecord(item) && isString(item.type))) errors.push("ui.hud items invalid.");
    if (spec.ui.hud.some((item) => !["score", "timer", "message"].includes(item.type as string))) {
      errors.push("ui.hud type invalid.");
    }
  }

  return errors;
};
