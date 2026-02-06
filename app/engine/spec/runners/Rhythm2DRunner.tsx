"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameSpecV1 } from "@/app/gamespec/types";

export function Rhythm2DRunner({ spec }: { spec: GameSpecV1 }) {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const notesRef = useRef<Array<{ x: number; lane: number; live: boolean }>>([]);
  const beatRef = useRef(0);
  const streakRef = useRef(0);
  const title = useMemo(() => spec.metadata.title, [spec.metadata.title]);

  useEffect(() => {
    notesRef.current = Array.from({ length: 18 }, (_, i) => ({ x: 760 + i * 120, lane: i % 2, live: true }));
    beatRef.current = 0;
    streakRef.current = 0;
    setScore(0);
    setStreak(0);
    setHits(0);
    setMisses(0);

    const timer = setInterval(() => {
      beatRef.current += 1;
      notesRef.current = notesRef.current
        .map((n) => ({ ...n, x: n.x - 6 }))
        .filter((n) => {
          if (n.x > -20) return true;
          if (n.live) {
            setMisses((m) => m + 1);
            streakRef.current = 0;
            setStreak(0);
          }
          return false;
        });

      if (notesRef.current.length < 12) {
        const i = beatRef.current;
        notesRef.current.push({ x: 820 + (i % 3) * 80, lane: i % 2, live: true });
      }
    }, 40);

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key !== " " && key !== "j" && key !== "k") return;
      const lane = key === "k" ? 1 : 0;
      const hitWindow = notesRef.current.find(
        (n) => n.live && n.lane === lane && Math.abs(n.x - 380) < 22,
      );

      if (hitWindow) {
        hitWindow.live = false;
        setHits((h) => h + 1);
        streakRef.current += 1;
        setStreak(streakRef.current);
        setScore((s) => s + 10 + streakRef.current * 2);
      } else {
        setMisses((m) => m + 1);
        streakRef.current = 0;
        setStreak(0);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      clearInterval(timer);
      window.removeEventListener("keydown", onKey);
    };
  }, [title]);

  return (
    <div>
      <p className="mb-2 text-sm">
        Rhythm 2D ({title}) · Score: {score} · Streak: {streak} · Hits:{hits} Misses:{misses}
      </p>
      <div className="relative h-24 w-[760px] overflow-hidden border border-slate-700 bg-slate-900">
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 bg-green-500" />
        <div className="absolute left-0 top-1/2 h-px w-full bg-slate-700" />
        {notesRef.current.map((n, idx) =>
          n.live ? (
            <div
              key={`${idx}-${n.x}`}
              className={`absolute h-6 w-6 rounded ${
                n.lane === 0 ? "bg-yellow-400" : "bg-pink-400"
              }`}
              style={{ left: `${n.x}px`, top: n.lane === 0 ? "24px" : "56px" }}
            />
          ) : null,
        )}
      </div>
      <p className="mt-2 text-xs">
        Press Space/J for top lane and K for bottom lane when note crosses center line.
      </p>
    </div>
  );
}
