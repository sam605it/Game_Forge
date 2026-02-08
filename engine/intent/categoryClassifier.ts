import type { Category } from "@/engine/categories";

const CATEGORY_KEYWORDS: Array<{ category: Category; keywords: string[] }> = [
  { category: "shooter", keywords: ["shoot", "shooter", "gun", "laser", "spaceship", "blaster"] },
  { category: "sports", keywords: ["sport", "golf", "soccer", "basketball", "tennis", "bowling"] },
  { category: "racing", keywords: ["race", "racing", "car", "drift", "kart", "track"] },
  { category: "platformer", keywords: ["platformer", "platform", "jump", "side-scroll"] },
  { category: "puzzle", keywords: ["puzzle", "match", "connect", "sokoban", "maze"] },
  { category: "strategy", keywords: ["strategy", "tower defense", "turn-based", "tactics", "defense"] },
  { category: "rhythm_music", keywords: ["rhythm", "beat", "music", "dance"] },
  { category: "word_trivia", keywords: ["trivia", "quiz", "word", "spelling"] },
  { category: "party_social", keywords: ["party", "multiplayer", "hot seat", "co-op", "social"] },
  { category: "simulation", keywords: ["simulation", "sim", "farm", "tycoon", "builder"] },
  { category: "action", keywords: ["action", "battle", "combat", "fight", "survival"] },
];

const THEME_TAGS = [
  "spooky",
  "space",
  "pirate",
  "underwater",
  "neon",
  "retro",
  "cute",
  "zombie",
  "cyberpunk",
  "winter",
  "desert",
  "forest",
  "lava",
  "jungle",
  "city",
  "ruins",
  "crystal",
];

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9\s-]/g, " ").trim();

export function extractThemeTags(prompt: string): string[] {
  const normalized = normalize(prompt);
  return THEME_TAGS.filter((tag) => normalized.includes(tag));
}

const scoreCategory = (prompt: string) => {
  const normalized = normalize(prompt);
  for (const entry of CATEGORY_KEYWORDS) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.category;
    }
  }
  return "arcade" as Category;
};

export function classifyCategory(prompt: string): Category {
  return scoreCategory(prompt);
}
