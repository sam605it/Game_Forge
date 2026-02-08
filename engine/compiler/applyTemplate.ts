import type { Intent } from "@/engine/types";
import { TEMPLATE_MAP } from "@/engine/templates";
import { addDecorCluster, mulberry32 } from "@/engine/templates/utils";
import type { GameSpecV1 } from "@/types";

const THEME_DECOR: Record<string, { color: string; tag: string; emoji?: string }> = {
  space: { color: "#38bdf8", tag: "star", emoji: "⭐" },
  forest: { color: "#16a34a", tag: "tree", emoji: "🌲" },
  desert: { color: "#f59e0b", tag: "sand", emoji: "🏜️" },
  ocean: { color: "#0ea5e9", tag: "wave", emoji: "🌊" },
  neon: { color: "#a855f7", tag: "neon", emoji: "✨" },
  retro: { color: "#f97316", tag: "retro", emoji: "📼" },
  cyber: { color: "#22d3ee", tag: "circuit", emoji: "🧩" },
  medieval: { color: "#a16207", tag: "torch", emoji: "🛡️" },
  spooky: { color: "#7c3aed", tag: "spooky", emoji: "🕯️" },
  winter: { color: "#e2e8f0", tag: "snow", emoji: "❄️" },
  lava: { color: "#ef4444", tag: "lava", emoji: "🌋" },
  jungle: { color: "#22c55e", tag: "leaf", emoji: "🍃" },
  city: { color: "#64748b", tag: "city", emoji: "🏙️" },
  ruins: { color: "#94a3b8", tag: "ruins", emoji: "🏺" },
  crystal: { color: "#38bdf8", tag: "crystal", emoji: "💎" },
};

const applyTheme = (spec: GameSpecV1, intent: Intent, seed: number) => {
  if (!intent.themeTags.length) return spec;
  const primary = intent.themeTags[0];
  spec.title = `${primary.replace(/(^\w|\s\w)/g, (match) => match.toUpperCase())} ${spec.title}`;
  spec.description = `${spec.description} Theme: ${intent.themeTags.join(", ")}.`;
  spec.assets = Array.from(new Set([...(spec.assets ?? []), ...intent.themeTags.map((tag) => `theme:${tag}`)]));

  const rng = mulberry32(seed + 101);
  intent.themeTags.slice(0, 2).forEach((tag) => {
    const decor = THEME_DECOR[tag];
    if (decor) {
      addDecorCluster(spec, rng, { count: 4, color: decor.color, tag: decor.tag, emoji: decor.emoji });
    }
  });
  return spec;
};

const applyCounts = (spec: GameSpecV1, intent: Intent) => {
  const counts = intent.counts;
  if (!counts || Object.keys(counts).length === 0) return spec;
  const byKind = new Map<string, GameSpecV1["entities"]>();
  for (const entity of spec.entities) {
    const list = byKind.get(entity.kind) ?? [];
    list.push(entity);
    byKind.set(entity.kind, list);
  }
  for (const [kind, target] of Object.entries(counts)) {
    const existing = byKind.get(kind) ?? [];
    if (existing.length >= target) continue;
    const templateEntity = existing[0] ?? spec.entities.find((entity) => entity.kind === "decor");
    if (!templateEntity) continue;
    for (let i = existing.length; i < target; i += 1) {
      spec.entities.push({
        ...templateEntity,
        id: `${templateEntity.id}-${kind}-${i}`,
        position: {
          x: templateEntity.position.x + i * 12,
          y: templateEntity.position.y + i * 6,
        },
      });
    }
  }
  return spec;
};

export const applyTemplate = (intent: Intent, seed: number) => {
  const template = TEMPLATE_MAP.get(intent.templateId) ?? TEMPLATE_MAP.get("dodge_arena");
  if (!template) {
    throw new Error("Template registry missing.");
  }
  let spec = template.buildBaseSpec(seed);
  spec = template.applyModifiers(spec, intent, seed);
  spec = applyTheme(spec, intent, seed);
  spec = applyCounts(spec, intent);
  return { spec, template };
};
