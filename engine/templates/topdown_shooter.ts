import type { TemplateDefinition } from "@/engine/types";
import { addBoundaryWalls, buildBaseSpec, createEntity, mulberry32, randomBetween } from "./utils";

export const topdownShooter: TemplateDefinition = {
  id: "topdown_shooter",
  label: "Topdown Shooter",
  worldMode: "topdown2d",
  requiredEntities: [
    { kind: "player", tag: "player" },
    { kind: "enemy", tag: "enemy" },
  ],
  requiredControls: ["mouse_aim_shoot"],
  requiredRules: ["score", "win_on_score"],
  allowedModifiers: ["enemies", "pace", "theme"],
  defaultParams: { enemyCount: 4 },
  buildBaseSpec: (seed: number) => {
    const rng = mulberry32(seed);
    const spec = buildBaseSpec({
      id: `topdown-shooter-${seed}`,
      title: "Topdown Blaster",
      description: "Move and click to blast the closest target.",
      category: "shooter",
      controls: "mouse_aim_shoot",
      friction: 0.95,
    });

    spec.entities.push(
      createEntity({
        id: "player",
        kind: "player",
        x: 140,
        y: 300,
        width: 30,
        height: 30,
        color: "#38bdf8",
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
          x: randomBetween(rng, 360, 720),
          y: randomBetween(rng, 120, 520),
          width: 26,
          height: 26,
          color: "#ef4444",
          shape: "circle",
          collider: { type: "circle", isStatic: false },
          tags: ["enemy", "target"],
          velocity: { x: randomBetween(rng, -40, 40), y: randomBetween(rng, -40, 40) },
        }),
      );
    }

    addBoundaryWalls(spec, "#1f2937");

    spec.rules = [
      { type: "score", params: { targetTag: "enemy", amount: 1 } },
      { type: "win_on_score", params: { targetScore: 4 } },
      { type: "timer", params: { duration: 45 } },
    ];
    spec.ui = {
      hud: [
        { type: "score", label: "Targets", valueKey: "score" },
        { type: "timer", label: "Time", valueKey: "time" },
      ],
      messages: {
        start: "Move with keys, click to shoot the nearest enemy.",
        win: "Targets cleared!",
        lose: "Out of time!",
      },
    };

    return spec;
  },
  applyModifiers: (spec, intent, seed) => {
    const rng = mulberry32(seed + 22);
    const enemyCount = intent.counts.enemy ?? 4;
    const currentEnemies = spec.entities.filter((entity) => entity.tags?.includes("enemy"));
    const missing = Math.max(0, enemyCount - currentEnemies.length);
    for (let i = 0; i < missing; i += 1) {
      spec.entities.push(
        createEntity({
          id: `enemy-extra-${i}`,
          kind: "enemy",
          x: randomBetween(rng, 360, 720),
          y: randomBetween(rng, 120, 520),
          width: 26,
          height: 26,
          color: "#f97316",
          shape: "circle",
          collider: { type: "circle", isStatic: false },
          tags: ["enemy", "target"],
          velocity: { x: randomBetween(rng, -60, 60), y: randomBetween(rng, -60, 60) },
        }),
      );
    }
    const winRule = spec.rules.find((rule) => rule.type === "win_on_score");
    if (winRule) {
      winRule.params.targetScore = enemyCount;
    }
    return spec;
  },
};
