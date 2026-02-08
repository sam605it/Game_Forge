import type { TemplateDefinition } from "@/engine/types";
import { addBoundaryWalls, buildBaseSpec, createEntity } from "./utils";

export const breakout: TemplateDefinition = {
  id: "breakout",
  label: "Block Breaker",
  worldMode: "topdown2d",
  requiredEntities: [
    { kind: "player", tag: "player" },
    { kind: "pickup", tag: "block" },
  ],
  requiredControls: ["mouse_aim_shoot"],
  requiredRules: ["score", "win_on_score"],
  allowedModifiers: ["blocks"],
  defaultParams: { blockCount: 6 },
  buildBaseSpec: (seed: number) => {
    const spec = buildBaseSpec({
      id: `breakout-${seed}`,
      title: "Block Breaker",
      description: "Clear the blocks with precision shots.",
      category: "arcade",
      controls: "mouse_aim_shoot",
      friction: 0.96,
    });

    spec.entities.push(
      createEntity({
        id: "player",
        kind: "player",
        x: 160,
        y: 480,
        width: 32,
        height: 32,
        color: "#38bdf8",
        shape: "rect",
        collider: { type: "rect", isStatic: false },
        tags: ["player"],
      }),
    );

    const rows = 2;
    const cols = 3;
    let id = 0;
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        spec.entities.push(
          createEntity({
            id: `block-${id++}`,
            kind: "pickup",
            x: 260 + c * 120,
            y: 160 + r * 60,
            width: 80,
            height: 26,
            color: "#f97316",
            shape: "rect",
            collider: { type: "rect", isStatic: true, isSensor: true },
            tags: ["pickup", "block"],
          }),
        );
      }
    }

    addBoundaryWalls(spec, "#1f2937");

    spec.rules = [
      { type: "score", params: { targetTag: "block", amount: 1 } },
      { type: "win_on_score", params: { targetScore: rows * cols } },
    ];

    spec.ui = {
      hud: [
        { type: "score", label: "Blocks", valueKey: "score" },
        { type: "message", label: "Clear the board" },
      ],
      messages: {
        start: "Click to break blocks!",
        win: "Blocks cleared!",
      },
    };

    return spec;
  },
  applyModifiers: (spec) => spec,
};
