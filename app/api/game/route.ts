import { NextResponse } from "next/server";
import { GameSpecSchema } from "@/lib/gamespec/schema";
import { parsePromptToRequirements } from "@/lib/nlp/requirements";
import { buildGameSpec } from "@/lib/nlp/promptToSpec";
import { evaluateSpecAgainstPrompt } from "@/lib/eval/evaluate";

const MAX_REPAIRS = 2;

type RepairHints = {
  forceExclusions: string[];
  forceHoles?: number;
  forceTemplate?: string;
};

function applyRepairHints(prompt: string, hints: RepairHints) {
  const requirements = parsePromptToRequirements(prompt);
  const exclusions = new Set([...requirements.exclusions, ...hints.forceExclusions]);
  const holes = hints.forceHoles ?? requirements.counts.holes;
  return {
    ...requirements,
    gameType: (hints.forceTemplate as typeof requirements.gameType) ?? requirements.gameType,
    counts: { ...requirements.counts, holes },
    exclusions: Array.from(exclusions),
  };
}

function deriveRepairHints(failures: ReturnType<typeof evaluateSpecAgainstPrompt>["failures"]): RepairHints {
  const hints: RepairHints = { forceExclusions: [] };
  failures.forEach((failure) => {
    if (failure.type === "exclude") {
      hints.forceExclusions.push(failure.term);
    }
    if (failure.type === "holes") {
      hints.forceHoles = failure.expected;
    }
    if (failure.type === "template") {
      hints.forceTemplate = failure.expected;
    }
  });
  return hints;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const bodyData = body as { prompt?: unknown };
  const prompt = typeof bodyData.prompt === "string" ? bodyData.prompt.trim() : "";
  if (!prompt) {
    return NextResponse.json({ error: "prompt is required." }, { status: 400 });
  }

  try {
    let requirements = parsePromptToRequirements(prompt);
    let spec = buildGameSpec(requirements);

    for (let attempt = 0; attempt < MAX_REPAIRS; attempt += 1) {
      const evaluation = evaluateSpecAgainstPrompt(prompt, requirements, spec);
      if (evaluation.pass) break;
      const hints = deriveRepairHints(evaluation.failures);
      requirements = applyRepairHints(prompt, hints);
      spec = buildGameSpec(requirements);
    }

    const parsed = GameSpecSchema.safeParse(spec);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid GameSpec" }, { status: 400 });
    }

    return NextResponse.json(parsed.data);
  } catch (error) {
    console.error("GAME API ERROR:", error);
    return NextResponse.json({ error: "Invalid game output" }, { status: 500 });
  }
}
