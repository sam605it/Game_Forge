import type { GameSpec } from "@/lib/gamespec/schema";
import type { RequirementList } from "@/lib/nlp/requirements";
import { buildMiniGolfSpec } from "@/lib/templates/mini_golf";
import { DEFAULT_TEMPLATE } from "@/lib/nlp/requirements";

export function buildGameSpec(requirements: RequirementList): GameSpec {
  if (requirements.gameType !== "mini_golf") {
    const playableSpec = buildMiniGolfSpec({ ...requirements, gameType: DEFAULT_TEMPLATE });
    return {
      ...playableSpec,
      notes: [
        ...(playableSpec.notes ?? []),
        `Requested ${requirements.gameType} but defaulted to mini golf for a playable game.`,
      ],
    };
  }

  return buildMiniGolfSpec(requirements);
}
