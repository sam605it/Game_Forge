import { bases, semanticMap } from "@/lib/icons/iconCatalog";

export type RequirementList = {
  gameType: "mini_golf" | "pinball" | "topdown_shooter" | "platformer" | "grid_puzzle";
  theme: {
    skin: string;
    palette: string;
    mood?: string;
  };
  counts: {
    holes?: number;
    enemies?: number;
    bumpers?: number;
  };
  inclusions: string[];
  inclusionCounts: Record<string, number>;
  exclusions: string[];
  constraints: string[];
  raw: string;
};

const numberWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
};

const gameTypeKeywords: Array<{ keyword: string; type: RequirementList["gameType"] }> = [
  { keyword: "mini golf", type: "mini_golf" },
  { keyword: "minigolf", type: "mini_golf" },
  { keyword: "pinball", type: "pinball" },
  { keyword: "topdown shooter", type: "topdown_shooter" },
  { keyword: "top-down shooter", type: "topdown_shooter" },
  { keyword: "shooter", type: "topdown_shooter" },
  { keyword: "platformer", type: "platformer" },
  { keyword: "grid puzzle", type: "grid_puzzle" },
  { keyword: "puzzle", type: "grid_puzzle" },
];

const paletteKeywords = [
  "pastel",
  "neon",
  "vibrant",
  "muted",
  "noir",
  "sunset",
  "ocean",
  "forest",
  "candy",
  "midnight",
];

const moodKeywords = ["cute", "spooky", "cozy", "futuristic", "calm", "chaotic"];

const inclusionKeywords = [
  "tree",
  "trees",
  "rock",
  "rocks",
  "bush",
  "bushes",
  "water",
  "sand",
  "windmill",
  "bumpers",
  "enemies",
  ...bases,
  ...Object.keys(semanticMap),
];

const inclusionCanonicalMap: Record<string, string> = {
  trees: "tree",
  rocks: "rock",
  bushes: "bush",
  bumpers: "bumper",
  enemies: "enemy",
};

const quantityPhrases: Array<{ pattern: string; count: number }> = [
  { pattern: "\\ba\\s+lot of\\b", count: 12 },
  { pattern: "\\blots of\\b", count: 12 },
  { pattern: "\\bmany\\b", count: 12 },
  { pattern: "\\bseveral\\b", count: 6 },
  { pattern: "\\btons of\\b", count: 14 },
  { pattern: "\\bplenty of\\b", count: 10 },
  { pattern: "\\ba\\s+couple of\\b", count: 2 },
  { pattern: "\\bcouple of\\b", count: 2 },
  { pattern: "\\bfew\\b", count: 3 },
  { pattern: "\\bsingle\\b", count: 1 },
  { pattern: "\\bone\\b", count: 1 },
  { pattern: "\\ba\\b", count: 1 },
  { pattern: "\\ban\\b", count: 1 },
];

const inclusionDefaultCounts: Record<string, number> = {
  tree: 2,
};

const constraintKeywords = ["easy", "hard", "low gravity", "high gravity", "fast", "slow"];

function parseNumberToken(token: string): number | undefined {
  const trimmed = token.trim();
  if (!trimmed) return undefined;
  if (trimmed in numberWords) return numberWords[trimmed];
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function extractCount(input: string, noun: string): number | undefined {
  const regex = new RegExp(`(\\d+|${Object.keys(numberWords).join("|")})\\s+${noun}`, "i");
  const match = input.match(regex);
  if (!match) return undefined;
  return parseNumberToken(match[1]);
}

function extractExclusions(input: string): string[] {
  const exclusions = new Set<string>();
  const splitPattern = /\s*(?:,|\band\b)\s*/gi;
  const patterns = [
    /without\s+([a-z\s-]+)/gi,
    /no\s+([a-z\s-]+)/gi,
    /remove\s+([a-z\s-]+)/gi,
    /exclude\s+([a-z\s-]+)/gi,
  ];
  patterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(input)) !== null) {
      const text = match[1];
      if (!text) continue;
      text
        .split(splitPattern)
        .map((item) => item.trim())
        .filter(Boolean)
        .forEach((item) => {
          exclusions.add(item);
          if (item.endsWith("s")) {
            exclusions.add(item.slice(0, -1));
          }
        });
    }
  });
  return Array.from(exclusions);
}

