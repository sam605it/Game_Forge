import type { Category } from "@/engine/categories";
import emojiPalette from "@/assets/emoji/emojiPalette.json";

export type EmojiIcon = {
  id: string;
  emoji: string;
  name: string;
  keywords: string[];
  groups: string[];
  categoryHint?: Category;
};

const ICONS = emojiPalette as EmojiIcon[];

const ENTITY_DEFAULTS: Partial<Record<string, string[]>> = {
  player: ["smiling face", "hero", "character"],
  enemy: ["alien", "monster", "enemy"],
  projectile: ["arrow", "projectile", "spark"],
  goal: ["trophy", "goal", "target", "star"],
  wall: ["brick", "wall", "block"],
  hazard: ["fire", "hazard", "bomb", "skull"],
  pickup: ["gem", "treasure", "coin", "pickup"],
  spawner: ["portal", "sparkle", "spawn"],
  decor: ["tree", "flower", "star", "sparkle"],
  npc: ["person", "villager", "wizard"],
};

const CATEGORY_DEFAULTS: Partial<Record<Category, string[]>> = {
  sports: ["ball", "sports", "trophy"],
  racing: ["car", "racing", "flag"],
  action: ["sword", "action", "blast"],
  shooter: ["blaster", "gun", "rocket"],
  platformer: ["jump", "platform", "flag"],
  puzzle: ["puzzle", "brain", "maze"],
  strategy: ["chess", "tower", "defense"],
  arcade: ["arcade", "joystick", "game"],
  simulation: ["factory", "farm", "simulation"],
  rhythm_music: ["music", "rhythm", "note"],
  word_trivia: ["quiz", "word", "question"],
  party_social: ["party", "celebration", "friends"],
};

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").trim();

const tokenize = (value: string) =>
  normalize(value)
    .split(/\s+/)
    .filter(Boolean);

const hashSeed = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const mulberry32 = (seed: number) => {
  let t = seed + 0x6d2b79f5;
  return () => {
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const extractExcludedTerms = (prompt: string) => {
  const excluded = new Set<string>();
  const normalized = prompt.toLowerCase();
  const matches = normalized.matchAll(/\b(?:without|no|exclude|excluding|avoid)\s+([^,.]+)/gi);
  for (const match of matches) {
    const phrase = match[1] ?? "";
    phrase
      .split(/,| and | or /gi)
      .map((part) => normalize(part))
      .filter(Boolean)
      .forEach((term) => {
        excluded.add(term);
        if (term.endsWith("s")) {
          excluded.add(term.slice(0, -1));
        } else {
          excluded.add(`${term}s`);
        }
      });
  }
  return Array.from(excluded);
};

const matchesExcluded = (icon: EmojiIcon, excluded: string[]) => {
  if (!excluded.length) return false;
  const haystack = `${icon.name} ${icon.keywords.join(" ")} ${icon.groups.join(" ")}`.toLowerCase();
  return excluded.some((term) => term && haystack.includes(term));
};

const scoreIcon = (icon: EmojiIcon, tokens: string[]) => {
  if (!tokens.length) return 0;
  const name = icon.name.toLowerCase();
  const keywords = icon.keywords.map((keyword) => keyword.toLowerCase());
  const groups = icon.groups.map((group) => group.toLowerCase());
  let score = 0;
  for (const token of tokens) {
    if (!token) continue;
    if (name.includes(token)) score += 3;
    if (keywords.some((keyword) => keyword.includes(token))) score += 4;
    if (groups.some((group) => group.includes(token))) score += 1;
  }
  return score;
};

const findByKeywords = (keywords: string[]) => {
  if (!keywords.length) return null;
  const lowered = keywords.map((item) => item.toLowerCase());
  return (
    ICONS.find((icon) =>
      lowered.some((term) => icon.name.toLowerCase().includes(term) || icon.keywords.some((keyword) => keyword.toLowerCase().includes(term))),
    ) ?? null
  );
};

export function pickIcon(args: {
  prompt: string;
  category: Category;
  entityKind:
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
  themeTags: string[];
  seed: number;
}): EmojiIcon {
  const seed = hashSeed(`${args.prompt}|${args.entityKind}|${args.seed}`);
  const rng = mulberry32(seed);
  const tokens = Array.from(new Set([...tokenize(args.prompt), ...args.themeTags.map((tag) => normalize(tag))]));
  const excluded = args.entityKind === "decor" ? extractExcludedTerms(args.prompt) : [];

  const scored = ICONS.map((icon) => ({
    icon,
    score: scoreIcon(icon, tokens),
  }))
    .filter((entry) => entry.score > 0)
    .filter((entry) => !matchesExcluded(entry.icon, excluded));

  if (scored.length) {
    scored.sort((a, b) => b.score - a.score || a.icon.name.localeCompare(b.icon.name));
    const topScore = scored[0]?.score ?? 0;
    const topIcons = scored.filter((entry) => entry.score === topScore);
    const index = Math.floor(rng() * topIcons.length);
    return topIcons[index]?.icon ?? scored[0].icon;
  }

  const entityFallback = findByKeywords(ENTITY_DEFAULTS[args.entityKind] ?? []);
  if (entityFallback && !matchesExcluded(entityFallback, excluded)) return entityFallback;

  const categoryFallback = findByKeywords(CATEGORY_DEFAULTS[args.category] ?? []);
  if (categoryFallback && !matchesExcluded(categoryFallback, excluded)) return categoryFallback;

  return ICONS[Math.floor(rng() * ICONS.length)] ?? {
    id: "fallback",
    emoji: "❔",
    name: "unknown",
    keywords: ["unknown"],
    groups: ["fallback"],
  };
}
