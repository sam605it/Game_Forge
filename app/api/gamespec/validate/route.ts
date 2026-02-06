import { NextResponse } from "next/server";
import { parseGameSpecV1 } from "@/app/gamespec/guards";

export async function POST(request: Request) {
  try {
    const input = await request.json();
    const parsed = parseGameSpecV1(input);

    if (parsed.ok === false) {
      return NextResponse.json({ ok: false, errors: parsed.errors }, { status: 422 });
    }

    return NextResponse.json({ ok: true, spec: parsed.value });
  } catch {
    return NextResponse.json({ ok: false, errors: ["Invalid JSON body."] }, { status: 400 });
  }
}
