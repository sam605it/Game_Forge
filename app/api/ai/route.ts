import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    const client = new GoogleGenAI({
      apiKey: process.env.GOOGLE_API_KEY!,
    });

    const response = await client.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    return NextResponse.json({ text });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message ?? "AI generation error" },
      { status: 500 }
    );
  }
}
