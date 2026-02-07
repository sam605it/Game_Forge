import { CATEGORY_TEMPLATE_MAP, DEFAULT_CONSTRAINTS, SUPPORTED_COMPONENTS } from "./defaults";
import { isBanned } from "./promptContract";
import { CATEGORY_PLAYBOOKS } from "./playbooks";
import type { Category, GameEntity, GameSpecV1, Rule } from "./types";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

const makeEntity = (id: string, kind: string, x: number, y: number): GameEntity => ({
  id,
  kind,
  components: {
    Transform: { pos: [x, y] },
    Sprite: { ref: kind },
    CircleCollider: { radius: 10 },
  },
});

const ensureEntityKind = (entities: GameEntity[], kind: string, fallbackId: string, x: number, y: number) => {
  if (!entities.some((entity) => entity.kind === kind)) {
    entities.push(makeEntity(fallbackId, kind, x, y));
  }
};

const ensureCategoryEntities = (spec: GameSpecV1) => {
  const category = spec.metadata.category;
  const required = CATEGORY_PLAYBOOKS[category].requiredEntityKinds;
  const out = [...spec.entities];

  required.forEach((kind, idx) => ensureEntityKind(out, kind, `${kind}_${idx + 1}`, 80 + idx * 70, 90 + idx * 24));

  const playerLike = out.find((e) => e.kind === "player" || e.kind === "ball" || e.kind === "car") ?? out[0];
  if (playerLike && !playerLike.components.InputController) {
    playerLike.components.InputController = {
      scheme: category === "sports" ? "drag_shot" : category === "word_trivia" ? "click" : "wasd",
    };
  }
  if (playerLike && !playerLike.components.RigidBody) {
    playerLike.components.RigidBody = { type: "dynamic", mass: 1 };
  }

  const goalLike = out.find((e) => e.kind === "goal" || e.kind === "finish" || e.kind === "target");
  if (goalLike && !goalLike.components.Goal) {
    goalLike.components.Goal = {
      type: category === "word_trivia" ? "score_target" : "enter_trigger",
      target: playerLike?.id,
      value: 1,
    };
    if (!goalLike.components.CircleCollider && !goalLike.components.BoxCollider) {
      goalLike.components.CircleCollider = { radius: 16, isTrigger: true };
    }
  }

  return out;
};

const ensureRules = (spec: GameSpecV1): Rule[] => {
  const existing = [...spec.rules];

  if (existing.length === 0) {
    return [
      {
        when: { event: "GoalReached", entity: "goal_1" },
        do: [
          { action: "AddScore", amount: 100 },
          { action: "ShowMessage", text: "Objective complete!" },
          { action: "EndRound", result: "win" },
        ],
      } as Rule,
    ];
  }

  const hasEndRound = existing.some((rule) =>
    rule.do.some((action) => action.action === "EndRound"),
  );

  if (!hasEndRound) {
    existing.push({
      when: { event: "TimerElapsed" },
      do: [
        { action: "ShowMessage", text: "Time is up!" },
        { action: "EndRound", result: "lose" },
      ],
    });
  }

  return existing;
};

const applyThemeHints = (spec: GameSpecV1) => {
  const text = `${spec.metadata.title} ${spec.metadata.mechanics.join(" ")}`.toLowerCase();
  const hasTrees = text.includes("tree") || text.includes("forest");
  const hasBunny = text.includes("bunny") || text.includes("rabbit");
  const hasTiger = text.includes("tiger");
  const hasStatue = text.includes("statue");

  if (hasTrees && !isBanned("tree", spec) && !spec.entities.some((entity) => entity.kind === "obstacle")) {
    spec.entities.push({
      id: "tree_spawner_auto",
      kind: "decor_spawner",
      components: {
        Spawner: {
          kind: "scatter",
          targetKind: "tree",
          count: 40,
          area: { min: [60, 40], max: [720, 300] },
        },
      },
    });
  }

  if (hasStatue) {
    spec.entities.push({
      id: "big_statue",
      kind: "obstacle",
      components: {
        Transform: { pos: [420, 160] },
        BoxCollider: { size: [64, 64], isTrigger: false },
        Sprite: { ref: "big_statue" },
      },
    });
  }

  if (hasBunny) spec.assets.sprites.player = "emoji:bunny";
  if (hasTiger) spec.assets.sprites.player = "emoji:tiger";
};

export function applyCategoryPreset(spec: GameSpecV1): GameSpecV1 {
  const category: Category = spec.metadata.category;
  const playbook = CATEGORY_PLAYBOOKS[category];

  const normalized: GameSpecV1 = {
    ...spec,
    metadata: {
      ...spec.metadata,
      template: CATEGORY_TEMPLATE_MAP[category] ?? playbook.defaultTemplate,
      mechanics: Array.from(new Set([...(spec.metadata.mechanics ?? []), ...playbook.requiredMechanics])),
    },
    world: {
      physics: {
        gravity: playbook.physics.gravity,
        friction: playbook.physics.friction,
        restitution: playbook.physics.restitution,
        timeStep: playbook.physics.timeStep,
      },
      camera: {
        mode: playbook.preferredCamera,
        target: playbook.preferredCamera === "follow" ? "player_1" : undefined,
      },
    },
    components: {
      supported: SUPPORTED_COMPONENTS,
    },
    rules: spec.rules,
    constraints: {
      maxEntities: clamp(spec.constraints.maxEntities || DEFAULT_CONSTRAINTS.maxEntities, 10, 500),
      maxSounds: clamp(spec.constraints.maxSounds || DEFAULT_CONSTRAINTS.maxSounds, 0, 128),
      targetFPS: clamp(spec.constraints.targetFPS || DEFAULT_CONSTRAINTS.targetFPS, 24, 120),
      maxRules: clamp(spec.constraints.maxRules || DEFAULT_CONSTRAINTS.maxRules || 128, 1, 500),
      maxParticles: clamp(spec.constraints.maxParticles || DEFAULT_CONSTRAINTS.maxParticles || 300, 0, 5000),
      requiredEntities: spec.constraints.requiredEntities ?? DEFAULT_CONSTRAINTS.requiredEntities ?? [],
      bannedEntities: spec.constraints.bannedEntities ?? DEFAULT_CONSTRAINTS.bannedEntities ?? [],
    },
    promptContract: spec.promptContract,
  };

  normalized.entities = ensureCategoryEntities(normalized).slice(0, normalized.constraints.maxEntities);
  normalized.rules = ensureRules(normalized).slice(0, normalized.constraints.maxRules);
  applyThemeHints(normalized);

  return normalized;
}
