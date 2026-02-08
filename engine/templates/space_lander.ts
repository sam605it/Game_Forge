import type { TemplateDefinition } from "@/engine/types";
import { addBoundaryWalls, buildBaseSpec, createEntity } from "./utils";

export const spaceLander: TemplateDefinition = {
  id: "space_lander",
  label: "Space Lander",
  worldMode: "platformer2d",
  requiredEntities: [
    { kind: "player", tag: "player" },
    { kind: "goal", tag: "goal" },
  ],
  requiredControls: ["drag_launch"],
  requiredRules: ["win_on_goal"],
  allowedModifiers: ["difficulty"],
  defaultParams: {},
  buildBaseSpec: (seed: number) => {
    const spec = buildBaseSpec({
      id: `space-lander-${seed}`,
      title: "Lunar Lander",
      description: "Drift into the landing pad with a gentle touch.",
      category: "simulation",
      controls: "drag_launch",
      gravity: [0, 40],
      friction: 0.98,
      restitution: 0.4,
    });

    spec.entities.push(
      createEntity({
        id: "player",
        kind: "player",
        x: 160,
        y: 120,
        width: 26,
        height: 26,
        color: "#e2e8f0",
        shape: "rect",
        collider: { type: "rect", isStatic: false },
        tags: ["player"],
      }),
      createEntity({
        id: "goal",
        kind: "goal",
        x: 620,
        y: 500,
        width: 70,
        height: 20,
        color: "#22c55e",
        shape: "rect",
        collider: { type: "rect", isStatic: true, isSensor: true },
        tags: ["goal", "pad"],
      }),
    );

    addBoundaryWalls(spec, "#0f172a");

    spec.rules = [
      { type: "win_on_goal", params: { targetTag: "goal", maxSpeed: 2.2 } },
      { type: "timer", params: { duration: 50 } },
    ];

    spec.ui = {
      hud: [
        { type: "timer", label: "Fuel", valueKey: "time" },
        { type: "message", label: "Land softly" },
      ],
      messages: {
        start: "Drag to fire thrusters.",
        win: "Smooth landing!",
      },
    };

    return spec;
  },
  applyModifiers: (spec, intent) => {
    if (intent.difficulty === "hard") {
      spec.world.physics.gravity = [0, 60];
    }
    return spec;
  },
};
