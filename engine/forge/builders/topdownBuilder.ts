import type { DesignParams } from "@/engine/forge/designParamsSchema";
import { TEMPLATE_MAP } from "@/engine/templates";
import { buildIntentFromParams } from "@/engine/forge/buildIntentFromParams";
import { resolveTemplateIdForCategory } from "@/engine/forge/templateRouting";
import type { GameSpecV1 } from "@/types";
import { applyTemplate } from "@/engine/compiler/applyTemplate";

export const buildTopdownSpec = (prompt: string, params: DesignParams, seed: number): { spec: GameSpecV1; templateId: string } => {
  const templateId = resolveTemplateIdForCategory(params.category);
  const template = TEMPLATE_MAP.get(templateId) ?? TEMPLATE_MAP.get("dodge_arena");
  if (!template) {
    const fallback = TEMPLATE_MAP.get("dodge_arena")!;
    return { spec: fallback.buildBaseSpec(seed), templateId: fallback.id };
  }
  const intent = buildIntentFromParams(prompt, params);
  const { spec } = applyTemplate({ ...intent, templateId: template.id }, seed);
  return { spec, templateId: template.id };
};
