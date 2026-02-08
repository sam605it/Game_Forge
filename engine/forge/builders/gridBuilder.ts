import type { DesignParams } from "@/engine/forge/designParamsSchema";
import { TEMPLATE_MAP } from "@/engine/templates";
import { buildIntentFromParams } from "@/engine/forge/buildIntentFromParams";
import type { GameSpecV1 } from "@/types";
import { applyTemplate } from "@/engine/compiler/applyTemplate";

export const buildGridSpec = (prompt: string, params: DesignParams, seed: number): { spec: GameSpecV1; templateId: string } => {
  const template = TEMPLATE_MAP.get("grid_puzzle") ?? TEMPLATE_MAP.get("trivia_quiz");
  if (!template) {
    const fallback = TEMPLATE_MAP.get("dodge_arena")!;
    return { spec: fallback.buildBaseSpec(seed), templateId: fallback.id };
  }
  const intent = buildIntentFromParams(prompt, params);
  const { spec } = applyTemplate({ ...intent, templateId: template.id }, seed);
  return { spec, templateId: template.id };
};
