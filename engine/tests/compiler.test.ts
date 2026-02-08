import { describe, expect, it } from "vitest";
import { compilePrompt } from "@/engine/compiler";
import { CONTROL_SCHEMES, ENTITY_KINDS, RULE_TYPES } from "@/engine/capabilities";

const prompts = [
  "Mini golf in space with neon vibes",
  "Topdown shooter with 6 enemies",
  "Dodge arena in a spooky castle",
  "Endless runner through the desert",
  "Classic platformer with extra platforms",
  "Maze escape without walls",
  "Treasure collect jungle ruins",
  "Survival mode hard with more enemies",
  "Breakout block buster",
  "Space lander on a crystal moon",
];

const validateSpec = (spec: Awaited<ReturnType<typeof compilePrompt>>["spec"]) => {
  expect(CONTROL_SCHEMES).toContain(spec.controls.scheme);
  for (const entity of spec.entities) {
    expect(ENTITY_KINDS).toContain(entity.kind);
  }
  for (const rule of spec.rules) {
    expect(RULE_TYPES).toContain(rule.type);
  }
  const hasPlayer = spec.entities.some((entity) => entity.tags?.includes("player"));
  expect(hasPlayer).toBe(true);
};

describe("compiler pipeline", () => {
  it("compiles prompts into valid specs", async () => {
    for (const prompt of prompts) {
      const { spec } = await compilePrompt(prompt, { useAI: false });
      validateSpec(spec);
    }
  });

  it("respects negative constraints", async () => {
    const { spec } = await compilePrompt("Forest runner without trees", { useAI: false });
    const hasTreeDecor = spec.entities.some((entity) => entity.tags?.includes("tree"));
    expect(hasTreeDecor).toBe(false);
  });

  it("uses deterministic seeds", async () => {
    const first = await compilePrompt("Spooky dodge arena", { useAI: false });
    const second = await compilePrompt("Spooky dodge arena", { useAI: false });
    expect(first.spec.title).toBe(second.spec.title);
    expect(first.spec.entities.length).toBe(second.spec.entities.length);
  });
});
