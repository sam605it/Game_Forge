import { accessories, paletteColors } from "./iconCatalog";

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

function drawBaseShape(base: string, colors: { primary: string; secondary: string; accent: string }) {
  switch (base) {
    case "bunny":
      return `
        <ellipse cx="34" cy="22" rx="10" ry="22" fill="${colors.primary}" stroke="#1F1F1F" stroke-width="3" />
        <ellipse cx="66" cy="22" rx="10" ry="22" fill="${colors.primary}" stroke="#1F1F1F" stroke-width="3" />
        <circle cx="50" cy="62" r="26" fill="${colors.primary}" stroke="#1F1F1F" stroke-width="3" />
        <circle cx="42" cy="58" r="4" fill="#1F1F1F" />
        <circle cx="58" cy="58" r="4" fill="#1F1F1F" />
        <circle cx="50" cy="68" r="6" fill="${colors.secondary}" />
      `;
    case "pumpkin":
      return `
        <circle cx="50" cy="56" r="26" fill="${colors.primary}" stroke="#1F1F1F" stroke-width="3" />
        <path d="M50 24 C48 18 52 12 58 12" stroke="#1F1F1F" stroke-width="3" fill="none" />
        <circle cx="40" cy="54" r="4" fill="#1F1F1F" />
        <circle cx="60" cy="54" r="4" fill="#1F1F1F" />
        <path d="M40 66 Q50 72 60 66" stroke="#1F1F1F" stroke-width="3" fill="none" />
      `;
    case "golf_ball":
      return `
        <circle cx="50" cy="50" r="24" fill="${colors.primary}" stroke="#1F1F1F" stroke-width="3" />
        <circle cx="44" cy="44" r="3" fill="${colors.secondary}" />
        <circle cx="56" cy="46" r="3" fill="${colors.secondary}" />
        <circle cx="48" cy="58" r="3" fill="${colors.secondary}" />
      `;
    case "hole":
      return `
        <ellipse cx="50" cy="62" rx="22" ry="10" fill="#1F1F1F" />
        <rect x="48" y="14" width="4" height="36" fill="#1F1F1F" />
        <path d="M52 14 L80 22 L52 30 Z" fill="${colors.accent}" />
      `;
    case "wall":
      return `
        <rect x="16" y="36" width="68" height="28" rx="6" fill="${colors.secondary}" stroke="#1F1F1F" stroke-width="3" />
      `;
    case "tree":
      return `
        <circle cx="50" cy="40" r="18" fill="${colors.primary}" />
        <rect x="46" y="56" width="8" height="18" fill="${colors.secondary}" />
      `;
    case "rock":
      return `
        <path d="M24 66 L34 40 L62 36 L76 62 L64 78 L34 78 Z" fill="${colors.secondary}" stroke="#1F1F1F" stroke-width="3" />
      `;
    case "bush":
      return `
        <circle cx="36" cy="58" r="14" fill="${colors.primary}" />
        <circle cx="54" cy="54" r="16" fill="${colors.primary}" />
        <circle cx="68" cy="60" r="12" fill="${colors.primary}" />
      `;
    default:
      return `
        <circle cx="50" cy="50" r="24" fill="${colors.primary}" stroke="#1F1F1F" stroke-width="3" />
        <path d="M35 58 L50 34 L65 58 Z" fill="${colors.secondary}" />
      `;
  }
}

function drawAccessory(accessory: string, colors: { primary: string; secondary: string; accent: string }) {
  if (!accessories.includes(accessory) || accessory === "none") return "";
  switch (accessory) {
    case "sparkle":
      return `<path d="M50 14 L54 28 L68 32 L54 36 L50 50 L46 36 L32 32 L46 28 Z" fill="${colors.accent}" />`;
    case "stripe":
      return `<rect x="18" y="46" width="64" height="8" fill="${colors.accent}" opacity="0.7" />`;
    case "dot":
      return `<circle cx="70" cy="30" r="6" fill="${colors.accent}" />`;
    case "halo":
      return `<ellipse cx="50" cy="18" rx="20" ry="6" fill="none" stroke="${colors.accent}" stroke-width="3" />`;
    case "crown":
      return `<path d="M34 30 L40 18 L50 30 L60 18 L66 30 Z" fill="${colors.accent}" />`;
    default:
      return "";
  }
}

export function getIconSvg(iconId: string): string {
  const cached = svgCache.get(iconId);
  if (cached) return cached;

  const { base, palette, accessory, variant } = parseIconId(iconId);
  const colors = paletteColors[palette] ?? paletteColors.pastel;
  const seed = hashedRandom(iconId + variant.toString());
  const rotation = seed % 12;
  const accessorySvg = drawAccessory(accessory, colors);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="18" fill="${colors.accent}" opacity="0.18" />
      <g transform="rotate(${rotation} 50 50)">
        ${drawBaseShape(base, colors)}
      </g>
      ${accessorySvg}
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
