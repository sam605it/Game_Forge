import type { TemplateDefinition } from "@/engine/types";
import { addBoundaryWalls, buildBaseSpec, createEntity, mulberry32, randomBetween } from "./utils";

export const dodgeArena: TemplateDefinition = {
  id: "dodge_arena",
  label: "Dodge Arena",
  worldMode: "topdown2d",
  requiredEntities: [
    { kind: "player", tag: "player" },
    { kind: "hazard", tag: "hazard" },
  ],
  requiredControls: ["keyboard_move"],
  requiredRules: ["lose_on_lives"],
  allowedModifiers: ["hazards", "pace"],
  defaultParams: { hazardCount: 5 },
  buildBaseSpec: (seed: number) => {
    const rng = mulberry32(seed);
    const spec = buildBaseSpec({
      id: `dodge-arena-${seed}`,
      title: "Dodge Arena",
      description: "Survive the arena as hazards bounce around.",
      category: "arcade",
      controls: "keyboard_move",
      friction: 0.94,
    });

    spec.entities.push(
      createEntity({
        id: "player",
        kind: "player",
        x: 160,
        y: 300,
        width: 28,
        height: 28,
        color: "#22c55e",
        shape: "circle",
        collider: { type: "circle", isStatic: false },
        tags: ["player"],
      }),
    );

    for (let i = 0; i < 5; i += 1) {
      spec.entities.push(
        createEntity({
          id: `hazard-${i}`,
          kind: "hazard",
          x: randomBetween(rng, 280, 720),
          y: randomBetween(rng, 120, 520),
          width: 24,
          height: 24,
          color: "#f97316",
          shape: "circle",
          collider: { type: "circle", isStatic: false },
          tags: ["hazard"],
          velocity: { x: randomBetween(rng, -80, 80), y: randomBetween(rng, -80, 80) },
        }),
      );
    }

    addBoundaryWalls(spec, "#334155");

    spec.rules = [
      { type: "lives", params: { lives: 3 } },
      { type: "lose_on_lives", params: { lives: 3 } },
      { type: "timer", params: { duration: 35 } },
    ];
    spec.ui = {
      hud: [
        { type: "timer", label: "Survive", valueKey: "time" },
        { type: "message", label: "Avoid hazards" },
      ],
      messages: {
        start: "Dodge the hazards!",
        lose: "You got hit!",
      },
    };

    return spec;
  },
  applyModifiers: (spec, intent, seed) => {
    const rng = mulberry32(seed + 33);
    if (intent.pace === "fast") {
      spec.world.physics.friction = 0.92;
    }
    const hazardCount = intent.counts.hazard ?? 6;
    const currentHazards = spec.entities.filter((entity) => entity.tags?.includes("hazard"));
    for (let i = currentHazards.length; i < hazardCount; i += 1) {
      spec.entities.push(
        createEntity({
          id: `hazard-extra-${i}`,
          kind: "hazard",
          x: randomBetween(rng, 240, 720),
          y: randomBetween(rng, 100, 520),
          width: 22,
          height: 22,
          color: "#f59e0b",
          shape: "circle",
          collider: { type: "circle", isStatic: false },
          tags: ["hazard"],
          velocity: { x: randomBetween(rng, -100, 100), y: randomBetween(rng, -100, 100) },
        }),
      );
    }
    return spec;
  },
};
