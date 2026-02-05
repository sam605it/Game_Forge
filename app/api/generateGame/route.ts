import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const prompt = await req.text();

  // TODO: replace with real OpenAI call
  const aiGeneratedGame = {
    type: "mini-golf",
    world: { width: 800, height: 400 },
    entities: [
      { kind: "ball", x: 100, y: 200 },
      { kind: "hole", x: 700, y: 200, radius: 12 },
    ],
    rules: { friction: 0.98 },
  };

  return NextResponse.json(aiGeneratedGame);
}
