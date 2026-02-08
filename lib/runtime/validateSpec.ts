import type { Entity, GameSpecV1 } from "@/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const isString = (value: unknown): value is string => typeof value === "string";

const isEntity = (value: unknown): value is Entity => {
  if (!isRecord(value)) return false;
  const position = value.position;
  const velocity = value.velocity;
  const size = value.size;
  const render = value.render;
  const collider = value.collider;

  return (
    isString(value.id) &&
    isString(value.kind) &&
    isRecord(position) &&
    isFiniteNumber(position.x) &&
    isFiniteNumber(position.y) &&
    isRecord(velocity) &&
    isFiniteNumber(velocity.x) &&
    isFiniteNumber(velocity.y) &&
    isRecord(size) &&
    isFiniteNumber(size.width) &&
    isFiniteNumber(size.height) &&
    isRecord(render) &&
    isString(render.type) &&
    isRecord(collider) &&
    isString(collider.type) &&
    typeof collider.isStatic === "boolean"
  );
};

export const isRenderableSpec = (value: unknown): value is GameSpecV1 => {
  if (!isRecord(value)) return false;
  if (!isString(value.id) || !isString(value.title) || !isString(value.category) || !isString(value.description)) {
    return false;
  }

  const world = value.world;
  if (!isRecord(world)) return false;
  const size = world.size;
  const physics = world.physics;
  const camera = world.camera;
  if (!isRecord(size) || !isFiniteNumber(size.width) || !isFiniteNumber(size.height)) return false;
  if (!isRecord(physics)) return false;
  if (
    !Array.isArray(physics.gravity) ||
    physics.gravity.length !== 2 ||
    !isFiniteNumber(physics.gravity[0]) ||
    !isFiniteNumber(physics.gravity[1]) ||
    !isFiniteNumber(physics.friction) ||
    !isFiniteNumber(physics.restitution) ||
    !isFiniteNumber(physics.timeStep)
  ) {
    return false;
  }
  if (!isRecord(camera) || !isString(camera.mode)) return false;

  if (!Array.isArray(value.entities) || value.entities.length === 0 || !value.entities.every(isEntity)) {
    return false;
  }

  if (!Array.isArray(value.rules)) return false;

  const controls = value.controls;
  if (!isRecord(controls) || !isString(controls.scheme)) return false;
  if (!isRecord(controls.mappings)) return false;

  const ui = value.ui;
  if (!isRecord(ui) || !Array.isArray(ui.hud)) return false;

  return true;
};
