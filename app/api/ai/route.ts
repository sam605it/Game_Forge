import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY!,
  });

  const response = await ai.models.generateContent({
    model: "gemini-1.5-flash",
    contents: prompt,
  });

  return NextResponse.json({
    text: response.text,
  });
}
