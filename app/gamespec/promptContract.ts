import type { GameEntity, GameSpecV1 } from "./types";

export type PromptContract = {
  mustHave: string[];
  mustNotHave: string[];
  notes?: string[];
};

const CANONICAL_ENTITY_MAP: Record<string, string> = {
  tree: "tree",
  trees: "tree",
  forest: "tree",
  wood: "tree",
  woods: "tree",
};

const NEGATION_PATTERNS = [
  /without\s+([^.;!\n]+)/gi,
  /\bno\s+([^.;!\n]+)/gi,
  /exclude\s+([^.;!\n]+)/gi,
  /remove\s+([^.;!\n]+)/gi,
  /don['’]t\s+add\s+([^.;!\n]+)/gi,
  /do\s+not\s+add\s+([^.;!\n]+)/gi,
  /([a-z0-9\s_-]+)-free\b/gi,
] as const;

const splitCandidates = (text: string): string[] =>
  text
    .split(/,|\band\b|\bor\b/gi)
    .map((part) => part.trim())
    .filter(Boolean);

export function normalizeEntityName(input: string): string {
  const normalized = input
    .toLowerCase()
    .trim()
    .replace(/["'`.,!?;:()[\]{}]/g, "")
    .replace(/^(the|a|an)\s+/i, "")
    .replace(/\s+/g, " ");

  if (!normalized) return "";

  const dePluralized = normalized.endsWith("ies")
    ? `${normalized.slice(0, -3)}y`
    : normalized.endsWith("s") && normalized.length > 3
      ? normalized.slice(0, -1)
      : normalized;

  return CANONICAL_ENTITY_MAP[dePluralized] ?? dePluralized;
}

const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));

export function parsePromptContract(prompt: string): PromptContract {
  const mustNotHave: string[] = [];

  for (const pattern of NEGATION_PATTERNS) {
    for (const match of prompt.matchAll(pattern)) {
      const raw = match[1]?.trim();
      if (!raw) continue;
      splitCandidates(raw).forEach((candidate) => {
        const entity = normalizeEntityName(candidate);
        if (entity) mustNotHave.push(entity);
      });
    }
  }

  return {
    mustHave: [],
    mustNotHave: unique(mustNotHave),
    notes: mustNotHave.length > 0 ? ["deterministic_negation_parse"] : undefined,
  };
}

export function getContract(spec: GameSpecV1): PromptContract {
  const contract = spec.promptContract;
  const required = unique([...(contract?.mustHave ?? []), ...(spec.constraints.requiredEntities ?? [])].map(normalizeEntityName));
  const banned = unique([...(contract?.mustNotHave ?? []), ...(spec.constraints.bannedEntities ?? [])].map(normalizeEntityName));
  return { mustHave: required, mustNotHave: banned, notes: contract?.notes };
}

export function isBanned(nameOrTag: string, spec: GameSpecV1): boolean {
  const value = normalizeEntityName(nameOrTag);
  if (!value) return false;
  return getContract(spec).mustNotHave.some((banned) => value.includes(banned) || banned.includes(value));
}

type SanitizerReport = {
  contract: PromptContract;
  removed: { count: number; names: string[] };
  missingRequirements: string[];
};

const entityMatchesBan = (entity: GameEntity, banned: string[]) => {
  const candidates = [entity.kind, entity.id, ...(entity.tags ?? [])].map(normalizeEntityName);
  return banned.some((ban) => candidates.some((candidate) => candidate && (candidate.includes(ban) || ban.includes(candidate))));
};

export function validateAndSanitizeSpec(spec: GameSpecV1): { spec: GameSpecV1; report: SanitizerReport } {
  const contract = getContract(spec);
  const removedNames: string[] = [];

  const sanitizedEntities = spec.entities.filter((entity) => {
    if (entityMatchesBan(entity, contract.mustNotHave)) {
      removedNames.push(entity.kind || entity.id);
      return false;
    }

    const spawner = entity.components.Spawner as { targetKind?: string } | undefined;
    if (spawner?.targetKind && contract.mustNotHave.some((ban) => normalizeEntityName(spawner.targetKind ?? "").includes(ban))) {
      removedNames.push(`spawner:${spawner.targetKind}`);
      return false;
    }
    return true;
  });

  const sanitizedRules = spec.rules.map((rule) => ({
    ...rule,
    do: rule.do.filter((action) => {
      if (action.action !== "Spawn") return true;
      if (isBanned(action.kind, spec)) {
        removedNames.push(`rule_spawn:${action.kind}`);
        return false;
      }
      return true;
    }),
  }));

  const missingRequirements = contract.mustHave.filter((required) =>
    !sanitizedEntities.some((entity) => normalizeEntityName(entity.kind).includes(required)),
  );

  const sanitizedSpec: GameSpecV1 = {
    ...spec,
    entities: sanitizedEntities,
    rules: sanitizedRules,
    constraints: {
      ...spec.constraints,
      requiredEntities: contract.mustHave,
      bannedEntities: contract.mustNotHave,
    },
    promptContract: contract,
  };

  return {
    spec: sanitizedSpec,
    report: {
      contract,
      removed: {
        count: removedNames.length,
        names: unique(removedNames),
      },
      missingRequirements,
    },
  };
}
