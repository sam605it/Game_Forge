import type { GameSpec } from "@/lib/gamespec/schema";
import type { RequirementList } from "@/lib/nlp/requirements";
import { buildMiniGolfSpec } from "@/lib/templates/mini_golf";
import { resolveIconId } from "@/lib/icons/iconCatalog";

export function buildGameSpec(requirements: RequirementList): GameSpec {
  if (requirements.gameType === "mini_golf") {
    return buildMiniGolfSpec(requirements);
  }

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
      width: 900,
      height: 520,
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
        size: [40, 40],
        sprite: {
          iconId: resolveIconId({
            semantic: requirements.theme.skin,
            role: "player",
            palette: requirements.theme.palette,
            mood: requirements.theme.mood,
          }),
        },
      },
    ],
    rules: {
      winCondition: "Reach the goal.",
    },
    notes,
  };
}
