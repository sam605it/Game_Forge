import { NextResponse } from "next/server";
import type { GameSpecV1 } from "@/types";
import { compilePrompt } from "@/engine/compiler";
import { buildPromptFallbackSpec } from "@/lib/ai/promptFallback";
import { normalizeSpec } from "@/lib/runtime/normalizeSpec";

export async function POST(request: Request) {
  let prompt = "";
  try {
    const body = (await request.json()) as { prompt?: string };
    prompt = body.prompt ?? "";
    if (!prompt) {
      const fallback = normalizeSpec(buildPromptFallbackSpec("Forged fallback"));
      return NextResponse.json(fallback as GameSpecV1);
    }

    const { spec, debug } = await compilePrompt(prompt, {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL,
    });

    if (debug) {
      console.info(`[forge] ${debug}`);
    }

    return NextResponse.json(spec as GameSpecV1);
  } catch (error) {
    const fallback = normalizeSpec(buildPromptFallbackSpec(prompt || "Forged fallback"));
    return NextResponse.json(fallback as GameSpecV1);
  }
}
