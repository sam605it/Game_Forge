import fs from "node:fs/promises";
import path from "node:path";


type EmojiIcon = {
  id: string;
  emoji: string;
  name: string;
  keywords: string[];
  groups: string[];
  categoryHint?: string;
};

const TARGET_COUNT = 3600;

const FALLBACK_SEED: Array<Omit<EmojiIcon, "id">> = [
  { emoji: "⚽", name: "soccer ball", keywords: ["sports", "soccer", "ball"], groups: ["activity", "sports"] },
  { emoji: "🏀", name: "basketball", keywords: ["sports", "basketball", "ball"], groups: ["activity", "sports"] },
  { emoji: "🎾", name: "tennis", keywords: ["sports", "tennis", "racket"], groups: ["activity", "sports"] },
  { emoji: "⛳", name: "golf flag", keywords: ["sports", "golf", "flag"], groups: ["activity", "sports"] },
  { emoji: "🏎️", name: "racing car", keywords: ["racing", "car", "vehicle"], groups: ["travel", "transport"] },
  { emoji: "🏁", name: "checkered flag", keywords: ["racing", "flag", "finish"], groups: ["travel", "transport"] },
  { emoji: "🧩", name: "puzzle piece", keywords: ["puzzle", "connect", "piece"], groups: ["objects", "games"] },
  { emoji: "♟️", name: "chess pawn", keywords: ["strategy", "chess", "tactics"], groups: ["objects", "games"] },
  { emoji: "🎵", name: "musical note", keywords: ["rhythm", "music", "beat"], groups: ["objects", "music"] },
  { emoji: "📝", name: "memo", keywords: ["word", "trivia", "quiz"], groups: ["objects", "office"] },
  { emoji: "🎉", name: "party popper", keywords: ["party", "celebration", "social"], groups: ["activity", "party"] },
  { emoji: "🏭", name: "factory", keywords: ["simulation", "tycoon", "factory"], groups: ["travel", "places"] },
  { emoji: "🌲", name: "evergreen tree", keywords: ["tree", "forest", "nature"], groups: ["nature", "plants"] },
  { emoji: "👾", name: "alien monster", keywords: ["enemy", "alien", "shooter"], groups: ["people", "fantasy"] },
  { emoji: "🙂", name: "smiling face", keywords: ["player", "hero", "character"], groups: ["people", "faces"] },
  { emoji: "⭐", name: "star", keywords: ["goal", "target", "star"], groups: ["nature", "sky"] },
];

const FALLBACK_RANGES = [
  { start: 0x1f000, end: 0x1f2ff, group: "misc-games" },
  { start: 0x1f300, end: 0x1f5ff, group: "misc-symbols" },
  { start: 0x1f600, end: 0x1f64f, group: "smileys" },
  { start: 0x1f680, end: 0x1f6ff, group: "transport" },
  { start: 0x1f700, end: 0x1f77f, group: "alchemical" },
  { start: 0x1f780, end: 0x1f7ff, group: "geometric" },
  { start: 0x1f800, end: 0x1f8ff, group: "arrows" },
  { start: 0x1f900, end: 0x1f9ff, group: "supplemental" },
  { start: 0x1fa00, end: 0x1faff, group: "extended" },
  { start: 0x2600, end: 0x26ff, group: "dingbats" },
  { start: 0x2700, end: 0x27bf, group: "symbols" },
  { start: 0x2300, end: 0x23ff, group: "technical" },
  { start: 0x2b00, end: 0x2bff, group: "arrows-extended" },
];

const makeId = (emoji: string) =>
  Array.from(emoji)
    .map((char) => char.codePointAt(0)?.toString(16))
    .filter(Boolean)
    .join("-");

const buildFallback = () => {
  const entries: EmojiIcon[] = FALLBACK_SEED.map((entry) => ({
    ...entry,
    id: makeId(entry.emoji),
  }));

  const emojiRegex = /\p{Extended_Pictographic}/u;
  const emojiPresentationRegex = /\p{Emoji_Presentation}/u;
  const emojiModifierBaseRegex = /\p{Emoji_Modifier_Base}/u;
  const emojiModifierBases = new Set<string>();

  const baseEmojis: string[] = [];
  for (const range of FALLBACK_RANGES) {
    for (let cp = range.start; cp <= range.end; cp += 1) {
      const emoji = String.fromCodePoint(cp);
      if (!(emojiRegex.test(emoji) || emojiPresentationRegex.test(emoji))) continue;
      baseEmojis.push(emoji);
      if (emojiModifierBaseRegex.test(emoji)) {
        emojiModifierBases.add(emoji);
      }
      if (emojiRegex.test(emoji) && !emojiPresentationRegex.test(emoji)) {
        baseEmojis.push(`${emoji}\uFE0F`);
      }
    }
  }

  const skinTones = [0x1f3fb, 0x1f3fc, 0x1f3fd, 0x1f3fe, 0x1f3ff];
  const variantEmojis: string[] = [];
  for (const base of emojiModifierBases) {
    for (const tone of skinTones) {
      variantEmojis.push(`${base}${String.fromCodePoint(tone)}`);
    }
  }

  const regionalIndicators = Array.from({ length: 26 }, (_, i) => String.fromCodePoint(0x1f1e6 + i));
  const flagEmojis: string[] = [];
  for (const first of regionalIndicators) {
    for (const second of regionalIndicators) {
      flagEmojis.push(`${first}${second}`);
    }
  }

  const pushEntries = (list: string[], extraKeywords: string[] = [], extraGroups: string[] = []) => {
    list.forEach((emoji) => {
      const id = makeId(emoji);
      entries.push({
        id,
        emoji,
        name: `emoji ${id}`,
        keywords: ["emoji", ...extraKeywords],
        groups: ["unicode", ...extraGroups],
      });
    });
  };

  pushEntries(baseEmojis);
  pushEntries(variantEmojis, ["skin", "tone", "variant"], ["variants"]);
  pushEntries(flagEmojis, ["flag"], ["flags"]);

  entries.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
  return entries.slice(0, TARGET_COUNT);
};

const main = async () => {
  const entries = buildFallback();
  const outDir = path.join(process.cwd(), "assets", "emoji");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "emojiPalette.json"), JSON.stringify(entries, null, 2));
  console.log(`Generated ${entries.length} emoji entries.`);
};

main().catch((error) => {
  console.error("Failed to generate emoji palette:", error);
  process.exit(1);
});
