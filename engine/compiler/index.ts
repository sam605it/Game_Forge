import type { CompilerOptions, CompilerResult } from "@/engine/types";
import { forgeGame } from "@/engine/forge/forgeGame";

const hashPrompt = (prompt: string) => {
  let hash = 0;
  for (let i = 0; i < prompt.length; i += 1) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

export const compilePrompt = async (prompt: string, options: CompilerOptions = {}): Promise<CompilerResult> => {
  const seed = options.seed ?? hashPrompt(prompt);
  const forged = await forgeGame(prompt, { ...options, seed });
  const debug = `template=${forged.templateId} seed=${seed}`;
  return {
    spec: forged.spec,
    intent: {
      prompt,
      templateId: forged.templateId,
      category: forged.params.category,
      modifiers: {},
      constraints: {},
      counts: {
        enemy: forged.params.counts.enemies,
        hazard: forged.params.counts.obstacles,
        pickup: forged.params.counts.pickups,
      },
      difficulty: forged.params.difficulty >= 4 ? "hard" : forged.params.difficulty <= 2 ? "easy" : "medium",
      pace: "medium",
      themeTags: forged.params.themeTags,
    },
    debug,
    templateId: forged.templateId,
    fallbackUsed: forged.fallbackUsed,
    validationErrors: [],
  };
};
