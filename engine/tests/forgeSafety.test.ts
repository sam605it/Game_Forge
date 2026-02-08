import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compilePrompt } from "@/engine/compiler";
import { TEMPLATE_MAP } from "@/engine/templates";
import { ensurePlayableSpec } from "@/engine/compiler/ensurePlayableSpec";
import { validatePlayableSpec } from "@/lib/runtime/validatePlayableSpec";
import type { GameSpecV1 } from "@/types";

const goldenPrompts = [
  "Arcade dodge with neon lights",
  "Topdown shooter with robots",
  "Platformer with floating islands",
  "Puzzle maze with keys",
  "Strategy tower defense in space",
  "Racing time trial through a canyon",
  "Rhythm music tap to the beat",
  "Word trivia challenge",
  "Party social tag game",
  "Simulation farm with crops",
  "Sports mini golf course",
  "Action survival in the arena",
  "Arcade breakout with colorful blocks",
  "Platformer ice caves",
  "Strategy castle defense",
];

describe("forge safety pipeline", () => {
  it("forges playable specs for golden prompts", async () => {
    for (const prompt of goldenPrompts) {
      const { spec } = await compilePrompt(prompt, { useAI: false });
      const validation = validatePlayableSpec(spec);
      expect(validation.ok).toBe(true);
    }
  });

  it("falls back when schema is invalid", () => {
    const template = TEMPLATE_MAP.get("dodge_arena");
    if (!template) throw new Error("Missing template.");
    const base = template.buildBaseSpec(1);
    const invalidSpec: GameSpecV1 = {
      ...base,
      controls: { ...base.controls, scheme: "telepathy" as GameSpecV1["controls"]["scheme"] },
    };

    const result = ensurePlayableSpec(invalidSpec, template, 1);
    expect(result.fallbackUsed).toBe(true);
  });

  it("falls back for unsupported entity kinds", () => {
    const template = TEMPLATE_MAP.get("dodge_arena");
    if (!template) throw new Error("Missing template.");
    const base = template.buildBaseSpec(2);
    const invalidSpec: GameSpecV1 = {
      ...base,
      entities: base.entities.map((entity, index) =>
        index === 0 ? { ...entity, kind: "boss_dragon" } : entity,
      ),
    } as GameSpecV1;

    const result = ensurePlayableSpec(invalidSpec, template, 2);
    expect(result.fallbackUsed).toBe(true);
  });

  it("recovers when OpenAI intent response is non-JSON", async () => {
    const mockFetch = vi.fn(async () => ({
      ok: true,
      json: async () => ({ output_text: "not json" }),
    }));
    const originalFetch = global.fetch;
    // @ts-expect-error testing override
    global.fetch = mockFetch;

    const result = await compilePrompt("Arcade dodge", { apiKey: "test-key", useAI: true });
    const validation = validatePlayableSpec(result.spec);
    expect(validation.ok).toBe(true);

    global.fetch = originalFetch;
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});
