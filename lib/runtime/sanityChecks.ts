import type { GameSpecV1 } from "@/types";

export const sanityChecks = (spec: GameSpecV1): string[] => {
  const failures: string[] = [];
  const world = spec.world.size;

  if (!spec.entities.length) {
    failures.push("No entities present.");
  }

  const player = spec.entities.find((entity) => entity.tags?.includes("player") || entity.kind === "player");
  if (!player) {
    failures.push("Missing player entity.");
  } else {
    const halfW = player.size.width / 2;
    const halfH = player.size.height / 2;
    if (
      player.position.x < halfW ||
      player.position.y < halfH ||
      player.position.x > world.width - halfW ||
      player.position.y > world.height - halfH
    ) {
      failures.push("Player spawn out of bounds.");
    }
  }

  const hasControls = Object.values(spec.controls.mappings).some((value) => Array.isArray(value) && value.length > 0);
  if (!hasControls) {
    failures.push("Missing control bindings.");
  }

  const hasWinRule = spec.rules.some((rule) => rule.type === "win_on_goal" || rule.type === "win_on_score");
  if (!hasWinRule) {
    failures.push("Missing win condition rule.");
  }

  const winOnGoal = spec.rules.find((rule) => rule.type === "win_on_goal");
  if (winOnGoal) {
    const targetTag = String(winOnGoal.params?.targetTag ?? "goal");
    const hasGoal = spec.entities.some(
      (entity) => entity.tags?.includes(targetTag) || entity.kind === "goal",
    );
    if (!hasGoal) {
      failures.push("Win condition references missing goal entity.");
    }
  }

  const winOnScore = spec.rules.find((rule) => rule.type === "win_on_score");
  if (winOnScore) {
    const targetScore = Number(winOnScore.params?.targetScore ?? 0);
    if (!Number.isFinite(targetScore) || targetScore <= 0) {
      failures.push("Win-on-score rule has invalid target score.");
    }
  }

  if (spec.entities.length > 80) {
    failures.push("Entity count exceeds cap.");
  }

  const hasNaN = spec.entities.some(
    (entity) =>
      !Number.isFinite(entity.position.x) ||
      !Number.isFinite(entity.position.y) ||
      !Number.isFinite(entity.size.width) ||
      !Number.isFinite(entity.size.height),
  );
  if (hasNaN) {
    failures.push("Entity contains invalid numeric values.");
  }

  return failures;
};
