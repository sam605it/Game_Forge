import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { prompt, gameState } = await req.json();

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const systemPrompt = `
You are an AI mini game engine.
Return ONLY valid JSON.
No markdown. No commentary.

Schema:
{
  "scene": string,
  "playerOptions": string[],
  "stateChanges": object
}

Current game state:
${JSON.stringify(gameState)}
`;

    const result = await model.generateContent([
      systemPrompt,
      prompt
    ]);

    const raw = result.response.text();
    const json = raw.match(/\{[\s\S]*\}/)?.[0];

    return NextResponse.json({
      ok: true,
      data: JSON.parse(json)
    });

  } catch (err) {
    console.error("AI ERROR:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
