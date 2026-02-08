import type { CompilerOptions } from "@/engine/types";
import { classifyCategory } from "@/engine/intent/categoryClassifier";
import type { DesignParams } from "@/engine/forge/designParamsSchema";
import { fallbackDesignParams, validateDesignParams } from "@/engine/forge/designParamsSchema";
import { parseStrictJSONObject } from "@/lib/ai/parseStrictJSONObject";
import { resolveTemplateKind } from "@/engine/forge/templateRouting";
import { buildTopdownSpec } from "@/engine/forge/builders/topdownBuilder";
import { buildPlatformerSpec } from "@/engine/forge/builders/platformerBuilder";
import { buildGridSpec } from "@/engine/forge/builders/gridBuilder";
import { buildPhysicsSpec } from "@/engine/forge/builders/physicsBuilder";
import { buildRhythmSpec } from "@/engine/forge/builders/rhythmBuilder";
import { TEMPLATE_MAP } from "@/engine/templates";
import { createEntity } from "@/engine/templates/utils";
import { validateRepair } from "@/engine/compiler/validateRepair";
import { adaptToRenderer } from "@/engine/spec/adapter";
import type { GameSpecV1 } from "@/types";
import { buildIntentFromParams } from "@/engine/forge/buildIntentFromParams";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";
const OPENAI_TIMEOUT_MS = 8000;

const hashSeed = (prompt: string) => {
  let hash = 0;
  for (let i = 0; i < prompt.length; i += 1) {
    hash = (hash << 5) - hash + prompt.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs: number) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
};

const buildPrompt = (prompt: string, category: string) => `Return JSON only for DesignParams.
Schema:
{
  "category": "${category}",
  "themeTags": string[],
  "difficulty": 1-5,
  "mode": "reach_goal"|"survive"|"score",
  "durationSec": 10-180,
  "counts": { "enemies": number, "obstacles": number, "pickups": number },
  "levelStyle": "open"|"maze"|"rooms"|"lanes"
}
Use the category provided. Do not include extra fields.
User prompt: ${prompt}`;

const callDesignParams = async (prompt: string, category: string, options: CompilerOptions) => {
  const apiKey = options.apiKey;
  if (!apiKey) return { ok: false as const, params: null };

  const response = await fetchWithTimeout(
    OPENAI_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: options.model ?? "gpt-4o-mini",
        input: [{ role: "system", content: "Return ONLY valid JSON." }, { role: "user", content: buildPrompt(prompt, category) }],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "design_params",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                category: { type: "string" },
                themeTags: { type: "array", items: { type: "string" } },
                difficulty: { type: "number" },
                mode: { type: "string" },
                durationSec: { type: "number" },
                counts: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    enemies: { type: "number" },
                    obstacles: { type: "number" },
                    pickups: { type: "number" },
                  },
                  required: ["enemies", "obstacles", "pickups"],
                },
                levelStyle: { type: "string" },
              },
              required: ["category", "themeTags", "difficulty", "mode", "durationSec", "counts", "levelStyle"],
            },
            strict: true,
          },
        },
        max_output_tokens: 400,
      }),
    },
    OPENAI_TIMEOUT_MS,
  );

  if (!response.ok) {
    return { ok: false as const, params: null };
  }

  const payload = await response.json();
  const content = payload?.output_text ?? payload?.output?.[0]?.content?.[0]?.text;
  if (typeof content !== "string") return { ok: false as const, params: null };
  try {
    const parsed = parseStrictJSONObject(content) as DesignParams;
    return { ok: true as const, params: parsed };
  } catch {
    return { ok: false as const, params: null };
  }
};

export type ForgeResult = {
  spec: GameSpecV1;
  templateId: string;
  params: DesignParams;
  fallbackUsed: boolean;
};

