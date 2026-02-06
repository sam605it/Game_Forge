"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameSpecV1 } from "@/app/gamespec/types";

const size = 8;

export function Grid2DRunner({ spec }: { spec: GameSpecV1 }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [won, setWon] = useState(false);
  const goal = useMemo(() => ({ x: size - 1, y: size - 1 }), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      setPos((prev) => {
        const next = { ...prev };
        if (e.key === "ArrowUp") next.y -= 1;
        if (e.key === "ArrowDown") next.y += 1;
        if (e.key === "ArrowLeft") next.x -= 1;
        if (e.key === "ArrowRight") next.x += 1;
        next.x = Math.max(0, Math.min(size - 1, next.x));
        next.y = Math.max(0, Math.min(size - 1, next.y));
        if (next.x === goal.x && next.y === goal.y) setWon(true);
        return next;
      });
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goal.x, goal.y]);

  return (
    <div>
      <p className="mb-2 text-sm">Grid 2D ({spec.metadata.title}) · {won ? "Win" : "Playing"}</p>
      <div className="grid w-[320px] grid-cols-8 gap-1">
        {Array.from({ length: size * size }, (_, i) => {
          const x = i % size;
          const y = Math.floor(i / size);
          const active = pos.x === x && pos.y === y;
          const isGoal = goal.x === x && goal.y === y;
          return (
            <div
              key={i}
              className={`h-9 w-9 border ${active ? "bg-yellow-400" : isGoal ? "bg-green-500" : "bg-slate-800"}`}
            />
          );
        })}
      </div>
    </div>
  );
}
