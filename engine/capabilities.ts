export const WORLD_MODES = ["topdown2d", "platformer2d", "grid2d"] as const;
export const SHAPES = ["circle", "rect", "line"] as const;
export const ENTITY_KINDS = [
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
] as const;
export const CONTROL_SCHEMES = [
  "keyboard_move",
  "mouse_aim_shoot",
  "drag_launch",
  "click_place",
  "swipe_move",
] as const;
export const RULE_TYPES = [
  "score",
  "timer",
  "lives",
  "rounds",
  "checkpoints",
  "win_on_goal",
  "win_on_score",
  "lose_on_lives",
  "lose_on_timer",
] as const;

export type WorldMode = (typeof WORLD_MODES)[number];
export type ShapeType = (typeof SHAPES)[number];
export type EntityKind = (typeof ENTITY_KINDS)[number];
export type ControlScheme = (typeof CONTROL_SCHEMES)[number];
export type RuleType = (typeof RULE_TYPES)[number];

export const ENGINE_CAPABILITIES = {
  worldModes: WORLD_MODES,
  shapes: SHAPES,
  entities: ENTITY_KINDS,
  controls: CONTROL_SCHEMES,
  rules: RULE_TYPES,
} as const;
