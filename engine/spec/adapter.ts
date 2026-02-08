import type { GameSpecV1 } from "@/types";
import type { Category } from "@/engine/categories";
import { TEMPLATE_MAP } from "@/engine/templates";
import type { TemplateDefinition } from "@/engine/types";
import { normalizeSpec } from "@/lib/runtime/normalizeSpec";
import { validatePlayableSpec } from "@/lib/runtime/validatePlayableSpec";

const CATEGORY_TEMPLATE_MAP: Record<Category, string> = {
  sports: "minigolf",
  racing: "racing_time_trial",
  action: "dodge_arena",
  shooter: "topdown_shooter",
  platformer: "platformer",
  puzzle: "grid_puzzle",
  strategy: "tower_defense",
  arcade: "dodge_arena",
  simulation: "farming_sim",
  rhythm_music: "rhythm_tap",
  word_trivia: "trivia_quiz",
  party_social: "capture_flag",
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const hashSeed = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const resolveTemplateFromCategory = (category?: Category): TemplateDefinition => {
  const templateId = category ? CATEGORY_TEMPLATE_MAP[category] : "dodge_arena";
  return TEMPLATE_MAP.get(templateId) ?? TEMPLATE_MAP.get("dodge_arena")!;
};

export const adaptToRenderer = (
  input: unknown,
  template: TemplateDefinition,
  seed: number,
  prompt: string,
): GameSpecV1 => {
  const fallback = normalizeSpec(template.buildBaseSpec(seed));

  try {
    if (!isRecord(input)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[adapter] Non-object spec input. Using fallback.");
      }
      return fallback;
    }

    const candidate = normalizeSpec(input as GameSpecV1);
    const validation = validatePlayableSpec(candidate);
    if (!validation.ok) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[adapter] Spec failed validation, falling back.", {
          prompt,
          errors: validation.errors,
        });
      }
      return fallback;
    }

    return candidate;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[adapter] Exception while adapting spec. Falling back.", error);
    }
    return fallback;
  }
};

export const adaptToRendererFromUnknown = (input: unknown, prompt: string): GameSpecV1 => {
  const category = isRecord(input) && typeof input.category === "string" ? (input.category as Category) : undefined;
  const template = resolveTemplateFromCategory(category);
  const seed = isRecord(input) && typeof input.id === "string" ? hashSeed(input.id) : hashSeed(prompt);
  return adaptToRenderer(input, template, seed, prompt);
};
