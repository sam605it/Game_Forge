import type { CompilerOptions, CompilerResult } from "@/engine/types";
import { parseIntent } from "./parseIntent";
import { applyTemplate } from "./applyTemplate";
import { validateRepair } from "./validateRepair";

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
  const intent = await parseIntent(prompt, options);
  const { spec, template } = applyTemplate(intent, seed);
  const repaired = validateRepair(spec, intent, template, seed);
  const debug = `template=${template.id} seed=${seed} difficulty=${intent.difficulty} pace=${intent.pace}`;
  return { spec: repaired, intent, debug };
};
