import type { GameSpecV1 } from "@/types";
import { SHAPES } from "@/engine/capabilities";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const clampNumber = (value: number, fallback: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return fallback;
  return clamp(value, min, max);
};

const sanitizeString = (value: string, fallback: string) => (value.trim() ? value : fallback);

const MAX_ENTITIES = 80;

export const normalizeSpec = (spec: GameSpecV1): GameSpecV1 => {
  const worldWidth = clampNumber(spec.world.size.width, 800, 320, 1600);
  const worldHeight = clampNumber(spec.world.size.height, 600, 240, 1200);

  const normalizedEntities = spec.entities
    .map((entity) => {
      const width = clampNumber(entity.size.width, 24, 6, 160);
      const height = clampNumber(entity.size.height, 24, 6, 160);
      const halfW = width / 2;
      const halfH = height / 2;

      const position = {
        x: clampNumber(entity.position.x, worldWidth / 2, halfW, worldWidth - halfW),
        y: clampNumber(entity.position.y, worldHeight / 2, halfH, worldHeight - halfH),
      };

      const velocity = {
        x: clampNumber(entity.velocity.x, 0, -600, 600),
        y: clampNumber(entity.velocity.y, 0, -600, 600),
      };

      const shape = entity.render.shape && SHAPES.includes(entity.render.shape) ? entity.render.shape : "circle";

      const colliderType: "rect" | "circle" = entity.collider.type === "rect" ? "rect" : "circle";

      return {
        id: sanitizeString(entity.id, "entity"),
        kind: entity.kind,
        position,
        velocity,
        size: { width, height },
        rotation: clampNumber(entity.rotation, 0, -Math.PI * 4, Math.PI * 4),
        render:
          entity.render.type === "shape"
            ? {
                type: "shape" as const,
                shape,
                color: entity.render.color ?? "#94a3b8",
              }
            : {
                type: "emoji" as const,
                emoji: entity.render.emoji ?? "✨",
                color: entity.render.color,
              },
        collider: {
          type: colliderType,
          isStatic: Boolean(entity.collider.isStatic),
          isSensor: entity.collider.isSensor ?? false,
        },
        tags: entity.tags ? [...entity.tags] : undefined,
        meta: entity.meta ? { ...entity.meta } : undefined,
      };
    })
    .filter((entity) => entity.id && entity.kind);

  const primary = normalizedEntities.filter((entity) => entity.kind !== "decor");
  const decor = normalizedEntities.filter((entity) => entity.kind === "decor");
  const cappedEntities = [...primary, ...decor].slice(0, MAX_ENTITIES);

  return {
    ...spec,
    id: sanitizeString(spec.id, `${Date.now()}`),
    title: sanitizeString(spec.title, "Forged Game"),
    description: sanitizeString(spec.description, "A forged mini-game."),
    world: {
      size: { width: worldWidth, height: worldHeight },
      physics: {
        gravity: [
          clampNumber(spec.world.physics.gravity[0], 0, -2000, 2000),
          clampNumber(spec.world.physics.gravity[1], 0, -2000, 2000),
        ],
        friction: clampNumber(spec.world.physics.friction, 0.96, 0, 1),
        restitution: clampNumber(spec.world.physics.restitution, 0.7, 0, 1),
        timeStep: clampNumber(spec.world.physics.timeStep, 1 / 60, 1 / 240, 1 / 30),
      },
      camera: {
        mode: spec.world.camera.mode === "follow" ? "follow" : "static",
        targetId: spec.world.camera.targetId,
      },
    },
    entities: cappedEntities,
    rules: spec.rules.map((rule) => ({ ...rule, params: rule.params ?? {} })),
    assets: Array.isArray(spec.assets) ? spec.assets.filter(Boolean) : [],
    controls: {
      scheme: spec.controls.scheme,
      mappings: {
        ...spec.controls.mappings,
      },
    },
    ui: {
      hud: spec.ui.hud ?? [],
      messages: spec.ui.messages,
    },
  };
};
