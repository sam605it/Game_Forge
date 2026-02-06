import { NextResponse } from "next/server";
import { parseGameSpecV1 } from "@/app/gamespec/guards";
import { CATEGORIES, type Category } from "@/app/gamespec/types";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";
const GEMINI_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

type GenerateRequest = {
  prompt?: string;
  categoryHint?: Category;
  seed?: number;
};

const SYSTEM_PROMPT = `You generate GameSpec v1 JSON only.
Return only strict JSON with no markdown.
Include exactly these top-level sections: metadata, world, entities, components, rules, assets, constraints.
metadata.version must be "1.0".
metadata.category must be one of: sports,puzzle,arcade,action,racing,platforming,shooter,strategy,simulation,rhythm_music,word_trivia,party_social.
metadata.mechanics must be a non-empty array of strings.
Always include at least one controllable entity with InputController.
Always include at least one Goal + at least one rule that can end a round.
assets values must be placeholder IDs like sprite:foo and sfx:foo.
`;

const safeJsonParse = (text: string): unknown => {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  return JSON.parse(cleaned);
};

async function callOpenAI(messages: Array<{ role: "system" | "user"; content: string }>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false as const, errors: ["OPENAI_API_KEY is not set."] };
  }

  const response = await fetch(OPENAI_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return {
      ok: false as const,
      errors: [`OpenAI request failed (${response.status}): ${errText.slice(0, 400)}`],
    };
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    return { ok: false as const, errors: ["OpenAI returned an empty response."] };
  }

  return { ok: true as const, content };
}

async function callGemini(messages: Array<{ role: "system" | "user"; content: string }>) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { ok: false as const, errors: ["GEMINI_API_KEY is not set."] };
  }

  const combinedPrompt = messages
    .map((message) => `${message.role.toUpperCase()}:\n${message.content}`)
    .join("\n\n");

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: combinedPrompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    return {
      ok: false as const,
      errors: [`Gemini request failed (${response.status}): ${errText.slice(0, 400)}`],
    };
  }

  const payload = await response.json();
  const content = payload?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof content !== "string") {
    return { ok: false as const, errors: ["Gemini returned an empty response."] };
  }

  return { ok: true as const, content };
}

async function callModel(messages: Array<{ role: "system" | "user"; content: string }>) {
  if (process.env.GEMINI_API_KEY) {
    return callGemini(messages);
  }

  return callOpenAI(messages);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json({ ok: false, errors: ["prompt is required."] }, { status: 400 });
    }

    const categoryHint =
      typeof body.categoryHint === "string" &&
      (CATEGORIES as readonly string[]).includes(body.categoryHint)
        ? body.categoryHint
        : "sports";

    const userInstruction = `User prompt: ${prompt}
Category hint: ${categoryHint}
Seed: ${typeof body.seed === "number" ? body.seed : "none"}

If category is obvious from prompt, infer it.
If not obvious, use category hint.
If still unsure, default to sports.
Return only JSON.`;

    const first = await callModel([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userInstruction },
    ]);

    if (!first.ok) {
      return NextResponse.json({ ok: false, errors: first.errors }, { status: 500 });
    }

    let parsed: unknown;
    try {
      parsed = safeJsonParse(first.content);
    } catch {
      return NextResponse.json({ ok: false, errors: ["Model response was not valid JSON."] }, { status: 422 });
    }

    const validated = parseGameSpecV1(parsed);
    if (validated.ok === true) {
      return NextResponse.json({ ok: true, spec: validated.value });
    }

    const validationErrors = validated.errors;
    const repairPrompt = `Fix this JSON so it passes GameSpec v1 validation.
Validation errors:\n- ${validationErrors.join("\n- ")}

Return corrected JSON only.`;

    const second = await callModel([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `${userInstruction}\n\nOriginal JSON:\n${JSON.stringify(parsed)}` },
      { role: "user", content: repairPrompt },
    ]);

    if (!second.ok) {
      return NextResponse.json({ ok: false, errors: second.errors }, { status: 500 });
    }

    try {
      const repaired = safeJsonParse(second.content);
      const repairedValidated = parseGameSpecV1(repaired);
      if (repairedValidated.ok === true) {
        return NextResponse.json({ ok: true, spec: repairedValidated.value });
      }

      return NextResponse.json(
        { ok: false, errors: repairedValidated.errors },
        { status: 422 },
      );
    } catch {
      return NextResponse.json(
        { ok: false, errors: ["Repair response was not valid JSON."] },
        { status: 422 },
      );
    }
  } catch {
    return NextResponse.json({ ok: false, errors: ["Unexpected server error."] }, { status: 500 });
  }
}
