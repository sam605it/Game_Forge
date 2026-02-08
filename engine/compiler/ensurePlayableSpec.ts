import type { TemplateDefinition } from "@/engine/types";
import type { GameSpecV1 } from "@/types";
import { normalizeSpec } from "@/lib/runtime/normalizeSpec";
import { validatePlayableSpec } from "@/lib/runtime/validatePlayableSpec";

export type PlayableResult = {
  spec: GameSpecV1;
  fallbackUsed: boolean;
  errors: string[];
};

export const ensurePlayableSpec = (spec: GameSpecV1, template: TemplateDefinition, seed: number): PlayableResult => {
  const normalized = normalizeSpec(spec);
  const validation = validatePlayableSpec(normalized);
  if (validation.ok) {
    return { spec: normalized, fallbackUsed: false, errors: [] };
  }

  const fallbackSpec = normalizeSpec(template.buildBaseSpec(seed));
  return { spec: fallbackSpec, fallbackUsed: true, errors: validation.errors };
};
