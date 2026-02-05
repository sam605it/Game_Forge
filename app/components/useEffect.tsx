"use client";

import { useEffect } from "react";

/**
 * Temporary no-op effect wrapper used to preserve import compatibility
 * while deployment blockers are fixed.
 */
export default function UseEffectNoop() {
  useEffect(() => {
    // Intentionally empty.
  }, []);

  return null;
}
