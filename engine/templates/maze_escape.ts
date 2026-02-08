import type { TemplateDefinition } from "@/engine/types";
import { addBoundaryWalls, buildBaseSpec, createEntity, mulberry32, randomBetween } from "./utils";

export const mazeEscape: TemplateDefinition = {
  id: "maze_escape",
  label: "Maze Escape",
  worldMode: "grid2d",
  requiredEntities: [
    { kind: "player", tag: "player" },
    { kind: "goal", tag: "goal" },
    { kind: "wall", tag: "wall" },
  ],
  requiredControls: ["keyboard_move"],
  requiredRules: ["win_on_goal"],
  allowedModifiers: ["maze", "difficulty"],
  defaultParams: { wallCount: 6 },
  buildBaseSpec: (seed: number) => {
    const rng = mulberry32(seed);
    const spec = buildBaseSpec({
      id: `maze-escape-${seed}`,
      title: "Maze Escape",
      description: "Navigate the maze and reach the exit portal.",
      category: "puzzle",
      controls: "keyboard_move",
      friction: 0.98,
    });

    spec.entities.push(
      createEntity({
        id: "player",
        kind: "player",
        x: 100,
        y: 500,
        width: 26,
        height: 26,
        color: "#22c55e",
        shape: "circle",
        collider: { type: "circle", isStatic: false },
        tags: ["player"],
      }),
      createEntity({
        id: "goal",
        kind: "goal",
        x: 700,
        y: 120,
        width: 32,
        height: 32,
        color: "#a855f7",
        shape: "circle",
        collider: { type: "circle", isStatic: true, isSensor: true },
        tags: ["goal"],
      }),
    );

    addBoundaryWalls(spec, "#0f172a");

    for (let i = 0; i < 6; i += 1) {
      spec.entities.push(
        createEntity({
          id: `wall-${i}`,
          kind: "wall",
          x: randomBetween(rng, 180, 640),
          y: randomBetween(rng, 160, 520),
          width: randomBetween(rng, 120, 200),
          height: 16,
          color: "#334155",
          shape: "rect",
          collider: { type: "rect", isStatic: true },
          tags: ["wall"],
        }),
      );
    }

    spec.rules = [
      { type: "win_on_goal", params: { targetTag: "goal", maxSpeed: 999 } },
      { type: "timer", params: { duration: 60 } },
    ];

    spec.ui = {
      hud: [
        { type: "timer", label: "Time", valueKey: "time" },
        { type: "message", label: "Find the exit" },
      ],
      messages: {
        start: "Escape the maze.",
        win: "You escaped!",
      },
    };

    return spec;
  },
  applyModifiers: (spec, intent, seed) => {
    if (intent.difficulty === "hard") {
      const rng = mulberry32(seed + 66);
      spec.entities.push(
        createEntity({
          id: "wall-extra",
          kind: "wall",
          x: randomBetween(rng, 220, 620),
          y: randomBetween(rng, 180, 520),
          width: 180,
          height: 16,
          color: "#1f2937",
          shape: "rect",
          collider: { type: "rect", isStatic: true },
          tags: ["wall"],
        }),
      );
    }
    return spec;
  },
};
