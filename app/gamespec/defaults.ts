import type { Category, GameSpecV1, Template } from "./types";

export const CATEGORY_TEMPLATE_MAP: Record<Category, Template> = {
  sports: "physics_2d",
  simulation: "physics_2d",
  platforming: "platformer_2d",
  puzzle: "grid_2d",
  word_trivia: "grid_2d",
  rhythm_music: "rhythm_2d",
  arcade: "topdown_2d",
  action: "topdown_2d",
  racing: "topdown_2d",
  shooter: "topdown_2d",
  strategy: "topdown_2d",
  party_social: "topdown_2d",
};

export const DEFAULT_PHYSICS: GameSpecV1["world"]["physics"] = {
  gravity: [0, 300],
  friction: 0.04,
  restitution: 0.35,
  timeStep: 1 / 60,
};

export const DEFAULT_CAMERA: GameSpecV1["world"]["camera"] = {
  mode: "static",
};

export const DEFAULT_CONSTRAINTS: GameSpecV1["constraints"] = {
  maxEntities: 200,
  maxSounds: 24,
  targetFPS: 60,
  maxRules: 128,
  maxParticles: 300,
  requiredEntities: [],
  bannedEntities: [],
};

export const SUPPORTED_COMPONENTS = [
  "Transform",
  "Sprite",
  "RigidBody",
  "CircleCollider",
  "BoxCollider",
  "InputController",
  "AudioEmitter",
  "Goal",
  "Scoring",
  "Spawner",
];
