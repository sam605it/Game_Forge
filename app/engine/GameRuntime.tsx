"use client";

import type { GameBlueprint } from "@/app/types/GameBlueprint";

export function GameRuntime({ blueprint }: { blueprint: GameBlueprint | null }) {
  if (!blueprint) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
        No game forged yet.
      </div>
    );
  }

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: blueprint.visuals.background || "#0B0E14" }}
    >
      {blueprint.objects.map((entity) => (
        <div
          key={entity.id}
          style={{
            position: "absolute",
            left: entity.x,
            top: entity.y,
            width: (entity.radius ?? 10) * 2,
            height: (entity.radius ?? 10) * 2,
            borderRadius: "50%",
            background: entity.kind === "player" ? "#22c55e" : "#ef4444",
          }}
        />
      ))}
    </div>
  );
}
