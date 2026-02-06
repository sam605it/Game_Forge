"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameSpecV1 } from "@/app/gamespec/types";

const size = 8;

const triviaQuestions = [
  { q: "Which animal hops and has long ears?", choices: ["Tiger", "Bunny", "Shark"], answer: 1 },
  { q: "Which animal is striped?", choices: ["Tiger", "Whale", "Eagle"], answer: 0 },
];

export function Grid2DRunner({ spec }: { spec: GameSpecV1 }) {
  const isTrivia = spec.metadata.category === "word_trivia";
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [crates, setCrates] = useState([{ x: 3, y: 3 }, { x: 4, y: 2 }]);
  const [won, setWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const goalTiles = useMemo(() => [{ x: 6, y: 6 }, { x: 6, y: 5 }], []);
  const walls = useMemo(() => new Set(["2,2", "2,3", "2,4", "5,1", "5,2"]), []);

  useEffect(() => {
    if (!isTrivia) return;
    const id = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
    return () => clearInterval(id);
  }, [isTrivia]);

  useEffect(() => {
    if (isTrivia) return;
    const onKey = (e: KeyboardEvent) => {
      const dir = e.key;
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(dir)) return;
      setPos((prev) => {
        const next = { ...prev };
        if (dir === "ArrowUp") next.y -= 1;
        if (dir === "ArrowDown") next.y += 1;
        if (dir === "ArrowLeft") next.x -= 1;
        if (dir === "ArrowRight") next.x += 1;
        next.x = Math.max(0, Math.min(size - 1, next.x));
        next.y = Math.max(0, Math.min(size - 1, next.y));
        if (walls.has(`${next.x},${next.y}`)) return prev;

        const crateAt = crates.findIndex((c) => c.x === next.x && c.y === next.y);
        if (crateAt >= 0) {
          const push = { x: crates[crateAt].x + (next.x - prev.x), y: crates[crateAt].y + (next.y - prev.y) };
          const blocked = push.x < 0 || push.x >= size || push.y < 0 || push.y >= size || walls.has(`${push.x},${push.y}`) || crates.some((c, i) => i !== crateAt && c.x === push.x && c.y === push.y);
          if (blocked) return prev;
          setCrates((old) => old.map((crate, idx) => (idx === crateAt ? push : crate)));
        }

        setMoves((m) => m + 1);
        return next;
      });
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [crates, isTrivia, walls]);

  useEffect(() => {
    if (isTrivia) return;
    const solved = crates.every((crate) => goalTiles.some((goal) => goal.x === crate.x && goal.y === crate.y));
    if (solved) setWon(true);
  }, [crates, goalTiles, isTrivia]);

  if (isTrivia) {
    const q = triviaQuestions[questionIdx % triviaQuestions.length];
    return (
      <div>
        <p className="mb-2 text-sm">Word Trivia · Score: {score} · Timer: {timeLeft}s · {timeLeft === 0 ? "Round Over" : "Playing"}</p>
        <div className="w-[520px] rounded border border-slate-700 bg-slate-900 p-4">
          <p className="mb-3 font-semibold">{q.q}</p>
          <div className="space-y-2">
            {q.choices.map((choice, idx) => (
              <button
                key={choice}
                className="block w-full rounded bg-slate-800 px-3 py-2 text-left hover:bg-slate-700"
                disabled={timeLeft === 0}
                onClick={() => {
                  if (idx === q.answer) setScore((s) => s + 10);
                  setQuestionIdx((i) => i + 1);
                }}
              >
                {choice}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs">Answer as many as possible before timer hits zero.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-sm">Puzzle Grid · {won ? "Solved" : "Playing"} · Moves: {moves}</p>
      <p className="mb-2 text-xs">Push both crates onto green goal tiles using arrow keys.</p>
      <div className="grid w-[320px] grid-cols-8 gap-1">
        {Array.from({ length: size * size }, (_, i) => {
          const x = i % size;
          const y = Math.floor(i / size);
          const active = pos.x === x && pos.y === y;
          const wall = walls.has(`${x},${y}`);
          const goal = goalTiles.some((g) => g.x === x && g.y === y);
          const crate = crates.some((c) => c.x === x && c.y === y);
          return (
            <div key={i} className={`relative h-9 w-9 border ${wall ? "bg-slate-950" : goal ? "bg-green-800" : "bg-slate-800"}`}>
              {crate && <div className="absolute inset-1 bg-amber-600" />}
              {active && <div className="absolute inset-2 rounded-full bg-yellow-300" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
