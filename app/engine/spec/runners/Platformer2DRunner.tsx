"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameSpecV1 } from "@/app/gamespec/types";

export function Platformer2DRunner({ spec }: { spec: GameSpecV1 }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState("Playing");
  const skin = useMemo(() => {
    const t = spec.metadata.title.toLowerCase();
    if (t.includes("bunny")) return "🐰";
    if (t.includes("tiger")) return "🐯";
    return "🙂";
  }, [spec.metadata.title]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let x = 40;
    let y = 250;
    let vx = 0;
    let vy = 0;
    let onGround = false;
    const keys: Record<string, boolean> = {};
    const gravity = spec.world.physics.gravity[1] > 0 ? spec.world.physics.gravity[1] * 0.0011 : 0.35;

    const platforms = [
      { x: 0, y: 285, w: 180, h: 35 },
      { x: 220, y: 245, w: 150, h: 18 },
      { x: 420, y: 215, w: 130, h: 18 },
      { x: 610, y: 175, w: 140, h: 18 },
    ];
    const goal = { x: 710, y: 140, w: 20, h: 35 };

    const onDown = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = true;
      if ((e.key === " " || e.key.toLowerCase() === "w") && onGround) {
        vy = -8.8;
        onGround = false;
      }
    };
    const onUp = (e: KeyboardEvent) => (keys[e.key.toLowerCase()] = false);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);

    let raf = 0;
    const loop = () => {
      vx = 0;
      if (keys.a || keys.arrowleft) vx = -3;
      if (keys.d || keys.arrowright) vx = 3;
      vy += gravity;
      x += vx;
      y += vy;
      onGround = false;

      for (const platform of platforms) {
        const touchingTop = x + 14 > platform.x && x - 14 < platform.x + platform.w && y + 16 >= platform.y && y + 8 <= platform.y + 8;
        if (touchingTop && vy >= 0) {
          y = platform.y - 16;
          vy = 0;
          onGround = true;
        }
      }

      if (y > canvas.height + 40) {
        x = 40;
        y = 250;
        vx = 0;
        vy = 0;
      }

      if (x > goal.x - 8 && y > goal.y - 10 && y < goal.y + 40) {
        setStatus("Win");
      }

      ctx.fillStyle = "#0b1020";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#1d4ed8";
      ctx.fillRect(0, 0, canvas.width, 70);

      ctx.fillStyle = "#334155";
      platforms.forEach((platform) => ctx.fillRect(platform.x, platform.y, platform.w, platform.h));

      ctx.fillStyle = "#22c55e";
      ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(goal.x + 3, goal.y - 24, 2, 24);
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(goal.x + 5, goal.y - 24, 14, 8);

      ctx.font = "20px sans-serif";
      ctx.fillText(skin, x - 9, y + 8);

      ctx.fillStyle = "white";
      ctx.fillText("Reach the exit flag. Controls: A/D + Space", 14, 20);

      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [skin, spec.world.physics.gravity]);

  return (
    <div>
      <p className="mb-2 text-sm">Platformer 2D · Status: {status}</p>
      <canvas ref={canvasRef} width={760} height={320} className="border border-slate-700" />
    </div>
  );
}
