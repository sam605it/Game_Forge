import type { GameSpecV1 } from "@/types";
import { SUPPORTED_ENTITY_TYPES } from "@/lib/runtime/capabilities";

const WORD_SEPARATORS = /[,/]| and | or /gi;

const normalizeTerm = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "");

const singularize = (value: string) => (value.endsWith("s") ? value.slice(0, -1) : value);

const extractBannedTerms = (prompt: string) => {
  const banned = new Set<string>();
  const lower = prompt.toLowerCase();
  const matches = lower.matchAll(/\b(?:without|no|exclude|excluding|avoid)\s+([a-z0-9\s-]+)/gi);

  for (const match of matches) {
    const phrase = match[1] ?? "";
    const parts = phrase.split(WORD_SEPARATORS).map((part) => normalizeTerm(part)).filter(Boolean);
    for (const part of parts) {
      const single = singularize(part);
      banned.add(single);
      banned.add(`${single}s`);
    }
  }

  return banned;
};

export const shouldUseMiniGolf = (prompt: string) => /mini\s*golf|golf/i.test(prompt);

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const baseSpec = (prompt: string, category: GameSpecV1["category"]): GameSpecV1 => ({
  id: `${Date.now()}`,
  title: prompt.trim() ? prompt.trim().replace(/^\w/, (char) => char.toUpperCase()) : "Forged Mini-Game",
  category,
  description: prompt.trim() || "A forged mini-game.",
  assets: [],
  world: {
    size: { width: 800, height: 600 },
    physics: { gravity: [0, 0], friction: 0.96, restitution: 0.7, timeStep: 1 / 60 },
    camera: { mode: "static" },
  },
  entities: [],
  rules: [],
  controls: {
    scheme: "keyboard_move",
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
    hud: [{ type: "message", label: "Forge ready" }],
    messages: { start: "Press Start to play!" },
  },
});

const addEntity = (spec: GameSpecV1, entity: GameSpecV1["entities"][number]) => {
  spec.entities.push(entity);
};

const safeEntityKind = (kind: string) => (SUPPORTED_ENTITY_TYPES.includes(kind as typeof SUPPORTED_ENTITY_TYPES[number]) ? kind : "decor");

