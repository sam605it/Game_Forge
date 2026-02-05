import OpenAI from "openai";
import { NextResponse } from "next/server";


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const ICONS = {
  bunny: "🐰",
  robot_basic: "🤖",
  cat: "🐱",
  dog: "🐶",
  golf_ball: "⚪",
};

function pickIconFromText(text: string): keyof typeof ICONS {
  const lower = text.toLowerCase();
  if (lower.includes("bunny") || lower.includes("rabbit")) return "bunny";
  if (lower.includes("robot")) return "robot_basic";
  if (lower.includes("cat")) return "cat";
  if (lower.includes("dog")) return "dog";
  return "golf_ball";
}

const SYSTEM_PROMPT = `
You are a game compiler.

Return ONLY valid JSON.
No markdown. No commentary.

Allowed playerIcon values:
${Object.keys(ICONS).join(", ")}

Schema:
{
  "genre": "sports",
  "themeId": string,
  "playerIcon": string,
  "difficulty": "easy" | "medium" | "hard",
  "description": string
}

Rules:
- playerIcon MUST be one of the allowed values
- Match animals or characters if mentioned
- If unsure, use "golf_ball"
`;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.action ?? "";

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userText },
      ],
    });

    const raw = completion.choices[0].message.content;
    if (!raw) throw new Error("Empty AI response");

    let aiJSON: any;
    try {
      aiJSON = JSON.parse(raw);
    } catch {
      aiJSON = {};
    }

    let playerIcon =
      typeof aiJSON.playerIcon === "string" && ICONS[aiJSON.playerIcon]
        ? aiJSON.playerIcon
        : pickIconFromText(userText);

    return NextResponse.json({
      genre: "sports",
      themeId: aiJSON.themeId ?? "minigolf",
      difficulty: aiJSON.difficulty ?? "easy",
      description:
        aiJSON.description ??
        "Play a fun mini golf game featuring a character.",
      playerIcon,
    });
  } catch (err) {
    console.error("GAME API ERROR:", err);
    return NextResponse.json(
      { error: "Invalid game output" },
      { status: 500 }
    );
  }
}