export const forgeGame = async (prompt: string, options: CompilerOptions = {}): Promise<ForgeResult> => {
  const normalizedPrompt = prompt.trim() || "Forged mini-game";
  const seed = options.seed ?? hashSeed(normalizedPrompt);
  const category = classifyCategory(normalizedPrompt);

  const aiParams = await callDesignParams(normalizedPrompt, category, options);
  const paramsValidation = validateDesignParams(aiParams.params ?? fallbackDesignParams(category), category);
  const params = paramsValidation.value;

  const templateKind = resolveTemplateKind(category);
  const builder =
    templateKind === "platformer"
      ? buildPlatformerSpec
      : templateKind === "grid"
        ? buildGridSpec
        : templateKind === "physics"
          ? buildPhysicsSpec
          : templateKind === "rhythm"
            ? buildRhythmSpec
            : buildTopdownSpec;

  let spec: GameSpecV1;
  let templateId: string;

  try {
    const built = builder(normalizedPrompt, params, seed);
    spec = built.spec;
    templateId = built.templateId;
  } catch {
    const fallbackTemplate = TEMPLATE_MAP.get("dodge_arena")!;
    spec = fallbackTemplate.buildBaseSpec(seed);
    templateId = fallbackTemplate.id;
  }

  const template = TEMPLATE_MAP.get(templateId) ?? TEMPLATE_MAP.get("dodge_arena")!;
  const intent = buildIntentFromParams(normalizedPrompt, paramsValidation.value);
  const repaired = validateRepair(spec, intent, template, seed);
  const withMode = applyModeRules(repaired, params);
  const adapted = adaptToRenderer(withMode, template, seed, normalizedPrompt);

  return {
    spec: adapted,
    templateId: template.id,
    params,
    fallbackUsed: !aiParams.ok,
  };
};

const applyModeRules = (spec: GameSpecV1, params: DesignParams): GameSpecV1 => {
  const updated: GameSpecV1 = {
    ...spec,
    rules: [...spec.rules],
    ui: { ...spec.ui, hud: [...spec.ui.hud] },
    entities: [...spec.entities],
  };

  const duration = params.durationSec;
  const ensureRule = (type: GameSpecV1["rules"][number]["type"], paramsObj: Record<string, any>) => {
    const existing = updated.rules.find((rule) => rule.type === type);
    if (existing) {
      existing.params = { ...existing.params, ...paramsObj };
      return;
    }
    updated.rules.push({ type, params: paramsObj });
  };

  if (params.mode === "reach_goal") {
    ensureGoalEntity(updated);
    ensureRule("win_on_goal", { targetTag: "goal", maxSpeed: 999 });
    ensureRule("lose_on_timer", { duration });
    if (!updated.ui.hud.some((item) => item.type === "timer")) {
      updated.ui.hud.push({ type: "timer", label: "Time" });
    }
  }

  if (params.mode === "score") {
    ensureRule("score", { targetTag: "pickup", amount: 1 });
    ensureRule("win_on_score", { targetScore: Math.max(1, params.counts.pickups) });
    ensureRule("lose_on_timer", { duration });
    if (!updated.ui.hud.some((item) => item.type === "score")) {
      updated.ui.hud.push({ type: "score", label: "Score", valueKey: "score" });
    }
    if (!updated.ui.hud.some((item) => item.type === "timer")) {
      updated.ui.hud.push({ type: "timer", label: "Time" });
    }
  }

  if (params.mode === "survive") {
    ensureRule("timer", { duration });
    ensureRule("lose_on_timer", { duration });
    ensureRule("win_on_score", { targetScore: 1 });
    ensureRule("score", { targetTag: "pickup", amount: 1 });
    if (!updated.ui.hud.some((item) => item.type === "timer")) {
      updated.ui.hud.push({ type: "timer", label: "Time" });
    }
  }

  return updated;
};

const ensureGoalEntity = (spec: GameSpecV1) => {
  const hasGoal = spec.entities.some((entity) => entity.kind === "goal" || entity.tags?.includes("goal"));
  if (hasGoal) return;
  const width = spec.world.size.width;
  const height = spec.world.size.height;
  spec.entities.push(
    createEntity({
      id: "goal",
      kind: "goal",
      x: width - 120,
      y: height / 2,
      width: 32,
      height: 32,
      color: "#22c55e",
      shape: "circle",
      collider: { type: "circle", isStatic: true, isSensor: true },
      tags: ["goal"],
    }),
  );
};
