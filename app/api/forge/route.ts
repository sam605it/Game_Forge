import OpenAI from "openai";
import { NextResponse } from "next/server";
import type { GameSpecV1 } from "@/types";
import { systemPrompt } from "@/lib/ai/systemPrompt";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
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
          kind: { type: "string" },
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
              shape: { type: "string", enum: ["rect", "circle"] },
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
            enum: ["score", "timer", "collect", "avoid", "goal", "laps"],
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
        scheme: { type: "string", enum: ["keyboard", "touch", "hybrid"] },
        mappings: {
          type: "object",
          additionalProperties: false,
          properties: {
            up: { type: "array", items: { type: "string" } },
            down: { type: "array", items: { type: "string" } },
            left: { type: "array", items: { type: "string" } },
            right: { type: "array", items: { type: "string" } },
            action: { type: "array", items: { type: "string" } },
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
};

export async function POST(request: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "Missing OpenAI API key." }, { status: 500 });
    }

    const { prompt } = (await request.json()) as { prompt?: string };
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
    }

    const response = await client.responses.create({
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
    });

    const outputText = response.output_text ?? response.output?.[0]?.content?.[0]?.text ?? "";
    const spec = JSON.parse(outputText) as GameSpecV1;
    validateSpec(spec);
    return NextResponse.json(spec);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
