import type { TemplateDefinition } from "@/engine/types";
import { addBoundaryWalls, addDecorCluster, buildBaseSpec, createEntity, mulberry32, randomBetween } from "./utils";

export const minigolf: TemplateDefinition = {
  id: "minigolf",
  label: "Mini Golf",
  worldMode: "topdown2d",
  requiredEntities: [
    { kind: "player", tag: "player" },
    { kind: "goal", tag: "goal" },
    { kind: "wall", tag: "wall" },
  ],
  requiredControls: ["drag_launch"],
  requiredRules: ["win_on_goal"],
  allowedModifiers: ["hazards", "course", "theme"],
  defaultParams: { hazardCount: 1 },
  buildBaseSpec: (seed: number) => {
    const rng = mulberry32(seed);
    const spec = buildBaseSpec({
      id: `minigolf-${seed}`,
      title: "Mini Golf Greens",
      description: "Sink the ball into the cup with careful aim.",
      category: "sports",
      controls: "drag_launch",
      friction: 0.97,
      restitution: 0.8,
    });

    spec.entities.push(
      createEntity({
        id: "player",
        kind: "player",
        x: 120,
        y: 420,
        width: 22,
        height: 22,
        color: "#f8fafc",
        shape: "circle",
        collider: { type: "circle", isStatic: false },
        tags: ["player", "ball"],
      }),
      createEntity({
        id: "goal",
        kind: "goal",
        x: 660,
        y: 180,
        width: 28,
        height: 28,
        color: "#0f172a",
        shape: "circle",
        collider: { type: "circle", isStatic: true, isSensor: true },
        tags: ["goal", "cup"],
      }),
    );

    addBoundaryWalls(spec, "#334155");

    spec.entities.push(
      createEntity({
        id: "wall-mid",
        kind: "wall",
        x: 420,
        y: 320,
        width: 220,
        height: 18,
        color: "#475569",
        shape: "rect",
        collider: { type: "rect", isStatic: true },
        tags: ["wall"],
      }),
    );

    const hazardX = randomBetween(rng, 280, 520);
    const hazardY = randomBetween(rng, 260, 420);
    spec.entities.push(
      createEntity({
        id: "hazard-water",
        kind: "hazard",
        x: hazardX,
        y: hazardY,
        width: 120,
        height: 50,
        color: "#38bdf8",
        shape: "rect",
        collider: { type: "rect", isStatic: true, isSensor: true },
        tags: ["hazard", "water"],
      }),
    );

    addDecorCluster(spec, rng, { count: 6, color: "#16a34a", tag: "bush" });

    spec.rules = [
      { type: "win_on_goal", params: { targetTag: "goal", maxSpeed: 1.6 } },
      { type: "score", params: { label: "Strokes", amount: 1 } },
    ];
    spec.ui = {
      hud: [
        { type: "score", label: "Strokes", valueKey: "score" },
        { type: "message", label: "Aim with drag" },
      ],
      messages: {
        start: "Drag to aim, release to shoot.",
        win: "Hole in!",
      },
    };

    return spec;
  },
  applyModifiers: (spec, intent, seed) => {
    const rng = mulberry32(seed + 11);
    if (intent.difficulty === "hard") {
      spec.world.physics.friction = 0.93;
      spec.entities.push(
        createEntity({
          id: "hazard-sand",
          kind: "hazard",
          x: randomBetween(rng, 260, 540),
          y: randomBetween(rng, 140, 320),
          width: 90,
          height: 45,
          color: "#facc15",
          shape: "rect",
          collider: { type: "rect", isStatic: true, isSensor: true },
          tags: ["hazard", "sand"],
        }),
      );
    }
    return spec;
  },
};
