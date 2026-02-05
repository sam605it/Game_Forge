export const ICONS = {
  bunny: "🐰",
  robot: "🤖",
  golf: "⛳",
  default: "⚪",
} as const;

export type IconKey = keyof typeof ICONS;
