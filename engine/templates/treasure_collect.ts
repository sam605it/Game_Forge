import type { TemplateDefinition } from "@/engine/types";
import { addBoundaryWalls, buildBaseSpec, createEntity, mulberry32, randomBetween } from "./utils";

export const treasureCollect: TemplateDefinition = {
  id: "treasure_collect",
  label: "Treasure Collect",
  worldMode: "topdown2d",
  requiredEntities: [
    { kind: "player", tag: "player" },
    { kind: "pickup", tag: "pickup" },
  ],
  requiredControls: ["keyboard_move"],
  requiredRules: ["score", "win_on_score"],
  allowedModifiers: ["pickups", "theme"],
  defaultParams: { pickupCount: 5 },
  buildBaseSpec: (seed: number) => {
    const rng = mulberry32(seed);
    const spec = buildBaseSpec({
      id: `treasure-collect-${seed}`,
      title: "Treasure Hunt",
      description: "Collect the scattered relics before time runs out.",
      category: "arcade",
      controls: "keyboard_move",
      friction: 0.95,
    });

    spec.entities.push(
      createEntity({
        id: "player",
        kind: "player",
        x: 120,
        y: 300,
        width: 28,
        height: 28,
        color: "#38bdf8",
        shape: "circle",
        collider: { type: "circle", isStatic: false },
        tags: ["player"],
      }),
    );

    for (let i = 0; i < 5; i += 1) {
      spec.entities.push(
        createEntity({
          id: `pickup-${i}`,
          kind: "pickup",
          x: randomBetween(rng, 200, 720),
          y: randomBetween(rng, 120, 520),
          width: 20,
          height: 20,
          color: "#facc15",
          shape: "circle",
          collider: { type: "circle", isStatic: true, isSensor: true },
          tags: ["pickup", "treasure"],
        }),
      );
    }

    addBoundaryWalls(spec, "#1f2937");

    spec.rules = [
      { type: "score", params: { targetTag: "pickup", amount: 1 } },
      { type: "win_on_score", params: { targetScore: 5 } },
      { type: "timer", params: { duration: 45 } },
    ];

    spec.ui = {
      hud: [
        { type: "score", label: "Relics", valueKey: "score" },
        { type: "timer", label: "Time", valueKey: "time" },
      ],
      messages: {
        start: "Collect all relics!",
        win: "Treasure secured!",
      },
    };

    return spec;
  },
  applyModifiers: (spec, intent, seed) => {
    const rng = mulberry32(seed + 77);
    const pickupCount = intent.counts.pickup ?? 6;
    const current = spec.entities.filter((entity) => entity.tags?.includes("pickup"));
    for (let i = current.length; i < pickupCount; i += 1) {
      spec.entities.push(
        createEntity({
          id: `pickup-extra-${i}`,
          kind: "pickup",
          x: randomBetween(rng, 200, 720),
          y: randomBetween(rng, 120, 520),
          width: 20,
          height: 20,
          color: "#fde047",
          shape: "circle",
          collider: { type: "circle", isStatic: true, isSensor: true },
          tags: ["pickup", "treasure"],
        }),
      );
    }
    const winRule = spec.rules.find((rule) => rule.type === "win_on_score");
    if (winRule) {
      winRule.params.targetScore = pickupCount;
    }
    return spec;
  },
};
