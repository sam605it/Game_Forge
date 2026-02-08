import type { Intent, TemplateDefinition } from "@/engine/types";
import { CONTROL_SCHEMES, ENTITY_KINDS, RULE_TYPES, SHAPES } from "@/engine/capabilities";
import { createEntity } from "@/engine/templates/utils";
import type { GameSpecV1 } from "@/types";

const sanitizeEntities = (spec: GameSpecV1) => {
  spec.entities = spec.entities.map((entity) => {
    const kind = ENTITY_KINDS.includes(entity.kind as typeof ENTITY_KINDS[number]) ? entity.kind : "decor";
    const renderShape =
      entity.render.type === "shape" && entity.render.shape
        ? SHAPES.includes(entity.render.shape as typeof SHAPES[number])
          ? entity.render.shape
          : "circle"
        : entity.render.shape;

    return {
      ...entity,
      kind,
      render: entity.render.type === "shape" ? { ...entity.render, shape: renderShape } : entity.render,
    };
  });
};

const sanitizeRules = (spec: GameSpecV1) => {
  spec.rules = spec.rules.filter((rule) => RULE_TYPES.includes(rule.type as typeof RULE_TYPES[number]));
};

const sanitizeControls = (spec: GameSpecV1) => {
  if (!CONTROL_SCHEMES.includes(spec.controls.scheme as typeof CONTROL_SCHEMES[number])) {
    spec.controls.scheme = "keyboard_move";
  }
};

const applyConstraints = (spec: GameSpecV1, intent: Intent) => {
  const excludes = intent.constraints.exclude ?? [];
  if (!excludes.length) return;
  const lowered = excludes.map((item) => item.toLowerCase());
  const isExcluded = (value: string) => lowered.some((term) => value.includes(term));

  spec.entities = spec.entities.filter((entity) => {
    const descriptor = `${entity.id} ${entity.kind} ${(entity.tags ?? []).join(" ")}`.toLowerCase();
    return !isExcluded(descriptor);
  });
  spec.assets = spec.assets.filter((asset) => !isExcluded(asset.toLowerCase()));
};

const ensureRequiredEntities = (spec: GameSpecV1, template: TemplateDefinition, excluded: Set<string>) => {
  for (const requirement of template.requiredEntities) {
    if (excluded.has(requirement.kind) || (requirement.tag && excluded.has(requirement.tag))) {
      continue;
    }
    const has = spec.entities.some((entity) =>
      requirement.tag
        ? entity.tags?.includes(requirement.tag)
        : entity.kind === requirement.kind,
    );
    if (has) continue;
    if (requirement.kind === "player") {
      spec.entities.push(
        createEntity({
          id: "player",
          kind: "player",
          x: 140,
          y: 300,
          width: 28,
          height: 28,
          color: "#38bdf8",
          shape: "circle",
          collider: { type: "circle", isStatic: false },
          tags: ["player"],
        }),
      );
    } else if (requirement.kind === "goal") {
      spec.entities.push(
        createEntity({
          id: "goal",
          kind: "goal",
          x: 660,
          y: 300,
          width: 32,
          height: 32,
          color: "#22c55e",
          shape: "circle",
          collider: { type: "circle", isStatic: true, isSensor: true },
          tags: ["goal"],
        }),
      );
    } else {
      spec.entities.push(
        createEntity({
          id: `${requirement.kind}-fallback`,
          kind: requirement.kind,
          x: 360,
          y: 320,
          width: 30,
          height: 30,
          color: "#94a3b8",
          shape: "circle",
          collider: { type: "circle", isStatic: true, isSensor: true },
          tags: requirement.tag ? [requirement.tag] : [requirement.kind],
        }),
      );
    }
  }
};

const ensureRequiredRules = (spec: GameSpecV1, template: TemplateDefinition) => {
  for (const ruleType of template.requiredRules) {
    const has = spec.rules.some((rule) => rule.type === ruleType);
    if (has) continue;
    if (ruleType === "win_on_goal") {
      spec.rules.push({ type: "win_on_goal", params: { targetTag: "goal", maxSpeed: 999 } });
    } else if (ruleType === "win_on_score") {
      spec.rules.push({ type: "win_on_score", params: { targetScore: 1 } });
    } else if (ruleType === "lose_on_timer") {
      spec.rules.push({ type: "lose_on_timer", params: { duration: 45 } });
    } else if (ruleType === "lose_on_lives") {
      spec.rules.push({ type: "lose_on_lives", params: { lives: 3 } });
    } else if (ruleType === "timer") {
      spec.rules.push({ type: "timer", params: { duration: 45 } });
    } else {
      spec.rules.push({ type: ruleType, params: {} });
    }
  }
};

const ensureRequiredControls = (spec: GameSpecV1, template: TemplateDefinition) => {
  if (!template.requiredControls.length) return;
  if (!template.requiredControls.includes(spec.controls.scheme as TemplateDefinition["requiredControls"][number])) {
    spec.controls.scheme = template.requiredControls[0];
  }
};

const isPlayable = (spec: GameSpecV1) => {
  const hasPlayer = spec.entities.some((entity) => entity.tags?.includes("player"));
  return Boolean(spec.title && spec.entities.length && hasPlayer);
};

export const validateRepair = (spec: GameSpecV1, intent: Intent, template: TemplateDefinition, seed: number): GameSpecV1 => {
  const repaired: GameSpecV1 = {
    ...spec,
    entities: [...spec.entities],
    rules: [...spec.rules],
    assets: [...spec.assets],
  };

  const excluded = new Set((intent.constraints.exclude ?? []).map((item) => item.toLowerCase()));

  sanitizeEntities(repaired);
  sanitizeRules(repaired);
  sanitizeControls(repaired);
  applyConstraints(repaired, intent);
  ensureRequiredEntities(repaired, template, excluded);
  ensureRequiredRules(repaired, template);
  ensureRequiredControls(repaired, template);

  if (!isPlayable(repaired)) {
    const fallback = template.buildBaseSpec(seed);
    applyConstraints(fallback, intent);
    return fallback;
  }

  return repaired;
};
