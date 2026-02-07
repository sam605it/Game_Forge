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
        .split(/,|and/)
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
    if (lower.includes(keyword) && !exclusions.some((ex) => keyword.includes(ex))) {
      found.push(keyword);
    }
  });
  return Array.from(new Set(found));
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
    exclusions,
    constraints: extractConstraints(lower),
    raw: prompt,
  };
}
