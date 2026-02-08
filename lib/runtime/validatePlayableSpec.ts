import type { GameSpecV1 } from "@/types";
import { validateSpecSchema } from "@/lib/runtime/specSchema";
import { rendererConstraintCheck } from "@/lib/runtime/rendererConstraints";
import { sanityChecks } from "@/lib/runtime/sanityChecks";

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

export const validatePlayableSpec = (spec: GameSpecV1): ValidationResult => {
  const schemaErrors = validateSpecSchema(spec);
  if (schemaErrors.length) {
    return { ok: false, errors: schemaErrors };
  }

  const sanity = sanityChecks(spec);
  if (sanity.length) {
    return { ok: false, errors: sanity };
  }

  const rendererIssues = rendererConstraintCheck(spec);
  if (rendererIssues.length) {
    return { ok: false, errors: rendererIssues };
  }

  return { ok: true, errors: [] };
};
