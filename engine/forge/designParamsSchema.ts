import { z } from "zod";
import type { infer as ZodInfer } from "zod";
import type { Category } from "@/engine/categories";
import { CATEGORIES } from "@/engine/categories";

export const DESIGN_PARAMS_SCHEMA = z.object({
  category: z.enum(CATEGORIES),
  themeTags: z.array(z.string()).max(12),
  difficulty: z.number().min(1).max(5),
  mode: z.enum(["reach_goal", "survive", "score"]),
  durationSec: z.number().min(10).max(180),
  counts: z.object({
    enemies: z.number().min(0).max(40),
    obstacles: z.number().min(0).max(40),
    pickups: z.number().min(0).max(40),
  }),
  levelStyle: z.enum(["open", "maze", "rooms", "lanes"]),
}).strict();

export type DesignParams = ZodInfer<typeof DESIGN_PARAMS_SCHEMA>;

export const fallbackDesignParams = (category: Category): DesignParams => ({
  category,
  themeTags: [],
  difficulty: 3,
  mode: "reach_goal",
  durationSec: 45,
  counts: { enemies: 4, obstacles: 6, pickups: 4 },
  levelStyle: "open",
});

export const validateDesignParams = (
  input: unknown,
  category: Category,
): { ok: boolean; value: DesignParams; errors: string[] } => {
  const parsed = DESIGN_PARAMS_SCHEMA.safeParse(input);
  if ("error" in parsed) {
    const fallback = fallbackDesignParams(category);
    const errors = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
    return {
      ok: false,
      value: fallback,
      errors,
    };
  }

  return { ok: true, value: parsed.data, errors: [] };
};
