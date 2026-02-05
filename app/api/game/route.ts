import { NextResponse } from "next/server";

const ICONS = {
  bunny: "🐰",
  robot_basic: "🤖",
  cat: "🐱",
  dog: "🐶",
  golf_ball: "⚪",
};

type IconKey = keyof typeof ICONS;

function pickIconFromText(text: string): IconKey {
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

async function generateWithOpenAI(userText: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4.1-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userText },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  return payload?.choices?.[0]?.message?.content as string | undefined;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const userText = body.action ?? "";

    const raw = await generateWithOpenAI(userText);

    let aiJSON: Record<string, unknown> = {};
    if (raw) {
      try {
        aiJSON = JSON.parse(raw);
      } catch {
        aiJSON = {};
      }
    }

    const playerIcon =
      typeof aiJSON.playerIcon === "string" && aiJSON.playerIcon in ICONS
        ? (aiJSON.playerIcon as IconKey)
        : pickIconFromText(userText);

    return NextResponse.json({
      genre: "sports",
      themeId: typeof aiJSON.themeId === "string" ? aiJSON.themeId : "minigolf",
      difficulty:
        aiJSON.difficulty === "easy" ||
        aiJSON.difficulty === "medium" ||
        aiJSON.difficulty === "hard"
          ? aiJSON.difficulty
          : "easy",
      description:
        typeof aiJSON.description === "string"
          ? aiJSON.description
          : "Play a fun mini golf game featuring a character.",
      playerIcon,
    });
  } catch (err) {
    console.error("GAME API ERROR:", err);
    return NextResponse.json(
      { error: "Invalid game output" },
      { status: 500 },
    );
  }
}
