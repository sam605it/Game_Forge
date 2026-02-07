import { paletteColors } from "./iconCatalog";

const svgCache = new Map<string, string>();
const dataUrlCache = new Map<string, string>();

function parseIconId(iconId: string) {
  const parts = iconId.split("/");
  const data: Record<string, string> = {};
  parts.forEach((part) => {
    const [key, value] = part.split(":");
    if (key && value) data[key] = value;
  });
  return {
    category: data.cat ?? "shapes",
    base: data.base ?? "star",
    palette: data.pal ?? "pastel",
    accessory: data.acc ?? "none",
    variant: Number(data.var ?? 0),
  };
}

function hashedRandom(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const emojiMap: Record<string, string> = {
  bunny: "🐰",
  cat: "🐱",
  dog: "🐶",
  dragon: "🐉",
  fish: "🐟",
  bird: "🐦",
  turtle: "🐢",
  bear: "🐻",
  fox: "🦊",
  pumpkin: "🎃",
  ghost: "👻",
  skull: "💀",
  pig: "🐷",
  robot: "🤖",
  tree: "🌳",
  rock: "🪨",
  bush: "🌿",
  flower: "🌸",
  leaf: "🍃",
  star: "⭐",
  heart: "❤️",
  moon: "🌙",
  sun: "☀️",
  planet: "🪐",
  rocket: "🚀",
  golf_ball: "⚪",
  hole: "⛳",
  wall: "🧱",
  coin: "🪙",
  gem: "💎",
  controller: "🎮",
  dice: "🎲",
  shield: "🛡️",
  sword: "🗡️",
  crown: "👑",
  wave: "🌊",
  note: "🎵",
};

export function getIconSvg(iconId: string): string {
  const cached = svgCache.get(iconId);
  if (cached) return cached;

  const { base, palette, variant } = parseIconId(iconId);
  const colors = paletteColors[palette] ?? paletteColors.pastel;
  const seed = hashedRandom(iconId + variant.toString());
  const rotation = seed % 4;
  const emoji = emojiMap[base] ?? "⭐";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="18" fill="${colors.accent}" opacity="0.14" />
      <rect x="6" y="6" width="88" height="88" rx="18" fill="${colors.primary}" opacity="0.08" />
      <g transform="rotate(${rotation} 50 50)">
        <text x="50" y="58" text-anchor="middle" font-size="64" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">
          ${emoji}
        </text>
      </g>
    </svg>
  `;

  svgCache.set(iconId, svg);
  return svg;
}

export function getIconDataUrl(iconId: string): string {
  const cached = dataUrlCache.get(iconId);
  if (cached) return cached;
  const svg = getIconSvg(iconId);
  const encoded = encodeURIComponent(svg.replace(/\n\s+/g, " "));
  const dataUrl = `data:image/svg+xml;utf8,${encoded}`;
  dataUrlCache.set(iconId, dataUrl);
  return dataUrl;
}
