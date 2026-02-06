"use client";

import { useEffect, useRef, useState } from "react";
import type { GameSpecV1 } from "@/app/gamespec/types";

export function Rhythm2DRunner({ spec }: { spec: GameSpecV1 }) {
  const [score, setScore] = useState(0);
  const [t, setT] = useState(0);
  const beatRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      beatRef.current = (beatRef.current + 1) % 100;
      setT(beatRef.current);
    }, 30);

    const onKey = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== " ") return;
      const delta = Math.abs(beatRef.current - 50);
      if (delta < 10) setScore((s) => s + 10);
    };

    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(id);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div>
      <p className="mb-2 text-sm">Rhythm 2D ({spec.metadata.title}) · Score: {score}</p>
      <div className="relative h-8 w-[760px] border border-slate-700 bg-slate-900">
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-green-500" />
        <div className="absolute top-0 h-full w-2 bg-yellow-400" style={{ left: `${(t / 100) * 100}%` }} />
      </div>
      <p className="mt-2 text-xs">Press Space when marker is near center line.</p>
    </div>
  );
}
