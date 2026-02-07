import type { GameSpec } from "@/lib/gamespec/schema";
import type { RequirementList } from "@/lib/nlp/requirements";
import { resolveIconId } from "@/lib/icons/iconCatalog";

export type EvaluationFailure =
  | { type: "exclude"; term: string }
  | { type: "holes"; expected: number; actual: number }
  | { type: "template"; expected: string; actual: string }
  | { type: "ball-skin"; expected: string };

export function evaluateSpecAgainstPrompt(
  prompt: string,
  requirements: RequirementList,
  spec: GameSpec,
) {
  const failures: EvaluationFailure[] = [];

  if (spec.template !== requirements.gameType) {
    failures.push({
      type: "template",
      expected: requirements.gameType,
      actual: spec.template,
    });
  }

  const exclusions = requirements.exclusions.map((item) => item.toLowerCase());
  exclusions.forEach((term) => {
    const hasEntity = spec.entities.some((entity) => entity.type.toLowerCase().includes(term));
    if (hasEntity) {
      failures.push({ type: "exclude", term });
    }
  });

  if (requirements.gameType === "mini_golf") {
    const expectedHoles = requirements.counts.holes ?? 1;
    const actualHoles = spec.entities.filter((entity) => entity.type === "hole").length;
    if (actualHoles !== expectedHoles) {
      failures.push({ type: "holes", expected: expectedHoles, actual: actualHoles });
    }

    const ball = spec.entities.find((entity) => entity.type === "golf_ball");
    if (ball) {
      const expectedIconId = resolveIconId({
        semantic: requirements.theme.skin,
        role: "ball",
        palette: requirements.theme.palette,
        mood: requirements.theme.mood,
      });
      if (ball.sprite.iconId !== expectedIconId) {
        failures.push({ type: "ball-skin", expected: requirements.theme.skin });
      }
    }
  }

  return { pass: failures.length === 0, failures };
}
