export type Vec2 = { x: number; y: number };

export type EntityKind =
  | "player"
  | "enemy"
  | "projectile"
  | "goal"
  | "wall"
  | "hazard"
  | "pickup"
  | "spawner"
  | "decor"
  | "npc";

export type Shape =
  | { type: "circle"; r: number }
  | { type: "rect"; w: number; h: number };

export type EntityMeta = {
  iconEmoji?: string;
  iconId?: string;
  iconName?: string;
};

export type Entity = {
  id: string;
  kind: EntityKind;
  pos: Vec2;
  vel?: Vec2;
  shape: Shape;
  color?: string;
  meta?: EntityMeta;
};

export type World = {
  w: number;
  h: number;
};

export type GameSpec = {
  title: string;
  prompt: string;
  seed: number;
  world: World;
  entities: Entity[];
};
