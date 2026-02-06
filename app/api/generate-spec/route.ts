import { NextResponse } from "next/server";
import { parseGameSpecV1 } from "@/app/gamespec/guards";
import { CATEGORIES, type Category, type GameSpecV1 } from "@/app/gamespec/types";
import { CATEGORY_EXAMPLES } from "@/app/gamespec/examples";
import { PLAYBOOK_SUMMARY } from "@/app/gamespec/playbooks";
import { applyCategoryPreset } from "@/app/gamespec/presets";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

type GenerateRequest = {
  prompt?: string;
  categoryHint?: Category;
  seed?: number;
};

const SYSTEM_PROMPT = `You generate GameSpec v1 JSON only.
Return strict JSON with no markdown.
You MUST choose exactly 1 category from: sports,puzzle,arcade,action,racing,platforming,shooter,strategy,simulation,rhythm_music,word_trivia,party_social.
You MUST include non-empty mechanics and make the game feel recognizable for that category.
Include exactly top-level sections: metadata, world, entities, components, rules, assets, constraints.
metadata.version must be "1.0".
Always include at least one controllable entity with InputController.
Always include at least one Goal + at least one rule that can end a round.
assets values must be placeholder IDs like sprite:foo and sfx:foo.

Category Playbook Summary:
${PLAYBOOK_SUMMARY}`;

const safeJsonParse = (text: string): unknown => {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  return JSON.parse(cleaned);
};

const buildFallbackSpec = (categoryHint: Category, prompt: string): GameSpecV1 => {
  const lower = prompt.toLowerCase();
  const inferredCategory: Category = lower.includes("race")
    ? "racing"
    : lower.includes("shoot")
      ? "shooter"
      : lower.includes("platform") || lower.includes("jump")
        ? "platforming"
        : lower.includes("puzzle")
          ? "puzzle"
          : lower.includes("rhythm") || lower.includes("beat")
            ? "rhythm_music"
            : lower.includes("trivia") || lower.includes("quiz")
              ? "word_trivia"
              : lower.includes("tower") || lower.includes("strategy")
                ? "strategy"
                : lower.includes("sim") || lower.includes("sandbox")
                  ? "simulation"
                  : lower.includes("arcade") || lower.includes("coin")
                    ? "arcade"
                    : lower.includes("action") || lower.includes("dodge")
                      ? "action"
                      : lower.includes("party") || lower.includes("tag")
                        ? "party_social"
                        : lower.includes("golf") || lower.includes("sport")
                          ? "sports"
                          : categoryHint;

  const base = CATEGORY_EXAMPLES[inferredCategory] ?? CATEGORY_EXAMPLES[categoryHint];
  return applyCategoryPreset({
    ...base,
    metadata: { ...base.metadata, title: `${base.metadata.title} (fallback)` },
  });
};

async function callOpenAI(messages: Array<{ role: "system" | "user"; content: string }>) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { ok: false as const, errors: ["OPENAI_API_KEY is not set."], missingApiKey: true };
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
      missingApiKey: false,
    };
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    return { ok: false as const, errors: ["OpenAI returned an empty response."], missingApiKey: false };
  }

  return { ok: true as const, content };
}

function parseAndNormalize(candidate: unknown) {
  const validated = parseGameSpecV1(candidate);
  if (validated.ok !== true) return validated;
  return { ok: true as const, value: applyCategoryPreset(validated.value) };
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
Return only JSON for one category-specific, recognizable minigame.`;

    const first = await callOpenAI([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userInstruction },
    ]);

    if (!first.ok) {
      if (first.missingApiKey) {
        return NextResponse.json({ ok: true, spec: buildFallbackSpec(categoryHint, prompt), fallback: true });
      }
      return NextResponse.json({ ok: false, errors: first.errors }, { status: 500 });
    }

    let parsed: unknown;
    try {
      parsed = safeJsonParse(first.content);
    } catch {
      return NextResponse.json({ ok: false, errors: ["Model response was not valid JSON."] }, { status: 422 });
    }

    const normalized = parseAndNormalize(parsed);
    if (normalized.ok === true) {
      return NextResponse.json({ ok: true, spec: normalized.value });
    }

    const repairPrompt = `Fix this JSON so it passes GameSpec v1 validation.
Validation errors:\n- ${normalized.errors.join("\n- ")}
Ensure recognizability for the selected category according to playbook summary.
Return corrected JSON only.`;

    const second = await callOpenAI([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `${userInstruction}\n\nOriginal JSON:\n${JSON.stringify(parsed)}` },
      { role: "user", content: repairPrompt },
    ]);

    if (!second.ok) {
      return NextResponse.json({ ok: false, errors: second.errors }, { status: 500 });
    }

    try {
      const repaired = safeJsonParse(second.content);
      const repairedNormalized = parseAndNormalize(repaired);
      if (repairedNormalized.ok === true) {
        return NextResponse.json({ ok: true, spec: repairedNormalized.value });
      }
      return NextResponse.json({ ok: false, errors: repairedNormalized.errors }, { status: 422 });
    } catch {
      return NextResponse.json({ ok: false, errors: ["Repair response was not valid JSON."] }, { status: 422 });
    }
  } catch {
    return NextResponse.json({ ok: false, errors: ["Unexpected server error."] }, { status: 500 });
  }
}
