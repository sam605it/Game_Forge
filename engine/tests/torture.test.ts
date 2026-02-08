import { describe, expect, it, vi } from "vitest";
import { forgeGame } from "@/engine/forge/forgeGame";
import { adaptToRendererFromUnknown } from "@/engine/spec/adapter";
import { rendererConstraintCheck } from "@/lib/runtime/rendererConstraints";

const prompts = [
  "Make it chaotic with lasers and lava",
  "Silent forest puzzle with no enemies",
  "A racing game on ice with penguins",
  "Spooky castle platformer",
  "Underwater rhythm taps",
  "Trivia night with neon lights",
  "Endless runner through volcanoes",
  "Micro strategy defense with bees",
  "Mini golf on the moon",
  "Party tag in a maze",
  "Space shooter with 12 enemies",
  "Zen garden simulation",
  "Retro arcade breakout",
  "Word trivia with robots",
  "Fast topdown chase",
  "Slow stealth escape",
  "Crystal cavern puzzle",
  "Sports soccer penalty kicks",
  "Music rhythm in cyber city",
  "Forest farming sim",
  "Desert survival arena",
  "Pirate treasure collect",
  "Canyon time trial",
  "Snow platformer",
  "Wild west shooter",
  "Bubble pop party",
  "Gravity golf",
  "Dungeon crawler puzzle",
  "Jungle runner",
  "Neon dodge arena",
  "Haunted trivia",
  "Retro mining sim",
  "Mountain climbing platformer",
  "Maze escape without walls",
  "Ocean fishing hunt",
  "Basketball shootout",
  "Space lander",
  "Pinball galaxy",
  "Tower defense with robots",
  "Capture the flag in space",
  "Crystal rhythm",
  "Ancient ruins puzzle",
  "City builder with parks",
  "Stealth escape in neon",
  "Survival in lava arena",
  "Topdown shooter with zero enemies",
  "Snowy minigolf",
  "Party social dance off",
  "Word scramble quiz",
  "Simulation city traffic",
];

describe("torture safety", () => {
  it("forgeGame never throws and outputs renderable specs", async () => {
    for (const prompt of prompts) {
      const result = await forgeGame(prompt, { useAI: false });
      const issues = rendererConstraintCheck(result.spec);
      expect(issues.length).toBe(0);
    }
  });

  it("adapter never throws on garbage input", () => {
    const badInputs = [
      null,
      "not json",
      42,
      { nope: true },
      { entities: Array(200).fill({}) },
    ];

    for (const input of badInputs) {
      const adapted = adaptToRendererFromUnknown(input, "bad prompt");
      const issues = rendererConstraintCheck(adapted);
      expect(issues.length).toBe(0);
    }
  });

  it("handles broken OpenAI responses", async () => {
    const originalFetch = global.fetch;
    const cases = [
      { output_text: "" },
      { output_text: "```json\nnot-json\n```" },
      { output_text: "{\"category\": \"arcade\"}" },
      { output_text: "{\"category\": \"arcade\", \"themeTags\": [\"x\"], \"difficulty\": 9}" },
      { output_text: "{\"category\": \"arcade\", \"themeTags\": [], \"difficulty\": 2, \"mode\": \"reach_goal\", \"durationSec\": 30, \"counts\": {\"enemies\": 999, \"obstacles\": 999, \"pickups\": 999}, \"levelStyle\": \"open\"}" },
    ];

    for (const payload of cases) {
      const mockFetch = vi.fn(async () => ({
        ok: true,
        json: async () => payload,
      }));
      // @ts-expect-error testing override
      global.fetch = mockFetch;

      const result = await forgeGame("broken ai", { apiKey: "test-key" });
      const issues = rendererConstraintCheck(result.spec);
      expect(issues.length).toBe(0);
    }

    global.fetch = originalFetch;
  });
});
