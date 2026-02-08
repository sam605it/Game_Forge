import type { TemplateDefinition } from "@/engine/types";
import { addBoundaryWalls, buildBaseSpec, createEntity, mulberry32, randomBetween } from "./utils";

export const platformer: TemplateDefinition = {
  id: "platformer",
  label: "Platformer",
  worldMode: "platformer2d",
  requiredEntities: [
    { kind: "player", tag: "player" },
    { kind: "goal", tag: "goal" },
    { kind: "wall", tag: "platform" },
  ],
  requiredControls: ["keyboard_move"],
  requiredRules: ["win_on_goal"],
  allowedModifiers: ["platforms", "pace"],
  defaultParams: { platformCount: 3 },
  buildBaseSpec: (seed: number) => {
    const rng = mulberry32(seed);
    const spec = buildBaseSpec({
      id: `platformer-${seed}`,
      title: "Platform Dash",
      description: "Hop between platforms to reach the goal.",
      category: "platforming",
      controls: "keyboard_move",
      gravity: [0, 160],
      friction: 0.9,
      restitution: 0.4,
    });

    spec.entities.push(
      createEntity({
        id: "player",
        kind: "player",
        x: 120,
        y: 420,
        width: 28,
        height: 28,
        color: "#38bdf8",
        shape: "rect",
        collider: { type: "rect", isStatic: false },
        tags: ["player"],
      }),
      createEntity({
        id: "goal",
        kind: "goal",
        x: 680,
        y: 160,
        width: 36,
        height: 36,
        color: "#22c55e",
        shape: "circle",
        collider: { type: "circle", isStatic: true, isSensor: true },
        tags: ["goal"],
      }),
    );

    addBoundaryWalls(spec, "#1f2937");

    for (let i = 0; i < 3; i += 1) {
      spec.entities.push(
        createEntity({
          id: `platform-${i}`,
          kind: "wall",
          x: randomBetween(rng, 240, 660),
          y: randomBetween(rng, 220, 480),
          width: 140,
          height: 18,
          color: "#475569",
          shape: "rect",
          collider: { type: "rect", isStatic: true },
          tags: ["wall", "platform"],
        }),
      );
    }

    spec.rules = [
      { type: "win_on_goal", params: { targetTag: "goal", maxSpeed: 999 } },
      { type: "timer", params: { duration: 50 } },
    ];

    spec.ui = {
      hud: [
        { type: "timer", label: "Time", valueKey: "time" },
        { type: "message", label: "Reach the goal" },
      ],
      messages: {
        start: "Jump across platforms!",
        win: "You made it!",
      },
    };

    return spec;
  },
  applyModifiers: (spec, intent, seed) => {
    const rng = mulberry32(seed + 55);
    const platformCount = intent.counts.wall ?? 4;
    const current = spec.entities.filter((entity) => entity.tags?.includes("platform"));
    for (let i = current.length; i < platformCount; i += 1) {
      spec.entities.push(
        createEntity({
          id: `platform-extra-${i}`,
          kind: "wall",
          x: randomBetween(rng, 220, 680),
          y: randomBetween(rng, 180, 480),
          width: 120,
          height: 16,
          color: "#64748b",
          shape: "rect",
          collider: { type: "rect", isStatic: true },
          tags: ["wall", "platform"],
        }),
      );
    }
    return spec;
  },
};
