import { NextResponse } from "next/server";

const fallbackBlueprint = {
  title: "Fallback Game",
  genre: "Arcade",
  camera: "2D",
  player: {
    type: "default",
    controls: ["click"],
  },
  entities: [],
  rules: ["Survive"],
  winCondition: "Player score > 0",
};

async function generateWithGemini(message: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `
You are a game engine blueprint generator.

The user input may be very short or vague.
You MUST infer all missing details.

Return ONLY valid JSON.
No text outside JSON.

Schema:
{
  "title": string,
  "genre": string,
  "camera": "2D" | "3D",
  "player": {
    "type": string,
    "controls": string[]
  },
  "entities": {
    "name": string,
    "behavior": string
  }[],
  "rules": string[],
  "winCondition": string
}

User input:
"${message}"
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  return typeof text === "string" ? text : null;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const text = await generateWithGemini(message ?? "");

    if (!text) {
      return NextResponse.json(fallbackBlueprint);
    }

    try {
      const blueprint = JSON.parse(text);
      return NextResponse.json(blueprint);
    } catch {
      return NextResponse.json(fallbackBlueprint);
    }
  } catch {
    return NextResponse.json(fallbackBlueprint);
  }
}
