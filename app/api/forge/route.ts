import { NextResponse } from "next/server";
import type { GameSpecV1 } from "@/types";
import { systemPrompt } from "@/lib/ai/systemPrompt";
import { buildPromptFallbackSpec, generateMiniGolfSpec, sanitizeSpecForPrompt, shouldUseMiniGolf } from "@/lib/ai/promptFallback";
import { SUPPORTED_CONTROLS, SUPPORTED_ENTITY_TYPES, SUPPORTED_RULES, SUPPORTED_SHAPES } from "@/lib/runtime/capabilities";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/responses";
const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

const gameSpecSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    category: {
      type: "string",
      enum: [
        "sports",
        "simulation",
        "platforming",
        "puzzle",
        "word_trivia",
        "rhythm_music",
        "arcade",
        "action",
        "racing",
        "shooter",
        "strategy",
        "party_social",
      ],
    },
    description: { type: "string" },
    assets: { type: "array", items: { type: "string" } },
    world: {
      type: "object",
      additionalProperties: false,
      properties: {
        size: {
          type: "object",
          additionalProperties: false,
          properties: { width: { type: "number" }, height: { type: "number" } },
          required: ["width", "height"],
        },
        physics: {
          type: "object",
          additionalProperties: false,
          properties: {
            gravity: { type: "array", items: { type: "number" }, minItems: 2, maxItems: 2 },
            friction: { type: "number" },
            restitution: { type: "number" },
            timeStep: { type: "number" },
          },
          required: ["gravity", "friction", "restitution", "timeStep"],
        },
        camera: {
          type: "object",
          additionalProperties: false,
          properties: {
            mode: { type: "string", enum: ["static", "follow"] },
            targetId: { type: "string" },
          },
          required: ["mode"],
        },
      },
      required: ["size", "physics", "camera"],
    },
    entities: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          kind: { type: "string", enum: [...SUPPORTED_ENTITY_TYPES] },
          position: {
            type: "object",
            additionalProperties: false,
            properties: { x: { type: "number" }, y: { type: "number" } },
            required: ["x", "y"],
          },
          velocity: {
            type: "object",
            additionalProperties: false,
            properties: { x: { type: "number" }, y: { type: "number" } },
            required: ["x", "y"],
          },
          size: {
            type: "object",
            additionalProperties: false,
            properties: { width: { type: "number" }, height: { type: "number" } },
            required: ["width", "height"],
          },
          rotation: { type: "number" },
          render: {
            type: "object",
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["shape", "emoji"] },
              shape: { type: "string", enum: [...SUPPORTED_SHAPES] },
              emoji: { type: "string" },
              color: { type: "string" },
            },
            required: ["type"],
          },
          collider: {
            type: "object",
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["rect", "circle"] },
              isStatic: { type: "boolean" },
              isSensor: { type: "boolean" },
            },
            required: ["type", "isStatic"],
          },
          tags: { type: "array", items: { type: "string" } },
        },
        required: ["id", "kind", "position", "velocity", "size", "rotation", "render", "collider"],
      },
    },
    rules: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: {
            type: "string",
            enum: [...SUPPORTED_RULES],
          },
          params: { type: "object" },
        },
        required: ["type", "params"],
      },
    },
    controls: {
      type: "object",
      additionalProperties: false,
      properties: {
        scheme: { type: "string", enum: [...SUPPORTED_CONTROLS] },
        mappings: {
          type: "object",
          additionalProperties: false,
          properties: {
            up: { type: "array", items: { type: "string" } },
            down: { type: "array", items: { type: "string" } },
            left: { type: "array", items: { type: "string" } },
            right: { type: "array", items: { type: "string" } },
            action: { type: "array", items: { type: "string" } },
            reset: { type: "array", items: { type: "string" } },
          },
        },
      },
      required: ["scheme", "mappings"],
    },
    ui: {
      type: "object",
      additionalProperties: false,
      properties: {
        hud: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            properties: {
              type: { type: "string", enum: ["score", "timer", "message"] },
              label: { type: "string" },
              valueKey: { type: "string" },
            },
            required: ["type"],
          },
        },
        messages: {
          type: "object",
          additionalProperties: false,
          properties: {
            win: { type: "string" },
            lose: { type: "string" },
            start: { type: "string" },
          },
        },
      },
      required: ["hud"],
    },
  },
  required: [
    "id",
    "title",
    "category",
    "description",
    "assets",
    "world",
    "entities",
    "rules",
    "controls",
    "ui",
  ],
};

