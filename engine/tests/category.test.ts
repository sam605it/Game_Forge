import { describe, expect, it } from "vitest";
import { classifyCategory } from "@/engine/intent/categoryClassifier";

const CASES: Array<{ prompt: string; category: ReturnType<typeof classifyCategory> }> = [
  { prompt: "Fast car drift race through neon streets", category: "racing" },
  { prompt: "Topdown shooter with lasers and blasters", category: "shooter" },
  { prompt: "Mini golf with tricky obstacles", category: "sports" },
  { prompt: "Soccer penalty shootout", category: "sports" },
  { prompt: "Platformer with jumping puzzles", category: "platformer" },
  { prompt: "Puzzle match-3 in a crystal cave", category: "puzzle" },
  { prompt: "Tower defense against waves", category: "strategy" },
  { prompt: "Turn-based tactics on a grid", category: "strategy" },
  { prompt: "Arcade coin rush", category: "arcade" },
  { prompt: "Farm sim with crops and animals", category: "simulation" },
  { prompt: "Tycoon city builder", category: "simulation" },
  { prompt: "Rhythm beat tapper", category: "rhythm_music" },
  { prompt: "Music rhythm adventure", category: "rhythm_music" },
  { prompt: "Trivia quiz showdown", category: "word_trivia" },
  { prompt: "Word scramble challenge", category: "word_trivia" },
  { prompt: "Party hot seat mini games", category: "party_social" },
  { prompt: "Multiplayer party chaos", category: "party_social" },
  { prompt: "Action combat arena", category: "action" },
  { prompt: "Survival combat in a spooky castle", category: "action" },
  { prompt: "Spaceship blaster battle", category: "shooter" },
];

describe("categoryClassifier", () => {
  it("classifies categories from prompts", () => {
    for (const entry of CASES) {
      expect(classifyCategory(entry.prompt)).toBe(entry.category);
    }
  });
});
