import type { GameSpecV1 } from "@/types";
import { ENGINE_CAPABILITIES } from "@/lib/runtime/capabilities";

export const rendererConstraintCheck = (spec: GameSpecV1): string[] => {
  const issues: string[] = [];

  if (!ENGINE_CAPABILITIES.controls.includes(spec.controls.scheme)) {
    issues.push(`Unsupported control scheme: ${spec.controls.scheme}`);
  }

  for (const rule of spec.rules) {
    if (!ENGINE_CAPABILITIES.rules.includes(rule.type)) {
      issues.push(`Unsupported rule type: ${rule.type}`);
      break;
    }
  }

  for (const entity of spec.entities) {
    if (!ENGINE_CAPABILITIES.entityTypes.includes(entity.kind as typeof ENGINE_CAPABILITIES.entityTypes[number])) {
      issues.push(`Unsupported entity kind: ${entity.kind}`);
      break;
    }
    if (entity.render.type === "shape" && entity.render.shape) {
      if (!ENGINE_CAPABILITIES.shapes.includes(entity.render.shape as typeof ENGINE_CAPABILITIES.shapes[number])) {
        issues.push(`Unsupported render shape: ${entity.render.shape}`);
        break;
      }
    }
  }

  if (spec.world.camera.mode !== "static" && spec.world.camera.mode !== "follow") {
    issues.push(`Unsupported camera mode: ${spec.world.camera.mode}`);
  }

  return issues;
};
