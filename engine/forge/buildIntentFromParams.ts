import type { Intent } from "@/engine/types";
import type { DesignParams } from "@/engine/forge/designParamsSchema";
import { classifyCategory, extractThemeTags } from "@/engine/intent/categoryClassifier";
import { resolveTemplateIdForCategory } from "@/engine/forge/templateRouting";

const normalizeTerm = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "");

const extractConstraints = (prompt: string) => {
  const excludes = new Set<string>();
  const matches = prompt.toLowerCase().matchAll(/\b(?:without|no|exclude|excluding|avoid)\s+([^,.]+)/gi);
  for (const match of matches) {
    const phrase = match[1] ?? "";
    phrase
      .split(/,| and | or /gi)
      .map((part) => normalizeTerm(part))
      .filter(Boolean)
      .forEach((term) => {
        excludes.add(term);
        if (term.endsWith("s")) {
          excludes.add(term.slice(0, -1));
        } else {
          excludes.add(`${term}s`);
        }
      });
  }
  return { exclude: Array.from(excludes) };
};

const mapDifficulty = (difficulty: number): Intent["difficulty"] => {
  if (difficulty <= 2) return "easy";
  if (difficulty >= 4) return "hard";
  return "medium";
};

const mapPace = (levelStyle: DesignParams["levelStyle"]): Intent["pace"] => {
  switch (levelStyle) {
    case "lanes":
      return "fast";
    case "maze":
      return "slow";
    default:
      return "medium";
  }
};

export const buildIntentFromParams = (prompt: string, params: DesignParams): Intent => {
  const category = params.category ?? classifyCategory(prompt);
  const templateId = resolveTemplateIdForCategory(category);
  const themeTags = Array.from(new Set([...params.themeTags, ...extractThemeTags(prompt)])).slice(0, 5);

  return {
    prompt,
    templateId,
    category,
    modifiers: {},
    constraints: extractConstraints(prompt),
    counts: {
      enemy: params.counts.enemies,
      hazard: params.counts.obstacles,
      pickup: params.counts.pickups,
    },
    difficulty: mapDifficulty(params.difficulty),
    pace: mapPace(params.levelStyle),
    themeTags,
  };
};
