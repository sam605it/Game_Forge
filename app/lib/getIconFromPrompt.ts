import { IconKey } from "./icons";

export function getIconFromPrompt(prompt?: string): IconKey {
  if (!prompt) return "default";

  const p = prompt.toLowerCase();

  // Explicit themes ONLY
  if (p.includes("bunny") || p.includes("rabbit")) return "bunny";
  if (p.includes("robot")) return "robot";

  // Plain mini golf → white ball
  return "default";
}
