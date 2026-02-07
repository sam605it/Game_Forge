export type IconCategory =
  | "animals"
  | "sports"
  | "food"
  | "spooky"
  | "nature"
  | "tech"
  | "fantasy"
  | "ocean"
  | "space"
  | "music"
  | "shapes"
  | "symbols";

export const categories: IconCategory[] = [
  "animals",
  "sports",
  "food",
  "spooky",
  "nature",
  "tech",
  "fantasy",
  "ocean",
  "space",
  "music",
  "shapes",
  "symbols",
];

export const bases = [
  "bunny",
  "cat",
  "dog",
  "dragon",
  "fish",
  "bird",
  "turtle",
  "bear",
  "fox",
  "pumpkin",
  "ghost",
  "skull",
  "pig",
  "robot",
  "tree",
  "rock",
  "bush",
  "flower",
  "leaf",
  "star",
  "heart",
  "moon",
  "sun",
  "planet",
  "rocket",
  "golf_ball",
  "hole",
  "wall",
  "coin",
  "gem",
  "controller",
  "dice",
  "shield",
  "sword",
  "crown",
  "wave",
  "note",
];

export const palettes = [
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
  "golden",
];

export const accessories = ["none"];
export const ICON_VARIANT_COUNT = 1;

export const paletteColors: Record<string, { primary: string; secondary: string; accent: string }> = {
  pastel: { primary: "#F7F7FB", secondary: "#FFC8D9", accent: "#9AD0EC" },
  neon: { primary: "#00F5D4", secondary: "#FF4D6D", accent: "#FEE440" },
  vibrant: { primary: "#FF595E", secondary: "#8AC926", accent: "#1982C4" },
  muted: { primary: "#C0C0C0", secondary: "#A3B18A", accent: "#6D6875" },
  noir: { primary: "#1B1B1B", secondary: "#3D3D3D", accent: "#F5F5F5" },
  sunset: { primary: "#FF9F1C", secondary: "#FFBF69", accent: "#CBF3F0" },
  ocean: { primary: "#0077B6", secondary: "#48CAE4", accent: "#90E0EF" },
  forest: { primary: "#2D6A4F", secondary: "#95D5B2", accent: "#52B788" },
  candy: { primary: "#FFAFCC", secondary: "#BDE0FE", accent: "#A2D2FF" },
  midnight: { primary: "#0B132B", secondary: "#1C2541", accent: "#5BC0BE" },
  golden: { primary: "#F5C16C", secondary: "#D49E2A", accent: "#FFF3B0" },
};

export const semanticMap: Record<string, { category: IconCategory; base: string }> = {
  bunny: { category: "animals", base: "bunny" },
  rabbit: { category: "animals", base: "bunny" },
  pig: { category: "animals", base: "pig" },
  cat: { category: "animals", base: "cat" },
  dog: { category: "animals", base: "dog" },
  dragon: { category: "fantasy", base: "dragon" },
  pumpkin: { category: "spooky", base: "pumpkin" },
  ghost: { category: "spooky", base: "ghost" },
  tree: { category: "nature", base: "tree" },
  rock: { category: "nature", base: "rock" },
  bush: { category: "nature", base: "bush" },
  flower: { category: "nature", base: "flower" },
  golf_ball: { category: "sports", base: "golf_ball" },
  hole: { category: "sports", base: "hole" },
  wall: { category: "shapes", base: "wall" },
  pirate: { category: "symbols", base: "skull" },
  space: { category: "space", base: "planet" },
  robot: { category: "tech", base: "robot" },
};

export type ResolveIconInput = {
  semantic: string;
  role?: string;
  palette?: string;
  mood?: string;
  accessory?: string;
  variant?: number;
};

export function resolveIconId({
  semantic,
  role,
  palette,
  mood,
  accessory,
  variant,
}: ResolveIconInput): string {
  const normalized = semantic.toLowerCase();
  const mapping = semanticMap[normalized] ?? { category: "shapes" as IconCategory, base: "star" };
  const pal = palette && palettes.includes(palette) ? palette : "pastel";
  const accSeed = `${semantic}:${role ?? ""}:${mood ?? ""}:acc`;
  const acc = accessory && accessories.includes(accessory)
    ? accessory
    : accessories[Math.abs(hashString(accSeed)) % accessories.length];
  const varSeed = `${semantic}:${role ?? ""}:${mood ?? ""}:var`;
  const varValue = typeof variant === "number"
    ? variant
    : Math.abs(hashString(varSeed)) % ICON_VARIANT_COUNT;
  return `cat:${mapping.category}/base:${mapping.base}/pal:${pal}/acc:${acc}/var:${varValue}`;
}

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
