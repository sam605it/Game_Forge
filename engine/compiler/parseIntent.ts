import type { CompilerOptions, Intent } from "@/engine/types";
import { TEMPLATE_MAP } from "@/engine/templates";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";

const DEFAULT_INTENT: Intent = {
  templateId: "dodge_arena",
  modifiers: {},
  constraints: { include: [], exclude: [] },
  counts: {},
  difficulty: "medium",
  pace: "medium",
  themeTags: [],
};

const TEMPLATE_KEYWORDS: Array<{ id: string; keywords: string[] }> = [
  { id: "minigolf", keywords: ["golf", "mini golf", "putt"] },
  { id: "topdown_shooter", keywords: ["shooter", "shoot", "blaster"] },
  { id: "dodge_arena", keywords: ["dodge", "arena", "avoid"] },
  { id: "runner", keywords: ["runner", "endless", "sprint"] },
  { id: "platformer", keywords: ["platformer", "jump", "platform"] },
  { id: "maze_escape", keywords: ["maze", "labyrinth"] },
  { id: "treasure_collect", keywords: ["treasure", "collect", "gems", "relic"] },
  { id: "survival", keywords: ["survival", "survive"] },
  { id: "breakout", keywords: ["breakout", "block"] },
  { id: "space_lander", keywords: ["lander", "landing", "space"] },
  { id: "tower_defense", keywords: ["tower", "defense"] },
  { id: "pinball", keywords: ["pinball"] },
  { id: "racing_time_trial", keywords: ["race", "racing", "time trial"] },
  { id: "grid_puzzle", keywords: ["grid", "puzzle"] },
  { id: "rhythm_tap", keywords: ["rhythm", "music", "beat"] },
  { id: "trivia_quiz", keywords: ["trivia", "quiz"] },
  { id: "city_builder", keywords: ["city", "builder"] },
  { id: "farming_sim", keywords: ["farm", "farming"] },
  { id: "fishing_hunt", keywords: ["fish", "fishing"] },
];

const THEME_TAGS = [
  "space",
  "forest",
  "desert",
  "ocean",
  "neon",
  "retro",
  "cyber",
  "medieval",
  "spooky",
  "winter",
  "lava",
  "jungle",
  "city",
  "ruins",
  "crystal",
];

const COUNT_MAP: Array<{ key: string; terms: string[] }> = [
  { key: "enemy", terms: ["enemy", "enemies"] },
  { key: "hazard", terms: ["hazard", "hazards", "trap", "traps"] },
  { key: "pickup", terms: ["pickup", "pickups", "relic", "relics", "gem", "gems"] },
  { key: "wall", terms: ["wall", "walls", "platform", "platforms"] },
  { key: "npc", terms: ["npc", "villager", "villagers"] },
  { key: "decor", terms: ["decor", "decoration", "trees", "rocks"] },
];

const extractJson = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return "";
  const typed = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string; json?: unknown; type?: string }> }>;
  };
  if (typed.output_text) return typed.output_text;
  const content = typed.output?.[0]?.content ?? [];
  const textPart = content.find((part) => part.type === "output_text" || typeof part.text === "string");
  if (typeof textPart?.text === "string") return textPart.text;
  if (textPart?.json) return JSON.stringify(textPart.json);
  return "";
};

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

const extractCounts = (prompt: string) => {
  const counts: Record<string, number> = {};
  for (const entry of COUNT_MAP) {
    for (const term of entry.terms) {
      const regex = new RegExp(`(\\d+)\\s+${term}`, "i");
      const match = prompt.match(regex);
      if (match) {
        counts[entry.key] = Number(match[1]);
      }
    }
  }
  return counts;
};

const extractTemplateId = (prompt: string) => {
  const lower = prompt.toLowerCase();
  for (const entry of TEMPLATE_KEYWORDS) {
    if (entry.keywords.some((keyword) => lower.includes(keyword))) {
      return entry.id;
    }
  }
  return DEFAULT_INTENT.templateId;
};

const extractDifficulty = (prompt: string): Intent["difficulty"] => {
  const lower = prompt.toLowerCase();
  if (/(hard|expert|challenging)/.test(lower)) return "hard";
  if (/(easy|chill|relax)/.test(lower)) return "easy";
  return "medium";
};

const extractPace = (prompt: string): Intent["pace"] => {
  const lower = prompt.toLowerCase();
  if (/(fast|speed|quick|intense)/.test(lower)) return "fast";
  if (/(slow|calm|relaxed)/.test(lower)) return "slow";
  return "medium";
};

const extractThemes = (prompt: string) => {
  const lower = prompt.toLowerCase();
  return THEME_TAGS.filter((tag) => lower.includes(tag));
};

const buildIntentFallback = (prompt: string): Intent => {
  const templateId = extractTemplateId(prompt);
  return {
    ...DEFAULT_INTENT,
    templateId,
    constraints: extractConstraints(prompt),
    counts: extractCounts(prompt),
    difficulty: extractDifficulty(prompt),
    pace: extractPace(prompt),
    themeTags: extractThemes(prompt),
  };
};

export const parseIntent = async (prompt: string, options: CompilerOptions = {}): Promise<Intent> => {
  const useAI = options.useAI ?? Boolean(options.apiKey);
  if (!useAI || !options.apiKey) {
    return buildIntentFallback(prompt);
  }

  const systemPrompt = `You extract intent for a mini-game compiler. Return strict JSON only.\n\nSchema: {\n  "templateId": string,\n  "modifiers": object,\n  "constraints": { "include": string[], "exclude": string[] },\n  "counts": object,\n  "difficulty": "easy"|"medium"|"hard",\n  "pace": "slow"|"medium"|"fast",\n  "themeTags": string[]\n}\n\nUse templateId from this list: ${Array.from(TEMPLATE_MAP.keys()).join(", ")}.\nIf unsure, choose "dodge_arena". Do not add extra fields.`;

  try {
    const response = await fetch(OPENAI_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        model: options.model ?? "gpt-4o-mini",
        input: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "intent_schema",
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                templateId: { type: "string" },
                modifiers: { type: "object" },
                constraints: {
                  type: "object",
                  additionalProperties: false,
                  properties: {
                    include: { type: "array", items: { type: "string" } },
                    exclude: { type: "array", items: { type: "string" } },
                  },
                },
                counts: { type: "object" },
                difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                pace: { type: "string", enum: ["slow", "medium", "fast"] },
                themeTags: { type: "array", items: { type: "string" } },
              },
              required: ["templateId", "modifiers", "constraints", "counts", "difficulty", "pace", "themeTags"],
            },
            strict: true,
          },
        },
      }),
    );

    if (!response.ok) {
      return buildIntentFallback(prompt);
    }

    const payload = await response.json();
    const jsonText = extractJson(payload);
    if (!jsonText) {
      return buildIntentFallback(prompt);
    }

    const parsed = JSON.parse(jsonText) as Intent;
    if (!parsed.templateId || !TEMPLATE_MAP.has(parsed.templateId)) {
      return buildIntentFallback(prompt);
    }

    return {
      ...DEFAULT_INTENT,
      ...parsed,
      templateId: parsed.templateId,
      modifiers: parsed.modifiers ?? {},
      constraints: parsed.constraints ?? { include: [], exclude: [] },
      counts: parsed.counts ?? {},
      themeTags: parsed.themeTags ?? [],
    };
  } catch {
    return buildIntentFallback(prompt);
  }
};
