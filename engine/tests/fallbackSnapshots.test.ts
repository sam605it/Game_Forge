import { describe, expect, it } from "vitest";
import { TEMPLATE_MAP } from "@/engine/templates";
import { normalizeSpec } from "@/lib/runtime/normalizeSpec";

const FALLBACK_TEMPLATES = [
  "dodge_arena",
  "platformer",
  "grid_puzzle",
  "minigolf",
  "rhythm_tap",
];

describe("fallback snapshots", () => {
  for (const templateId of FALLBACK_TEMPLATES) {
    it(`matches fallback snapshot for ${templateId}`, () => {
      const template = TEMPLATE_MAP.get(templateId);
      if (!template) throw new Error("Template missing");
      const spec = normalizeSpec(template.buildBaseSpec(42));
      expect(spec).toMatchSnapshot();
    });
  }
});
