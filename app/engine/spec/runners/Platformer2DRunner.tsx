"use client";

import { useEffect, useRef, useState } from "react";
import type { GameSpecV1 } from "@/app/gamespec/types";

export function Platformer2DRunner({ spec }: { spec: GameSpecV1 }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState("Playing");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let x = 40;
    let y = 260;
    let vx = 0;
    let vy = 0;
    let onGround = true;
    const keys: Record<string, boolean> = {};
    const goalX = 700;

    const onDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if (e.key === " " && onGround) {
        vy = -8;
        onGround = false;
      }
    };
    const onUp = (e: KeyboardEvent) => (keys[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    let raf = 0;
    const loop = () => {
      vx = 0;
      if (keys.a) vx = -3;
      if (keys.d) vx = 3;
      vy += 0.35;
      x += vx;
      y += vy;

      if (y >= 260) {
        y = 260;
        vy = 0;
        onGround = true;
      }

      if (x > goalX - 20) setStatus("Win");

      ctx.fillStyle = "#0b1020";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, 280, canvas.width, 40);
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(goalX, 240, 16, 40);
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(x, y, 20, 20);

      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [spec]);

  return (
    <div>
      <p className="mb-2 text-sm">Platformer 2D · Status: {status}</p>
      <canvas ref={canvasRef} width={760} height={320} className="border border-slate-700" />
    </div>
  );
}
