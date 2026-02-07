import type { GameSpec } from "@/lib/gamespec/schema";
import type { RequirementList } from "@/lib/nlp/requirements";
import { buildMiniGolfSpec } from "@/lib/templates/mini_golf";
import { resolveIconId } from "@/lib/icons/iconCatalog";

export function buildGameSpec(requirements: RequirementList): GameSpec {
  if (requirements.gameType === "mini_golf") {
    return buildMiniGolfSpec(requirements);
  }

  const includeDecorations = requirements.inclusions.filter(
    (item) => !requirements.exclusions.some((exclusion) => item.includes(exclusion)),
  );

  const decorationEntities: GameSpec["entities"] = [];
  const worldWidth = 900;
  const worldHeight = 520;
  let decorIndex = 0;

  includeDecorations.forEach((item) => {
    const count = requirements.inclusionCounts[item] ?? 1;
    for (let i = 0; i < count; i += 1) {
      const iconId = resolveIconId({ semantic: item, role: "decoration", palette: requirements.theme.palette });
      const x = 120 + (decorIndex % 10) * 70;
      const y = 120 + Math.floor(decorIndex / 10) * 70;
      decorationEntities.push({
        id: `decor-${item}-${decorIndex}`,
        type: item,
        pos: [x, y],
        size: [72, 72],
        sprite: { iconId },
      });
      decorIndex += 1;
    }
  });

  const notes = [
    `Template ${requirements.gameType} is scaffolded only. Mini golf is fully playable.`,
  ];

  return {
    title: requirements.raw,
    template: requirements.gameType,
    theme: {
      skin: requirements.theme.skin,
      palette: requirements.theme.palette,
      mood: requirements.theme.mood,
      exclude: requirements.exclusions.length ? requirements.exclusions : undefined,
    },
    world: {
      width: worldWidth,
      height: worldHeight,
      physics: {
        gravity: requirements.constraints.includes("low gravity") ? [0, 0.2] : [0, 0.6],
        friction: 0.95,
        restitution: 0.6,
      },
      camera: { mode: "static" },
    },
    level: {
      seed: requirements.raw.toLowerCase().replace(/\s+/g, "-"),
      layout: {
        scaffold: true,
        requestedCounts: requirements.counts,
      },
    },
    entities: [
      {
        id: "player",
        type: "player",
        pos: [120, 260],
        size: [72, 72],
        sprite: {
          iconId: resolveIconId({
            semantic: requirements.theme.skin,
            role: "player",
            palette: requirements.theme.palette,
            mood: requirements.theme.mood,
          }),
        },
      },
      ...decorationEntities,
    ],
    rules: {
      winCondition: "Reach the goal.",
    },
    notes,
  };
}
