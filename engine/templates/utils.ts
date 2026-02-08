import type { GameSpecV1 } from "@/types";
import { CONTROL_SCHEMES, ENTITY_KINDS, SHAPES } from "@/engine/capabilities";

const DEFAULT_WORLD_SIZE = { width: 800, height: 600 };

export const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const mulberry32 = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const randomBetween = (rng: () => number, min: number, max: number) => min + (max - min) * rng();

export const buildBaseSpec = (params: {
  id: string;
  title: string;
  description: string;
  category: GameSpecV1["category"];
  controls: GameSpecV1["controls"]["scheme"];
  gravity?: [number, number];
  friction?: number;
  restitution?: number;
  cameraMode?: GameSpecV1["world"]["camera"]["mode"];
}): GameSpecV1 => {
  const controlsScheme = CONTROL_SCHEMES.includes(params.controls as typeof CONTROL_SCHEMES[number])
    ? params.controls
    : "keyboard_move";
  return {
    id: params.id,
    title: params.title,
    category: params.category,
    description: params.description,
    assets: [],
    world: {
      size: { ...DEFAULT_WORLD_SIZE },
      physics: {
        gravity: params.gravity ?? [0, 0],
        friction: params.friction ?? 0.96,
        restitution: params.restitution ?? 0.7,
        timeStep: 1 / 60,
      },
      camera: { mode: params.cameraMode ?? "static" },
    },
    entities: [],
    rules: [],
    controls: {
      scheme: controlsScheme,
      mappings: {
        up: ["ArrowUp", "KeyW"],
        down: ["ArrowDown", "KeyS"],
        left: ["ArrowLeft", "KeyA"],
        right: ["ArrowRight", "KeyD"],
        action: ["Space"],
        reset: ["KeyR"],
      },
    },
    ui: {
      hud: [{ type: "message", label: "Ready" }],
      messages: { start: "Press Start to play." },
    },
  };
};

export const createEntity = (params: {
  id: string;
  kind: GameSpecV1["entities"][number]["kind"];
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  shape?: GameSpecV1["entities"][number]["render"]["shape"];
  collider?: GameSpecV1["entities"][number]["collider"];
  tags?: string[];
  renderType?: "shape" | "emoji";
  emoji?: string;
  velocity?: { x: number; y: number };
}): GameSpecV1["entities"][number] => {
  const shape = params.shape && SHAPES.includes(params.shape as typeof SHAPES[number]) ? params.shape : "circle";
  const kind = ENTITY_KINDS.includes(params.kind as typeof ENTITY_KINDS[number]) ? params.kind : "decor";
  return {
    id: params.id,
    kind,
    position: { x: params.x, y: params.y },
    velocity: params.velocity ?? { x: 0, y: 0 },
    size: { width: params.width, height: params.height },
    rotation: 0,
    render: {
      type: params.renderType ?? "shape",
      shape: params.renderType === "emoji" ? undefined : shape,
      emoji: params.renderType === "emoji" ? params.emoji : undefined,
      color: params.color,
    },
    collider: params.collider ?? { type: shape === "circle" ? "circle" : "rect", isStatic: true },
    tags: params.tags,
  };
};

export const addBoundaryWalls = (spec: GameSpecV1, color = "#1f2937") => {
  const { width, height } = spec.world.size;
  const walls = [
    createEntity({
      id: "wall-top",
      kind: "wall",
      x: width / 2,
      y: 40,
      width: width - 80,
      height: 20,
      color,
      shape: "rect",
      tags: ["wall"],
      collider: { type: "rect", isStatic: true },
    }),
    createEntity({
      id: "wall-bottom",
      kind: "wall",
      x: width / 2,
      y: height - 40,
      width: width - 80,
      height: 20,
      color,
      shape: "rect",
      tags: ["wall"],
      collider: { type: "rect", isStatic: true },
    }),
    createEntity({
      id: "wall-left",
      kind: "wall",
      x: 40,
      y: height / 2,
      width: 20,
      height: height - 80,
      color,
      shape: "rect",
      tags: ["wall"],
      collider: { type: "rect", isStatic: true },
    }),
    createEntity({
      id: "wall-right",
      kind: "wall",
      x: width - 40,
      y: height / 2,
      width: 20,
      height: height - 80,
      color,
      shape: "rect",
      tags: ["wall"],
      collider: { type: "rect", isStatic: true },
    }),
  ];
  spec.entities.push(...walls);
};

export const addDecorCluster = (spec: GameSpecV1, rng: () => number, params: {
  count: number;
  color: string;
  tag: string;
  emoji?: string;
}) => {
  for (let i = 0; i < params.count; i += 1) {
    const x = randomBetween(rng, 80, spec.world.size.width - 80);
    const y = randomBetween(rng, 80, spec.world.size.height - 80);
    spec.entities.push(
      createEntity({
        id: `decor-${params.tag}-${i}`,
        kind: "decor",
        x,
        y,
        width: 20,
        height: 20,
        color: params.color,
        shape: "circle",
        tags: ["decor", params.tag],
        renderType: params.emoji ? "emoji" : "shape",
        emoji: params.emoji,
        collider: { type: "circle", isStatic: true, isSensor: true },
      }),
    );
  }
};
