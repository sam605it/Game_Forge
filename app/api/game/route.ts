import { NextResponse } from "next/server";
import { GameSpecSchema } from "@/lib/gamespec/schema";
import { parsePromptToRequirements, resolveTemplate } from "@/lib/nlp/requirements";
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
    gameType: resolveTemplate(prompt, hints.forceTemplate ?? requirements.gameType),
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

  let errorMessage: string | null = null;
  let spec = null;

  try {
    let requirements = parsePromptToRequirements(prompt);
    requirements = {
      ...requirements,
      gameType: resolveTemplate(prompt, requirements.gameType),
    };
    spec = buildGameSpec(requirements);

    for (let attempt = 0; attempt < MAX_REPAIRS; attempt += 1) {
      const evaluationRequirements = {
        ...requirements,
        gameType: spec.template,
      };
      const evaluation = evaluateSpecAgainstPrompt(prompt, evaluationRequirements, spec);
      if (evaluation.pass) break;
      const hints = deriveRepairHints(evaluation.failures);
      requirements = applyRepairHints(prompt, hints);
      spec = buildGameSpec(requirements);
    }
  } catch (error) {
    console.error("GAME API ERROR:", error);
    errorMessage = "We hit an issue generating that game. Showing a fallback build.";
  }

  const parsed = GameSpecSchema.safeParse(spec);
  if (!parsed.success) {
    errorMessage = errorMessage ?? "Generated game failed validation. Showing a fallback build.";
    const fallbackRequirements = {
      ...parsePromptToRequirements(prompt),
      gameType: resolveTemplate(prompt, "mini_golf"),
    };
    const fallbackSpec = buildGameSpec(fallbackRequirements);
    return NextResponse.json({
      ...fallbackSpec,
      error: { message: errorMessage },
    });
  }

  return NextResponse.json({
    ...parsed.data,
    error: errorMessage ? { message: errorMessage } : undefined,
  });
}
