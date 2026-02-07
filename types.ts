export type GameCategory =
  | "sports"
  | "simulation"
  | "platforming"
  | "puzzle"
  | "word_trivia"
  | "rhythm_music"
  | "arcade"
  | "action"
  | "racing"
  | "shooter"
  | "strategy"
  | "party_social";

export type EntityRender = {
  type: "shape" | "emoji";
  shape?: "rect" | "circle" | "line";
  emoji?: string;
  color?: string;
};

export type EntityCollider = {
  type: "rect" | "circle";
  isStatic: boolean;
  isSensor?: boolean;
};

export type Entity = {
  id: string;
  kind: string;
  position: { x: number; y: number };
  velocity: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  render: EntityRender;
  collider: EntityCollider;
  tags?: string[];
};

export type Rule = {
  type: "strokes" | "score" | "timer" | "win_on_goal" | "lose_on_timer";
  params: Record<string, any>;
};

export type GameSpecV1 = {
  id: string;
  title: string;
  category: GameCategory;
  description: string;
  assets: string[];
  world: {
    size: { width: number; height: number };
    physics: {
      gravity: [number, number];
      friction: number;
      restitution: number;
      timeStep: number;
    };
    camera: { mode: "static" | "follow"; targetId?: string };
  };
  entities: Entity[];
  rules: Rule[];
  controls: {
    scheme: "mouse_drag_shot" | "click_shot" | "keyboard_move";
    mappings: {
      up?: string[];
      down?: string[];
      left?: string[];
      right?: string[];
      action?: string[];
      reset?: string[];
    };
  };
  ui: {
    hud: Array<{
      type: "score" | "timer" | "message";
      label?: string;
      valueKey?: string;
    }>;
    messages?: {
      win?: string;
      lose?: string;
      start?: string;
    };
  };
};
