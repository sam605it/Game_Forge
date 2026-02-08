import { describe, expect, it } from "vitest";
import { pickIcon } from "@/engine/icons/iconPicker";

describe("iconPicker", () => {
  it("is deterministic for the same seed", () => {
    const first = pickIcon({
      prompt: "Space shooter with neon lasers",
      category: "shooter",
      entityKind: "enemy",
      themeTags: ["space", "neon"],
      seed: 42,
    });
    const second = pickIcon({
      prompt: "Space shooter with neon lasers",
      category: "shooter",
      entityKind: "enemy",
      themeTags: ["space", "neon"],
      seed: 42,
    });
    expect(first.id).toBe(second.id);
    expect(first.emoji).toBe(second.emoji);
  });

  it("varies icons across different seeds", () => {
    const icons = new Set(
      [1, 2, 3, 4, 5].map((seed) =>
        pickIcon({
          prompt: "Arcade coin rush",
          category: "arcade",
          entityKind: "pickup",
          themeTags: ["retro"],
          seed,
        }).id,
      ),
    );
    expect(icons.size).toBeGreaterThan(1);
  });

  it("respects exclusions for decor icons", () => {
    const icon = pickIcon({
      prompt: "mini golf without trees",
      category: "sports",
      entityKind: "decor",
      themeTags: [],
      seed: 7,
    });
    const combined = `${icon.name} ${icon.keywords.join(" ")} ${icon.groups.join(" ")}`.toLowerCase();
    expect(combined.includes("tree")).toBe(false);
  });
});
