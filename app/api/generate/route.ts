import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { message } = await req.json();

  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

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

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    const blueprint = JSON.parse(text);
    return NextResponse.json(blueprint);
  } catch {
    return NextResponse.json({
      title: "Fallback Game",
      genre: "Arcade",
      camera: "2D",
      player: {
        type: "default",
        controls: ["click"]
      },
      entities: [],
      rules: ["Survive"],
      winCondition: "Player score > 0"
    });
  }
}
