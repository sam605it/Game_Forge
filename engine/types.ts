import type { GameSpecV1 } from "@/types";
import type { ControlScheme, EntityKind, RuleType, WorldMode } from "./capabilities";

export type Intent = {
  templateId: string;
  modifiers: Record<string, string | number | boolean>;
  constraints: {
    include?: string[];
    exclude?: string[];
  };
  counts: Record<string, number>;
  difficulty: "easy" | "medium" | "hard";
  pace: "slow" | "medium" | "fast";
  themeTags: string[];
};

export type RequiredEntity = {
  kind: EntityKind;
  tag?: string;
};

export type TemplateDefinition = {
  id: string;
  label: string;
  worldMode: WorldMode;
  requiredEntities: RequiredEntity[];
  requiredControls: ControlScheme[];
  requiredRules: RuleType[];
  allowedModifiers: string[];
  defaultParams: Record<string, unknown>;
  buildBaseSpec: (seed: number) => GameSpecV1;
  applyModifiers: (spec: GameSpecV1, intent: Intent, seed: number) => GameSpecV1;
};

export type CompilerOptions = {
  apiKey?: string;
  model?: string;
  seed?: number;
  useAI?: boolean;
};

export type CompilerResult = {
  spec: GameSpecV1;
  intent: Intent;
  debug: string;
};
