import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "AI temporarily disabled during build stabilization." },
    { status: 503 }
  );
}
