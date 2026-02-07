import type { RequirementList } from "@/lib/nlp/requirements";
import type { GameSpec } from "@/lib/gamespec/schema";
import { resolveIconId } from "@/lib/icons/iconCatalog";

function seededRandom(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return () => {
    hash = (hash * 9301 + 49297) % 233280;
    return Math.abs(hash) / 233280;
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function buildMiniGolfSpec(requirements: RequirementList): GameSpec {
  const seed = requirements.raw.toLowerCase().replace(/\s+/g, "-");
  const random = seededRandom(seed);
  const holeCount = clamp(requirements.counts.holes ?? 1, 1, 9);

  const worldWidth = 900;
  const worldHeight = 520;
  const bounds = { x: 40, y: 40, width: worldWidth - 80, height: worldHeight - 80 };

  const holes = Array.from({ length: holeCount }).map((_, index) => {
    const x = bounds.x + 120 + index * ((bounds.width - 200) / holeCount);
    const y = bounds.y + 80 + random() * (bounds.height - 160);
    return {
      index,
      position: [Math.round(x), Math.round(y)] as [number, number],
      tee: [bounds.x + 80, bounds.y + 80 + index * 40] as [number, number],
    };
  });

  const themeSkin = requirements.theme.skin;
  const themePalette = requirements.theme.palette;
  const ballIcon = resolveIconId({ semantic: themeSkin, role: "ball", palette: themePalette, mood: requirements.theme.mood });
  const holeIcon = resolveIconId({ semantic: "hole", role: "hole", palette: themePalette });
  const wallIcon = resolveIconId({ semantic: "wall", role: "wall", palette: themePalette });

  const entities: GameSpec["entities"] = [];

  entities.push({
    id: "golf-ball",
    type: "golf_ball",
    pos: holes[0].tee,
    size: [72, 72],
    sprite: { iconId: ballIcon },
    props: { holeIndex: 0 },
  });

  holes.forEach((hole) => {
    entities.push({
      id: `hole-${hole.index}`,
      type: "hole",
      pos: hole.position,
      size: [84, 84],
      sprite: { iconId: holeIcon },
      props: { holeIndex: hole.index, tee: hole.tee },
    });
  });

  const wallEntities = [
    { id: "wall-top", pos: [bounds.x, bounds.y], size: [bounds.width, 20] },
    { id: "wall-bottom", pos: [bounds.x, bounds.y + bounds.height - 20], size: [bounds.width, 20] },
    { id: "wall-left", pos: [bounds.x, bounds.y], size: [20, bounds.height] },
    { id: "wall-right", pos: [bounds.x + bounds.width - 20, bounds.y], size: [20, bounds.height] },
  ];

  wallEntities.forEach((wall) => {
    entities.push({
      id: wall.id,
      type: "wall",
      pos: wall.pos as [number, number],
      size: wall.size as [number, number],
      sprite: { iconId: wallIcon },
    });
  });

  const includeDecorations = requirements.inclusions.filter(
    (item) => !requirements.exclusions.some((exclusion) => item.includes(exclusion)),
  );

  let decorIndex = 0;
  includeDecorations.forEach((item) => {
    const count = requirements.inclusionCounts[item] ?? 1;
    for (let i = 0; i < count; i += 1) {
      const iconId = resolveIconId({ semantic: item, role: "decoration", palette: themePalette });
      const x = bounds.x + 140 + decorIndex * 60;
      const y = bounds.y + 120 + (decorIndex % 3) * 80;
      entities.push({
        id: `decor-${item}-${decorIndex}`,
        type: item,
        pos: [x, y],
        size: [84, 84],
        sprite: { iconId },
      });
      decorIndex += 1;
    }
  });

  const layout = {
    holeCount,
    bounds,
    holes,
  };

  return {
    title: requirements.raw,
    template: "mini_golf",
    theme: {
      skin: themeSkin,
      palette: themePalette,
      mood: requirements.theme.mood,
      exclude: requirements.exclusions.length ? requirements.exclusions : undefined,
    },
    world: {
      width: worldWidth,
      height: worldHeight,
      physics: {
        gravity: [0, 0],
        friction: requirements.constraints.includes("fast") ? 0.92 : 0.96,
        restitution: 0.8,
      },
      camera: { mode: "static" },
    },
    level: {
      seed,
      layout,
    },
    entities,
    rules: {
      winCondition: holeCount === 1 ? "Sink the ball in the hole." : `Sink all ${holeCount} holes.`,
      maxStrokes: requirements.constraints.includes("hard") ? holeCount * 4 : holeCount * 6,
    },
  };
}
