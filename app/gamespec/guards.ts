import {
  CATEGORIES,
  type Category,
  type GameEntity,
  type GameSpecV1,
  type Rule,
} from "./types";
import {
  CATEGORY_TEMPLATE_MAP,
  DEFAULT_CAMERA,
  DEFAULT_CONSTRAINTS,
  DEFAULT_PHYSICS,
  SUPPORTED_COMPONENTS,
} from "./defaults";

type ParseResult =
  | { ok: true; value: GameSpecV1 }
  | { ok: false; errors: string[] };

const isRecord = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const toNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) ? value : fallback;

const normalizeVec2 = (
  value: unknown,
  fallback: [number, number],
): [number, number] => {
  if (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  ) {
    return [value[0], value[1]];
  }
  return fallback;
};

const requiredSections = [
  "metadata",
  "world",
  "entities",
  "components",
  "rules",
  "assets",
  "constraints",
] as const;

export function parseGameSpecV1(input: unknown): ParseResult {
  const errors: string[] = [];

  if (!isRecord(input)) {
    return { ok: false, errors: ["Input must be a JSON object."] };
  }

  for (const section of requiredSections) {
    if (!(section in input)) {
      errors.push(`Missing required section: ${section}`);
    }
  }

  const metadataRaw = isRecord(input.metadata) ? input.metadata : {};
  const worldRaw = isRecord(input.world) ? input.world : {};
  const entitiesRaw = Array.isArray(input.entities) ? input.entities : [];
  const rulesRaw = Array.isArray(input.rules) ? input.rules : [];
  const assetsRaw = isRecord(input.assets) ? input.assets : {};
  const constraintsRaw = isRecord(input.constraints) ? input.constraints : {};
  const promptContractRaw = isRecord(input.promptContract) ? input.promptContract : {};

  const category = metadataRaw.category;
  const isCategoryValid =
    typeof category === "string" &&
    (CATEGORIES as readonly string[]).includes(category);

  if (!isCategoryValid) {
    errors.push("metadata.category must be one of the 12 supported categories.");
  }

  const normalizedCategory = (isCategoryValid ? category : "sports") as Category;

  const mechanics = Array.isArray(metadataRaw.mechanics)
    ? metadataRaw.mechanics.filter((m): m is string => typeof m === "string" && m.length > 0)
    : [];

  if (mechanics.length === 0) {
    errors.push("metadata.mechanics must be a non-empty string array.");
  }

  const normalizedTemplate = CATEGORY_TEMPLATE_MAP[normalizedCategory];

  const physicsRaw = isRecord(worldRaw.physics) ? worldRaw.physics : {};
  const cameraRaw = isRecord(worldRaw.camera) ? worldRaw.camera : {};

  const normalizedPhysics: GameSpecV1["world"]["physics"] = {
    gravity: normalizeVec2(physicsRaw.gravity, DEFAULT_PHYSICS.gravity),
    friction: clamp(toNumber(physicsRaw.friction, DEFAULT_PHYSICS.friction), 0, 1),
    restitution: clamp(
      toNumber(physicsRaw.restitution, DEFAULT_PHYSICS.restitution),
      0,
      1,
    ),
    timeStep: clamp(toNumber(physicsRaw.timeStep, DEFAULT_PHYSICS.timeStep ?? 1 / 60), 1 / 240, 1 / 20),
  };

  const cameraMode = cameraRaw.mode;
  const normalizedCamera: GameSpecV1["world"]["camera"] = {
    mode:
      cameraMode === "follow" || cameraMode === "topdown" || cameraMode === "static"
        ? cameraMode
        : DEFAULT_CAMERA.mode,
  };

  if (typeof cameraRaw.target === "string") {
    normalizedCamera.target = cameraRaw.target;
  }

  const entities: GameEntity[] = [];
  const seenIds = new Set<string>();

  for (const candidate of entitiesRaw) {
    if (!isRecord(candidate)) {
      continue;
    }

    const id = typeof candidate.id === "string" ? candidate.id : "";
    if (!id) {
      errors.push("All entities must include a non-empty id.");
      continue;
    }

    if (seenIds.has(id)) {
      errors.push(`Duplicate entity id detected: ${id}`);
      continue;
    }

    seenIds.add(id);
    entities.push({
      id,
      kind: typeof candidate.kind === "string" ? candidate.kind : "unknown",
      tags: Array.isArray(candidate.tags)
        ? candidate.tags.filter((t): t is string => typeof t === "string")
        : undefined,
      components: isRecord(candidate.components) ? candidate.components : {},
    });
  }

  if (normalizedCamera.mode === "follow" && normalizedCamera.target) {
    const hasTarget = entities.some((entity) => entity.id === normalizedCamera.target);
    if (!hasTarget) {
      errors.push(`Camera follow target not found: ${normalizedCamera.target}`);
      normalizedCamera.mode = "static";
      delete normalizedCamera.target;
    }
  }

  const normalizeRule = (rule: unknown, index: number): Rule | null => {
    if (!isRecord(rule) || !isRecord(rule.when) || !Array.isArray(rule.do)) {
      errors.push(`rules[${index}] must include valid 'when' and 'do'.`);
      return null;
    }

    const when = rule.when;
    const event = when.event;
    const validEvents = [
      "GameStart",
      "Tick",
      "Collision",
      "TriggerEnter",
      "GoalReached",
      "TimerElapsed",
    ];
    if (typeof event !== "string" || !validEvents.includes(event)) {
      errors.push(`rules[${index}].when.event is invalid.`);
      return null;
    }

    return {
      when: {
        event: event as Rule["when"]["event"],
        a: typeof when.a === "string" ? when.a : undefined,
        b: typeof when.b === "string" ? when.b : undefined,
        entity: typeof when.entity === "string" ? when.entity : undefined,
      },
      do: rule.do.filter(isRecord).map((action) => action as Rule["do"][number]),
    };
  };

  const rules = rulesRaw
    .map((rule, idx) => normalizeRule(rule, idx))
    .filter((rule): rule is Rule => !!rule);

  const sprites = isRecord(assetsRaw.sprites) ? assetsRaw.sprites : {};
  const sounds = isRecord(assetsRaw.sounds) ? assetsRaw.sounds : {};

  const normalizedAssets: GameSpecV1["assets"] = {
    sprites: Object.fromEntries(
      Object.entries(sprites).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    ),
    sounds: Object.fromEntries(
      Object.entries(sounds).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
    ),
  };

  const normalizedConstraints: GameSpecV1["constraints"] = {
    maxEntities: clamp(
      toNumber(constraintsRaw.maxEntities, DEFAULT_CONSTRAINTS.maxEntities),
      1,
      500,
    ),
    maxSounds: clamp(
      toNumber(constraintsRaw.maxSounds, DEFAULT_CONSTRAINTS.maxSounds),
      0,
      128,
    ),
    targetFPS: clamp(
      toNumber(constraintsRaw.targetFPS, DEFAULT_CONSTRAINTS.targetFPS),
      24,
      240,
    ),
    maxRules: clamp(toNumber(constraintsRaw.maxRules, DEFAULT_CONSTRAINTS.maxRules ?? 128), 1, 500),
    maxParticles: clamp(
      toNumber(constraintsRaw.maxParticles, DEFAULT_CONSTRAINTS.maxParticles ?? 300),
      0,
      5000,
    ),
    bannedEntities: Array.isArray(constraintsRaw.bannedEntities)
      ? constraintsRaw.bannedEntities.filter((v): v is string => typeof v === "string")
      : [...(DEFAULT_CONSTRAINTS.bannedEntities ?? [])],
    requiredEntities: Array.isArray(constraintsRaw.requiredEntities)
      ? constraintsRaw.requiredEntities.filter((v): v is string => typeof v === "string")
      : [...(DEFAULT_CONSTRAINTS.requiredEntities ?? [])],
  };

  const normalized: GameSpecV1 = {
    metadata: {
      version: "1.0",
      title: typeof metadataRaw.title === "string" ? metadataRaw.title : "Untitled Game",
      category: normalizedCategory,
      template: normalizedTemplate,
      mechanics,
      seed: typeof metadataRaw.seed === "number" ? metadataRaw.seed : undefined,
      platform:
        metadataRaw.platform === "mobile_web" || metadataRaw.platform === "web"
          ? metadataRaw.platform
          : "web",
    },
    world: {
      physics: normalizedPhysics,
      camera: normalizedCamera,
    },
    entities,
    components: {
      supported: SUPPORTED_COMPONENTS,
    },
    rules,
    assets: normalizedAssets,
    constraints: normalizedConstraints,
    promptContract:
      Array.isArray(promptContractRaw.mustHave) || Array.isArray(promptContractRaw.mustNotHave)
        ? {
            mustHave: Array.isArray(promptContractRaw.mustHave)
              ? promptContractRaw.mustHave.filter((v): v is string => typeof v === "string")
              : [],
            mustNotHave: Array.isArray(promptContractRaw.mustNotHave)
              ? promptContractRaw.mustNotHave.filter((v): v is string => typeof v === "string")
              : [],
            notes: Array.isArray(promptContractRaw.notes)
              ? promptContractRaw.notes.filter((v): v is string => typeof v === "string")
              : undefined,
          }
        : undefined,
  };

  if (normalized.entities.length > normalized.constraints.maxEntities) {
    normalized.entities = normalized.entities.slice(0, normalized.constraints.maxEntities);
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, value: normalized };
}
