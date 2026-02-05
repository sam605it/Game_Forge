"use client";

import { GameBlueprint } from "./blueprint";
import { ICONS } from "@/app/shared/icons/iconRegistry";

export function GameRuntime({ blueprint }: { blueprint: GameBlueprint | null }) {
  if (!blueprint) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
        No game forged yet.
      </div>
    );
  }

  const playerIconKey = blueprint.player.icon || "golf_ball";
  const icon = ICONS[playerIconKey];

  return (
    <div
      className="w-full h-full relative overflow-hidden"
      style={{ background: blueprint.world.background || "#0B0E14" }}
    >
      {/* PLAYER */}
      <div
        style={{
          position: "absolute",
          left: 60,
          top: 60,
          width: 48,
          height: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 32,
          userSelect: "none",
        }}
      >
        {typeof icon === "string" ? icon : "🐰"}
      </div>

      {/* ENTITIES */}
      {blueprint.entities.map((entity, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: entity.position.x,
            top: entity.position.y,
            width: 20,
            height: 20,
            background: "red",
          }}
        />
      ))}
    </div>
  );
}
