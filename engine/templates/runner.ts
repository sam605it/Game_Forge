import type { TemplateDefinition } from "@/engine/types";
import { addBoundaryWalls, buildBaseSpec, createEntity, mulberry32, randomBetween } from "./utils";

export const runner: TemplateDefinition = {
  id: "runner",
  label: "Endless Runner",
  worldMode: "platformer2d",
  requiredEntities: [
    { kind: "player", tag: "player" },
    { kind: "goal", tag: "goal" },
    { kind: "hazard", tag: "hazard" },
  ],
  requiredControls: ["keyboard_move"],
  requiredRules: ["win_on_goal"],
  allowedModifiers: ["pace", "hazards"],
  defaultParams: { hazardCount: 3 },
  buildBaseSpec: (seed: number) => {
    const rng = mulberry32(seed);
    const spec = buildBaseSpec({
      id: `runner-${seed}`,
      title: "Skyline Runner",
      description: "Sprint through obstacles to reach the finish beacon.",
      category: "platforming",
      controls: "keyboard_move",
      gravity: [0, 120],
      friction: 0.93,
      restitution: 0.6,
    });

    spec.entities.push(
      createEntity({
        id: "player",
        kind: "player",
        x: 120,
        y: 420,
        width: 30,
        height: 30,
        color: "#38bdf8",
        shape: "rect",
        collider: { type: "rect", isStatic: false },
        tags: ["player"],
      }),
      createEntity({
        id: "goal",
        kind: "goal",
        x: 680,
        y: 420,
        width: 40,
        height: 40,
        color: "#a855f7",
        shape: "circle",
        collider: { type: "circle", isStatic: true, isSensor: true },
        tags: ["goal"],
      }),
    );

    addBoundaryWalls(spec, "#1f2937");

    for (let i = 0; i < 3; i += 1) {
      spec.entities.push(
        createEntity({
          id: `hazard-${i}`,
          kind: "hazard",
          x: randomBetween(rng, 260, 640),
          y: randomBetween(rng, 360, 480),
          width: 24,
          height: 24,
          color: "#ef4444",
          shape: "rect",
          collider: { type: "circle", isStatic: true, isSensor: true },
          tags: ["hazard"],
        }),
      );
    }

    spec.rules = [
      { type: "win_on_goal", params: { targetTag: "goal", maxSpeed: 999 } },
      { type: "timer", params: { duration: 40 } },
      { type: "lose_on_timer", params: { duration: 40 } },
    ];

    spec.ui = {
      hud: [
        { type: "timer", label: "Time", valueKey: "time" },
        { type: "message", label: "Dash" },
      ],
      messages: {
        start: "Run to the finish beacon!",
        win: "Finished!",
        lose: "Time's up!",
      },
    };

    return spec;
  },
  applyModifiers: (spec, intent, seed) => {
    const rng = mulberry32(seed + 44);
    const hazardCount = intent.counts.hazard ?? 4;
    const current = spec.entities.filter((entity) => entity.tags?.includes("hazard"));
    for (let i = current.length; i < hazardCount; i += 1) {
      spec.entities.push(
        createEntity({
          id: `hazard-extra-${i}`,
          kind: "hazard",
          x: randomBetween(rng, 260, 720),
          y: randomBetween(rng, 340, 500),
          width: 24,
          height: 24,
          color: "#fb7185",
          shape: "circle",
          collider: { type: "circle", isStatic: true, isSensor: true },
          tags: ["hazard"],
        }),
      );
    }
    return spec;
  },
};
