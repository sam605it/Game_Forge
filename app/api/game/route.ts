import { NextResponse } from "next/server";
import { buildMiniGolfSpec } from "@/engine/templates/miniGolf";
import { validateGameSpec } from "@/engine/spec/schema";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const prompt = typeof body?.prompt === "string" ? body.prompt : "";
  const spec = buildMiniGolfSpec(prompt || "Mini golf");
  const validatedSpec = validateGameSpec(spec);

  return NextResponse.json(validatedSpec);
}
