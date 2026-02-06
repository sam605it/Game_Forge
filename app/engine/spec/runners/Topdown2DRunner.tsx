"use client";

import { useEffect, useRef, useState } from "react";
import type { GameSpecV1 } from "@/app/gamespec/types";

export function Topdown2DRunner({ spec }: { spec: GameSpecV1 }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState("Playing");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let x = 50;
    let y = 160;
    const goal = { x: 700, y: 160, r: 20 };
    const keys: Record<string, boolean> = {};

    const onDown = (e: KeyboardEvent) => (keys[e.key.toLowerCase()] = true);
    const onUp = (e: KeyboardEvent) => (keys[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    let raf = 0;
    const step = () => {
      const speed = 2.2;
      if (keys.w) y -= speed;
      if (keys.s) y += speed;
      if (keys.a) x -= speed;
      if (keys.d) x += speed;

      x = Math.max(10, Math.min(canvas.width - 10, x));
      y = Math.max(10, Math.min(canvas.height - 10, y));

      if (Math.hypot(goal.x - x, goal.y - y) < 24) setStatus("Win");

      ctx.fillStyle = "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(goal.x - 10, goal.y - 10, 20, 20);
      ctx.fillStyle = "#f87171";
      ctx.fillRect(260, 70, 24, 180);
      ctx.fillStyle = "#fde047";
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(step);
    };

    step();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [spec]);

  return (
    <div>
      <p className="mb-2 text-sm">Topdown 2D · Status: {status}</p>
      <canvas ref={canvasRef} width={760} height={320} className="border border-slate-700" />
    </div>
  );
}
