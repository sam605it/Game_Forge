import { GameSpec, Entity } from "../spec/gameSpec";
import { parsePrompt } from "../intent/parsePrompt";

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const themeDecor = {
  spooky: [
    { iconEmoji: "🕯️", iconId: "candle", iconName: "candle" },
    { iconEmoji: "🦇", iconId: "bat", iconName: "bat" },
    { iconEmoji: "🎃", iconId: "pumpkin", iconName: "pumpkin" },
  ],
  space: [
    { iconEmoji: "🛰️", iconId: "satellite", iconName: "satellite" },
    { iconEmoji: "🌌", iconId: "galaxy", iconName: "galaxy" },
    { iconEmoji: "🚀", iconId: "rocket", iconName: "rocket" },
  ],
  pirate: [
    { iconEmoji: "🏴‍☠️", iconId: "pirate-flag", iconName: "pirate flag" },
    { iconEmoji: "🪙", iconId: "coin", iconName: "coin" },
    { iconEmoji: "🧭", iconId: "compass", iconName: "compass" },
  ],
  underwater: [
    { iconEmoji: "🐠", iconId: "fish", iconName: "fish" },
    { iconEmoji: "🪸", iconId: "coral", iconName: "coral" },
    { iconEmoji: "🐚", iconId: "shell", iconName: "shell" },
  ],
  neon: [
    { iconEmoji: "💿", iconId: "disc", iconName: "disc" },
    { iconEmoji: "🪩", iconId: "mirror-ball", iconName: "mirror ball" },
    { iconEmoji: "✨", iconId: "sparkles", iconName: "sparkles" },
  ],
  retro: [
    { iconEmoji: "👾", iconId: "alien", iconName: "alien" },
    { iconEmoji: "🕹️", iconId: "joystick", iconName: "joystick" },
    { iconEmoji: "📼", iconId: "vhs", iconName: "vhs" },
  ],
  cute: [
    { iconEmoji: "🐰", iconId: "bunny", iconName: "bunny" },
    { iconEmoji: "🧸", iconId: "teddy", iconName: "teddy" },
    { iconEmoji: "🌸", iconId: "sakura", iconName: "sakura" },
  ],
  zombie: [
    { iconEmoji: "🧟", iconId: "zombie", iconName: "zombie" },
    { iconEmoji: "🪦", iconId: "tombstone", iconName: "tombstone" },
    { iconEmoji: "🧠", iconId: "brain", iconName: "brain" },
  ],
} as const;

type ThemeKey = keyof typeof themeDecor;

const getDecorForTheme = (theme?: ThemeKey) => {
  if (!theme || !(theme in themeDecor)) {
    return themeDecor.retro;
  }
  return themeDecor[theme];
};

const shouldExclude = (entity: Entity, exclusions: string[]) => {
  if (!exclusions.length || entity.kind !== "decor") {
    return false;
  }
  const haystack = `${entity.meta?.iconId ?? ""} ${entity.meta?.iconName ?? ""}`.toLowerCase();
  return exclusions.some((term) => haystack.includes(term));
};

export const buildMiniGolfSpec = (prompt: string): GameSpec => {
  const seed = hashString(prompt);
  const rng = mulberry32(seed);
  const intent = parsePrompt(prompt);
  const theme = (intent.themes[0] as ThemeKey | undefined) ?? "retro";
  const world = { w: 900, h: 520 };

  const entities: Entity[] = [
    {
      id: "player",
      kind: "player",
      pos: { x: 140, y: world.h / 2 },
      shape: { type: "circle", r: 18 },
      color: "#7dd3fc",
      meta: { iconEmoji: "🏌️", iconId: "golfer", iconName: "golfer" },
    },
    {
      id: "goal",
      kind: "goal",
      pos: { x: world.w - 140, y: world.h / 2 },
      shape: { type: "circle", r: 22 },
      color: "#22c55e",
      meta: { iconEmoji: "⛳", iconId: "flag", iconName: "flag" },
    },
    {
      id: "wall-top",
      kind: "wall",
      pos: { x: world.w / 2, y: 40 },
      shape: { type: "rect", w: world.w - 80, h: 16 },
      color: "#1f2937",
    },
    {
      id: "wall-bottom",
      kind: "wall",
      pos: { x: world.w / 2, y: world.h - 40 },
      shape: { type: "rect", w: world.w - 80, h: 16 },
      color: "#1f2937",
    },
    {
      id: "wall-left",
      kind: "wall",
      pos: { x: 60, y: world.h / 2 },
      shape: { type: "rect", w: 16, h: world.h - 120 },
      color: "#1f2937",
    },
    {
      id: "wall-right",
      kind: "wall",
      pos: { x: world.w - 60, y: world.h / 2 },
      shape: { type: "rect", w: 16, h: world.h - 120 },
      color: "#1f2937",
    },
  ];

  const decorOptions = getDecorForTheme(theme);
  for (let i = 0; i < 3; i += 1) {
    const pick = decorOptions[i % decorOptions.length];
    entities.push({
      id: `decor-${i}`,
      kind: "decor",
      pos: {
        x: 240 + rng() * (world.w - 480),
        y: 120 + rng() * (world.h - 240),
      },
      shape: { type: "circle", r: 16 + Math.floor(rng() * 10) },
      color: "#fbbf24",
      meta: { ...pick },
    });
  }

  const filteredEntities = entities.filter(
    (entity) => !shouldExclude(entity, intent.exclusions)
  );

  return {
    title: `${theme[0].toUpperCase()}${theme.slice(1)} Mini Golf`,
    prompt,
    seed,
    world,
    entities: filteredEntities,
  };
};
