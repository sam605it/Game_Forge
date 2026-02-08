import type { TemplateDefinition } from "@/engine/types";
import { buildBaseSpec, createEntity } from "./utils";

export const createStubTemplate = (config: {
  id: string;
  label: string;
  category: Parameters<typeof buildBaseSpec>[0]["category"];
  worldMode: TemplateDefinition["worldMode"];
  controls?: TemplateDefinition["requiredControls"][number];
}) => {
  const controls = config.controls ?? "keyboard_move";
  const template: TemplateDefinition = {
    id: config.id,
    label: config.label,
    worldMode: config.worldMode,
    requiredEntities: [
      { kind: "player", tag: "player" },
      { kind: "goal", tag: "goal" },
    ],
    requiredControls: [controls],
    requiredRules: ["win_on_goal"],
    allowedModifiers: [],
    defaultParams: {},
    buildBaseSpec: (seed) => {
      const spec = buildBaseSpec({
        id: `${config.id}-${seed}`,
        title: config.label,
        description: `Reach the goal in ${config.label}.`,
        category: config.category,
        controls,
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
        createEntity({
          id: "goal",
          kind: "goal",
          x: 680,
          y: 300,
          width: 36,
          height: 36,
          color: "#22c55e",
          shape: "circle",
          collider: { type: "circle", isStatic: true, isSensor: true },
          tags: ["goal"],
        }),
      );

      spec.rules = [{ type: "win_on_goal", params: { targetTag: "goal", maxSpeed: 999 } }];
      spec.ui = {
        hud: [{ type: "message", label: "Reach the goal" }],
        messages: { start: "Reach the goal!", win: "Goal reached!" },
      };
      return spec;
    },
    applyModifiers: (spec) => spec,
  };
  return template;
};
