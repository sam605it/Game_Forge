import { NextResponse } from "next/server";

const OPENAI_ENDPOINT = "https://api.openai.com/v1/chat/completions";

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

const safeJsonParse = (text: string): unknown => {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  return JSON.parse(cleaned);
};

async function generateWithOpenAI(message: string) {
  const apiKey = process.env.OPENAI_API_KEY;
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
    OPENAI_ENDPOINT,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You generate valid JSON only." },
          { role: "user", content: prompt },
        ],
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content;
  return typeof text === "string" ? text : null;
}

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    const text = await generateWithOpenAI(message ?? "");

    if (!text) {
      return NextResponse.json(fallbackBlueprint);
    }

    try {
      const blueprint = safeJsonParse(text);
      return NextResponse.json(blueprint);
    } catch {
      return NextResponse.json(fallbackBlueprint);
    }
  } catch {
    return NextResponse.json(fallbackBlueprint);
  }
}