const validateSpec = (spec: GameSpecV1) => {
  if (!spec.title || !spec.entities?.length) {
    throw new Error("Invalid spec generated.");
  }
  const hasPlayer = spec.entities.some((entity) => entity.tags?.includes("player"));
  if (!hasPlayer) {
    throw new Error("Spec missing player entity.");
  }
  if (!SUPPORTED_CONTROLS.includes(spec.controls.scheme)) {
    throw new Error("Unsupported control scheme.");
  }
  for (const entity of spec.entities) {
    if (!SUPPORTED_ENTITY_TYPES.includes(entity.kind)) {
      throw new Error(`Unsupported entity type: ${entity.kind}`);
    }
    if (entity.render.type === "shape" && entity.render.shape && !SUPPORTED_SHAPES.includes(entity.render.shape)) {
      throw new Error(`Unsupported shape: ${entity.render.shape}`);
    }
  }
  for (const rule of spec.rules) {
    if (!SUPPORTED_RULES.includes(rule.type)) {
      throw new Error(`Unsupported rule: ${rule.type}`);
    }
  }
};

const extractOutputText = (payload: unknown) => {
  if (!payload || typeof payload !== "object") {
    return "";
  }

  const typedPayload = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string; json?: unknown; type?: string }> }>;
  };

  if (typedPayload.output_text) return typedPayload.output_text;
  const content = typedPayload.output?.[0]?.content ?? [];
  const textPart = content.find((part) => part.type === "output_text" || typeof part.text === "string");
  if (typeof textPart?.text === "string") return textPart.text;
  if (textPart?.json) return JSON.stringify(textPart.json);
  return "";
};

export async function POST(request: Request) {
  let prompt = "";
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    const body = (await request.json()) as { prompt?: string };
    prompt = body.prompt ?? "";
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
    }

    if (shouldUseMiniGolf(prompt)) {
      return NextResponse.json(generateMiniGolfSpec(prompt));
    }

    if (!apiKey) {
      return NextResponse.json(buildPromptFallbackSpec(prompt));
    }

    const response = await fetch(
      OPENAI_ENDPOINT,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          input: [
            { role: "system", content: systemPrompt },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "game_spec_v1",
              schema: gameSpecSchema,
              strict: true,
            },
          },
        }),
      },
    );

    if (!response.ok) {
      return NextResponse.json(buildPromptFallbackSpec(prompt));
    }

    const payload = await response.json();
    const outputText = extractOutputText(payload);
    if (!outputText) {
      return NextResponse.json(buildPromptFallbackSpec(prompt));
    }
    let spec: GameSpecV1;
    try {
      spec = JSON.parse(outputText) as GameSpecV1;
    } catch {
      return NextResponse.json(buildPromptFallbackSpec(prompt));
    }
    const sanitized = sanitizeSpecForPrompt(spec, prompt);
    if (shouldUseMiniGolf(prompt)) {
      const hasCup = sanitized.entities.some((entity) => entity.kind === "cup" || entity.tags?.includes("goal"));
      const hasDragControls = sanitized.controls.scheme === "mouse_drag_shot";
      const hasStrokes = sanitized.rules.some((rule) => rule.type === "strokes");
      const hasWin = sanitized.rules.some((rule) => rule.type === "win_on_goal");
      if (!hasCup || !hasDragControls || !hasStrokes || !hasWin) {
        return NextResponse.json(generateMiniGolfSpec(prompt));
      }
    }
    try {
      validateSpec(sanitized);
      return NextResponse.json(sanitized);
    } catch {
      if (shouldUseMiniGolf(prompt)) {
        return NextResponse.json(generateMiniGolfSpec(prompt));
      }
      return NextResponse.json(buildPromptFallbackSpec(prompt));
    }
  } catch (error) {
    const fallback = buildPromptFallbackSpec(prompt || "Forged fallback");
    return NextResponse.json(fallback);
  }
}
