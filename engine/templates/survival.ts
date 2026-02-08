import type { TemplateDefinition } from "@/engine/types";
import { addBoundaryWalls, buildBaseSpec, createEntity, mulberry32, randomBetween } from "./utils";

export const survival: TemplateDefinition = {
  id: "survival",
  label: "Survival",
  worldMode: "topdown2d",
  requiredEntities: [
    { kind: "player", tag: "player" },
    { kind: "enemy", tag: "enemy" },
  ],
  requiredControls: ["keyboard_move"],
  requiredRules: ["lose_on_lives", "timer"],
  allowedModifiers: ["enemies", "difficulty"],
  defaultParams: { enemyCount: 4 },
  buildBaseSpec: (seed: number) => {
    const rng = mulberry32(seed);
    const spec = buildBaseSpec({
      id: `survival-${seed}`,
      title: "Survival Grid",
      description: "Outlast the swarm while keeping your lives.",
      category: "action",
      controls: "keyboard_move",
      friction: 0.94,
    });

    spec.entities.push(
      createEntity({
        id: "player",
        kind: "player",
        x: 140,
        y: 300,
        width: 28,
        height: 28,
        color: "#22c55e",
        shape: "circle",
        collider: { type: "circle", isStatic: false },
        tags: ["player"],
      }),
    );

    for (let i = 0; i < 4; i += 1) {
      spec.entities.push(
        createEntity({
          id: `enemy-${i}`,
          kind: "enemy",
          x: randomBetween(rng, 320, 720),
          y: randomBetween(rng, 120, 520),
          width: 24,
          height: 24,
          color: "#ef4444",
          shape: "circle",
          collider: { type: "circle", isStatic: false },
          tags: ["enemy", "hazard"],
          velocity: { x: randomBetween(rng, -70, 70), y: randomBetween(rng, -70, 70) },
        }),
      );
    }

    addBoundaryWalls(spec, "#1f2937");

    spec.rules = [
      { type: "lives", params: { lives: 3 } },
      { type: "lose_on_lives", params: { lives: 3 } },
      { type: "timer", params: { duration: 40 } },
    ];

    spec.ui = {
      hud: [
        { type: "timer", label: "Time", valueKey: "time" },
        { type: "message", label: "Stay alive" },
      ],
      messages: {
        start: "Avoid the swarm!",
        lose: "You were overwhelmed!",
      },
    };

    return spec;
  },
  applyModifiers: (spec, intent, seed) => {
    const rng = mulberry32(seed + 88);
    if (intent.difficulty === "hard") {
      spec.rules = spec.rules.map((rule) =>
        rule.type === "timer" ? { ...rule, params: { duration: 30 } } : rule,
      );
    }
    const enemyCount = intent.counts.enemy ?? 5;
    const current = spec.entities.filter((entity) => entity.tags?.includes("enemy"));
    for (let i = current.length; i < enemyCount; i += 1) {
      spec.entities.push(
        createEntity({
          id: `enemy-extra-${i}`,
          kind: "enemy",
          x: randomBetween(rng, 320, 720),
          y: randomBetween(rng, 120, 520),
          width: 24,
          height: 24,
          color: "#f87171",
          shape: "circle",
          collider: { type: "circle", isStatic: false },
          tags: ["enemy", "hazard"],
          velocity: { x: randomBetween(rng, -90, 90), y: randomBetween(rng, -90, 90) },
        }),
      );
    }
    return spec;
  },
};