function extractInclusions(input: string, exclusions: string[]): string[] {
  const lower = input.toLowerCase();
  const found: string[] = [];
  inclusionKeywords.forEach((keyword) => {
    const escaped = escapeRegex(keyword);
    const keywordPattern = new RegExp(`(?:^|\\W)${escaped}(?:$|\\W)`, "i");
    if (keywordPattern.test(lower) && !exclusions.some((ex) => keyword.includes(ex))) {
      found.push(inclusionCanonicalMap[keyword] ?? keyword);
    }
  });
  return Array.from(new Set(found));
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getPluralForms(noun: string): string[] {
  if (noun.endsWith("y")) return [noun, `${noun.slice(0, -1)}ies`, `${noun}s`];
  if (noun.endsWith("s")) return [noun];
  return [noun, `${noun}s`];
}

function findQuantityCount(input: string, nounPattern: string): number | undefined {
  for (const phrase of quantityPhrases) {
    const pattern = new RegExp(`${phrase.pattern}\\s+${nounPattern}`, "i");
    if (pattern.test(input)) {
      return phrase.count;
    }
  }
  return undefined;
}

function hasPluralMention(input: string, noun: string): boolean {
  const pluralForms = getPluralForms(noun).map((form) => escapeRegex(form));
  const pattern = new RegExp(`\\b(${pluralForms.join("|")})\\b`, "i");
  return pattern.test(input);
}

function extractInclusionCounts(input: string, inclusions: string[], exclusions: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  const lower = input.toLowerCase();

  inclusions.forEach((item) => {
    if (exclusions.some((exclusion) => item.includes(exclusion))) return;
    const pluralForms = getPluralForms(item).map((form) => escapeRegex(form)).join("|");
    const nounPattern = `\\b(?:${pluralForms})\\b`;
    const numericCount = extractCount(lower, nounPattern);
    if (numericCount) {
      counts[item] = numericCount;
      return;
    }

    const quantityCount = findQuantityCount(lower, nounPattern);
    if (quantityCount !== undefined) {
      counts[item] = quantityCount;
      return;
    }

    if (item in inclusionDefaultCounts) {
      counts[item] = inclusionDefaultCounts[item];
      return;
    }

    if (hasPluralMention(lower, item)) {
      counts[item] = 2;
    }
  });

  return counts;
}

function extractPalette(input: string): string {
  const lower = input.toLowerCase();
  return paletteKeywords.find((keyword) => lower.includes(keyword)) ?? "pastel";
}

function extractMood(input: string): string | undefined {
  const lower = input.toLowerCase();
  return moodKeywords.find((keyword) => lower.includes(keyword));
}

function extractThemeSkin(input: string): string {
  const lower = input.toLowerCase();
  const tokens = lower.split(/\s+/);
  const knownSkins = [
    "bunny",
    "rabbit",
    "pig",
    "pumpkin",
    "space",
    "pirate",
    "robot",
    "cat",
    "dog",
    "dragon",
    "ghost",
    "alien",
    "flower",
  ];
  const found = tokens.find((token) => knownSkins.includes(token));
  return found ?? "classic";
}

function extractGameType(input: string): RequirementList["gameType"] {
  const lower = input.toLowerCase();
  const match = gameTypeKeywords.find((entry) => lower.includes(entry.keyword));
  return match?.type ?? "mini_golf";
}

function extractConstraints(input: string): string[] {
  const lower = input.toLowerCase();
  return constraintKeywords.filter((keyword) => lower.includes(keyword));
}

export function parsePromptToRequirements(prompt: string): RequirementList {
  const lower = prompt.toLowerCase();
  const exclusions = extractExclusions(lower);
  const inclusions = extractInclusions(lower, exclusions);
  const inclusionCounts = extractInclusionCounts(lower, inclusions, exclusions);

  return {
    gameType: extractGameType(lower),
    theme: {
      skin: extractThemeSkin(lower),
      palette: extractPalette(lower),
      mood: extractMood(lower),
    },
    counts: {
      holes: extractCount(lower, "holes?") ?? extractCount(lower, "hole"),
      enemies: extractCount(lower, "enemies?") ?? extractCount(lower, "enemy"),
      bumpers: extractCount(lower, "bumpers?") ?? extractCount(lower, "bumper"),
    },
    inclusions,
    inclusionCounts,
    exclusions,
    constraints: extractConstraints(lower),
    raw: prompt,
  };
}
