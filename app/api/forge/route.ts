import { NextResponse } from "next/server";
import type { GameSpecV1 } from "@/types";
import { compilePrompt } from "@/engine/compiler";

export async function POST(request: Request) {
  let prompt = "";
  try {
    const body = (await request.json()) as { prompt?: string };
    prompt = body.prompt ?? "";
    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt." }, { status: 400 });
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
    try {
      const { spec } = await compilePrompt(prompt || "Forged fallback", { useAI: false });
      return NextResponse.json(spec as GameSpecV1);
    } catch {
      return NextResponse.json({ error: "Unable to forge game." }, { status: 500 });
    }
  }
}