export const generateMiniGolfSpec = (prompt: string): GameSpecV1 => {
  const banned = extractBannedTerms(prompt);
  const isBanned = (term: string) => {
    const normalized = normalizeTerm(term);
    return [...banned].some((item) => normalized.includes(item));
  };

  const spec = baseSpec(prompt, "sports");
  spec.title = prompt.trim() ? spec.title : "Mini Golf Challenge";
  spec.description = `Sink the ball in the cup with as few strokes as possible. ${prompt.trim()}`.trim();
  spec.controls.scheme = "mouse_drag_shot";

  addEntity(spec, {
    id: "ball",
    kind: "ball",
    position: { x: 120, y: 360 },
    velocity: { x: 0, y: 0 },
    size: { width: 22, height: 22 },
    rotation: 0,
    render: { type: "shape", shape: "circle", color: "#f8fafc" },
    collider: { type: "circle", isStatic: false },
    tags: ["player", "ball"],
  });

  addEntity(spec, {
    id: "cup",
    kind: "cup",
    position: { x: 680, y: 200 },
    velocity: { x: 0, y: 0 },
    size: { width: 28, height: 28 },
    rotation: 0,
    render: { type: "shape", shape: "circle", color: "#0f172a" },
    collider: { type: "circle", isStatic: true, isSensor: true },
    tags: ["goal", "cup"],
  });

  const walls = [
    { id: "wall-top", x: 400, y: 80, width: 720, height: 20 },
    { id: "wall-bottom", x: 400, y: 520, width: 720, height: 20 },
    { id: "wall-left", x: 60, y: 300, width: 20, height: 360 },
    { id: "wall-right", x: 740, y: 300, width: 20, height: 360 },
    { id: "wall-mid", x: 360, y: 320, width: 240, height: 18 },
  ];

  walls.forEach((wall) => {
    addEntity(spec, {
      id: wall.id,
      kind: safeEntityKind("wall"),
      position: { x: wall.x, y: wall.y },
      velocity: { x: 0, y: 0 },
      size: { width: wall.width, height: wall.height },
      rotation: 0,
      render: { type: "shape", shape: "rect", color: "#334155" },
      collider: { type: "rect", isStatic: true },
      tags: ["wall"],
    });
  });

  if (/water|pond|lake/i.test(prompt) && !isBanned("water")) {
    addEntity(spec, {
      id: "hazard-water",
      kind: safeEntityKind("hazard"),
      position: { x: 520, y: 380 },
      velocity: { x: 0, y: 0 },
      size: { width: 120, height: 60 },
      rotation: 0,
      render: { type: "shape", shape: "rect", color: "#38bdf8" },
      collider: { type: "rect", isStatic: true, isSensor: true },
      tags: ["hazard"],
    });
  }

  if (/sand|bunker/i.test(prompt) && !isBanned("sand")) {
    addEntity(spec, {
      id: "hazard-sand",
      kind: safeEntityKind("hazard"),
      position: { x: 260, y: 200 },
      velocity: { x: 0, y: 0 },
      size: { width: 90, height: 50 },
      rotation: 0,
      render: { type: "shape", shape: "rect", color: "#facc15" },
      collider: { type: "rect", isStatic: true, isSensor: true },
      tags: ["hazard"],
    });
  }

  const maxSpeed = clamp(1.4, 0.8, 2.5);
  spec.rules = [
    { type: "strokes", params: {} },
    { type: "win_on_goal", params: { targetTag: "goal", maxSpeed } },
  ];
  spec.ui = {
    hud: [{ type: "score", label: "Strokes", valueKey: "score" }],
    messages: {
      start: "Drag to aim, release to shoot. Press R to reset.",
      win: "HOLE IN!",
    },
  };

  return spec;
};

export const buildPromptFallbackSpec = (prompt: string): GameSpecV1 => {
  if (shouldUseMiniGolf(prompt)) {
    return generateMiniGolfSpec(prompt);
  }

  const spec = baseSpec(prompt, "arcade");
  spec.controls.scheme = "keyboard_move";
  spec.entities = [
    {
      id: "player",
      kind: "ball",
      position: { x: 120, y: 300 },
      velocity: { x: 0, y: 0 },
      size: { width: 28, height: 28 },
      rotation: 0,
      render: { type: "shape", shape: "circle", color: "#38bdf8" },
      collider: { type: "circle", isStatic: false },
      tags: ["player"],
    },
    {
      id: "goal",
      kind: "goal",
      position: { x: 680, y: 300 },
      velocity: { x: 0, y: 0 },
      size: { width: 40, height: 40 },
      rotation: 0,
      render: { type: "shape", shape: "circle", color: "#22c55e" },
      collider: { type: "circle", isStatic: true, isSensor: true },
      tags: ["goal"],
    },
  ];
  spec.rules = [{ type: "win_on_goal", params: { targetTag: "goal", maxSpeed: 999 } }];
  spec.ui = {
    hud: [{ type: "message", label: "Reach the goal" }],
    messages: { start: "Reach the goal!", win: "Goal reached!" },
  };
  return spec;
};

export const sanitizeSpecForPrompt = (spec: GameSpecV1, prompt: string) => {
  const banned = extractBannedTerms(prompt);
  if (banned.size === 0) return spec;
  const bannedList = [...banned];
  const isBanned = (text: string) => bannedList.some((term) => text.includes(term));

  const filteredEntities = spec.entities.filter((entity) => {
    const descriptor = `${entity.id} ${entity.kind} ${(entity.tags ?? []).join(" ")}`.toLowerCase();
    return !isBanned(descriptor);
  });

  const filteredAssets = spec.assets.filter((asset) => !isBanned(asset.toLowerCase()));

  return {
    ...spec,
    entities: filteredEntities,
    assets: filteredAssets,
  };
};
