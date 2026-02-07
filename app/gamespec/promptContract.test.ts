import { parsePromptContract, validateAndSanitizeSpec } from "./promptContract";
import sportsMiniGolf from "./examples/bunny-mini-golf.v1.json";
import type { GameSpecV1 } from "./types";

const assert = (condition: boolean, message: string) => {
  if (!condition) throw new Error(message);
};

(() => {
  const c1 = parsePromptContract("Make mini golf without trees");
  assert(c1.mustNotHave.includes("tree"), "without trees should ban tree");

  const c2 = parsePromptContract("no trees");
  assert(c2.mustNotHave.includes("tree"), "no trees should ban tree");

  const c3 = parsePromptContract("exclude trees and rocks");
  assert(c3.mustNotHave.includes("tree"), "exclude trees should ban tree");
  assert(c3.mustNotHave.includes("rock"), "exclude rocks should ban rock");

  const c4 = parsePromptContract("don't add windmills");
  assert(c4.mustNotHave.includes("windmill"), "don't add windmills should ban windmill");

  const withTreeSpawner: GameSpecV1 = {
    ...(sportsMiniGolf as unknown as GameSpecV1),
    constraints: {
      ...(sportsMiniGolf as unknown as GameSpecV1).constraints,
      bannedEntities: ["tree"],
      requiredEntities: [],
    },
    promptContract: {
      mustHave: [],
      mustNotHave: ["tree"],
    },
    entities: [
      ...(sportsMiniGolf as unknown as GameSpecV1).entities,
      {
        id: "tree_spawner",
        kind: "decor_spawner",
        components: {
          Spawner: {
            kind: "scatter",
            targetKind: "tree",
            count: 10,
          },
        },
      },
    ],
  };

  const sanitized = validateAndSanitizeSpec(withTreeSpawner);
  const hasTreeSpawner = sanitized.spec.entities.some(
    (entity) => entity.components.Spawner && (entity.components.Spawner as { targetKind?: string }).targetKind === "tree",
  );
  assert(!hasTreeSpawner, "sanitizer should remove tree spawners");
})();
