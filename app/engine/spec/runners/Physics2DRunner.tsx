"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameSpecV1 } from "@/app/gamespec/types";

type Props = { spec: GameSpecV1 };

export function Physics2DRunner({ spec }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState("Playing");

  const player = useMemo(
    () =>
      spec.entities.find((e) => e.components.InputController && e.components.Transform) ??
      spec.entities[0],
    [spec.entities],
  );

  const goal = useMemo(
    () => spec.entities.find((e) => e.components.Goal && e.components.Transform),
    [spec.entities],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !player?.components?.Transform) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const transform = player.components.Transform as { pos: [number, number] };
    let x = transform.pos[0] || 80;
    let y = transform.pos[1] || 80;
    let vx = 0;
    let vy = 0;

    const gravity = spec.world.physics.gravity[1] * 0.001;
    const friction = 1 - spec.world.physics.friction * 0.1;
    const goalPos = (goal?.components?.Transform as { pos: [number, number] } | undefined)?.pos ?? [620, 240];

    const handleKey = (event: KeyboardEvent) => {
      if ((player.components.InputController as { scheme?: string } | undefined)?.scheme === "wasd") {
        if (event.key.toLowerCase() === "w") vy -= 5;
        if (event.key.toLowerCase() === "a") vx -= 5;
        if (event.key.toLowerCase() === "s") vy += 5;
        if (event.key.toLowerCase() === "d") vx += 5;
      }
    };

    canvas.onpointerdown = (event) => {
      if ((player.components.InputController as { scheme?: string } | undefined)?.scheme === "drag_shot") {
        const rect = canvas.getBoundingClientRect();
        const dx = x - (event.clientX - rect.left);
        const dy = y - (event.clientY - rect.top);
        vx += dx * 0.05;
        vy += dy * 0.05;
      }
    };

    window.addEventListener("keydown", handleKey);
    let raf = 0;

    const draw = () => {
      vy += gravity;
      vx *= friction;
      vy *= friction;
      x += vx;
      y += vy;

      if (x < 12 || x > canvas.width - 12) vx *= -spec.world.physics.restitution;
      if (y < 12 || y > canvas.height - 12) vy *= -spec.world.physics.restitution;
      x = Math.max(12, Math.min(canvas.width - 12, x));
      y = Math.max(12, Math.min(canvas.height - 12, y));

      const distanceToGoal = Math.hypot(x - goalPos[0], y - goalPos[1]);
      if (distanceToGoal < 20) setStatus("Win");

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#22c55e";
      ctx.beginPath();
      ctx.arc(goalPos[0], goalPos[1], 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, Math.PI * 2);
      ctx.fill();

      raf = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("keydown", handleKey);
      canvas.onpointerdown = null;
    };
  }, [goal, player, spec]);

  return (
    <div>
      <p className="mb-2 text-sm">Physics 2D · Status: {status}</p>
      <canvas ref={canvasRef} width={760} height={320} className="border border-slate-700" />
    </div>
  );
}
