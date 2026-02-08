const THEME_TAGS = [
  "spooky",
  "space",
  "pirate",
  "underwater",
  "neon",
  "retro",
  "cute",
  "zombie",
];

export const extractThemeTags = (prompt: string): string[] => {
  const lower = prompt.toLowerCase();
  return THEME_TAGS.filter((tag) => lower.includes(tag));
};

const splitExclusionTerms = (raw: string): string[] => {
  return raw
    .split(/,|and/)
    .map((term) => term.trim())
    .filter(Boolean)
    .map((term) => term.replace(/^(a|an|the)\s+/i, ""));
};

export const extractExclusions = (prompt: string): string[] => {
  const lower = prompt.toLowerCase();
  const exclusions: string[] = [];
  const regex = /without\s+([a-z\s,]+)/gi;
  let match: RegExpExecArray | null = null;

  while ((match = regex.exec(lower))) {
    const terms = splitExclusionTerms(match[1]);
    exclusions.push(...terms);
  }

  return Array.from(new Set(exclusions));
};

export const parsePrompt = (prompt: string) => {
  return {
    themes: extractThemeTags(prompt),
    exclusions: extractExclusions(prompt),
  };
};
