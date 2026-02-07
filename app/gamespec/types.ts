export const CATEGORIES = [
  "sports",
  "puzzle",
  "arcade",
  "action",
  "racing",
  "platforming",
  "shooter",
  "strategy",
  "simulation",
  "rhythm_music",
  "word_trivia",
  "party_social",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type Template =
  | "physics_2d"
  | "platformer_2d"
  | "grid_2d"
  | "rhythm_2d"
  | "topdown_2d";

export type Platform = "web" | "mobile_web";

export type RuleEventName =
  | "GameStart"
  | "Tick"
  | "Collision"
  | "TriggerEnter"
  | "GoalReached"
  | "TimerElapsed";

export type RuleEvent = {
  event: RuleEventName;
  a?: string;
  b?: string;
  entity?: string;
};

export type RuleAction =
  | { action: "PlaySound"; sound: string; loop?: boolean; volume?: number }
  | { action: "AddScore"; amount: number }
  | { action: "SetScore"; value: number }
  | { action: "EndRound"; result: "win" | "lose" }
  | { action: "Spawn"; kind: string; count?: number }
  | { action: "Despawn"; entity: string }
  | { action: "SetVelocity"; entity: string; vel: [number, number] }
  | { action: "SetPosition"; entity: string; pos: [number, number] }
  | { action: "ShowMessage"; text: string; durationMs?: number };

export type Rule = {
  when: RuleEvent;
  do: RuleAction[];
};

export type TransformComponent = {
  pos: [number, number];
  rot?: number;
  scale?: [number, number];
};

export type SpriteComponent = {
  ref: string;
};

export type RigidBodyComponent = {
  type: "static" | "dynamic";
  mass?: number;
  fixedRotation?: boolean;
};

export type CircleColliderComponent = {
  radius: number;
  isTrigger?: boolean;
};

export type BoxColliderComponent = {
  size: [number, number];
  isTrigger?: boolean;
};

export type InputControllerComponent = {
  scheme: "drag_shot" | "wasd" | "tap" | "click";
  bindings?: Record<string, string>;
};

export type AudioEmitterComponent = {
  on?: Record<string, string>;
};

export type GoalComponent = {
  type: "enter_trigger" | "score_target" | "timer";
  target?: string;
  value?: number;
};

export type ScoringComponent = {
  start?: number;
};

export type SpawnerComponent = {
  kind: "scatter";
  targetKind: string;
  count: number;
  area?: { min: [number, number]; max: [number, number] };
  avoid?: Array<{ entity: string; radius: number }>;
  components?: Record<string, unknown>;
};

export type EntityComponents = {
  Transform?: TransformComponent;
  Sprite?: SpriteComponent;
  RigidBody?: RigidBodyComponent;
  CircleCollider?: CircleColliderComponent;
  BoxCollider?: BoxColliderComponent;
  InputController?: InputControllerComponent;
  AudioEmitter?: AudioEmitterComponent;
  Goal?: GoalComponent;
  Scoring?: ScoringComponent;
  Spawner?: SpawnerComponent;
  [key: string]: unknown;
};

export type GameEntity = {
  id: string;
  kind: string;
  tags?: string[];
  components: EntityComponents;
};

export type GameSpecV1 = {
  metadata: {
    version: "1.0";
    title: string;
    category: Category;
    template: Template;
    mechanics: string[];
    seed?: number;
    platform?: Platform;
  };
  world: {
    physics: {
      gravity: [number, number];
      friction: number;
      restitution: number;
      timeStep?: number;
    };
    camera: {
      mode: "static" | "follow" | "topdown";
      target?: string;
    };
  };
  entities: GameEntity[];
  components: {
    supported: string[];
  };
  rules: Rule[];
  assets: {
    sprites: Record<string, string>;
    sounds: Record<string, string>;
  };
  constraints: {
    maxEntities: number;
    maxSounds: number;
    targetFPS: number;
    maxRules?: number;
    maxParticles?: number;
    requiredEntities?: string[];
    bannedEntities?: string[];
  };
  promptContract?: {
    mustHave: string[];
    mustNotHave: string[];
    notes?: string[];
  };
};
