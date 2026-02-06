"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameSpecV1 } from "@/app/gamespec/types";

type Props = { spec: GameSpecV1 };

export function Physics2DRunner({ spec }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState("Playing");

  const mechanicsText = useMemo(() => spec.metadata.mechanics.join(" ").toLowerCase(), [spec.metadata.mechanics]);
  const titleText = useMemo(() => spec.metadata.title.toLowerCase(), [spec.metadata.title]);

  const mode = useMemo(() => {
    if (spec.metadata.category === "simulation") return "simulation";
    if (mechanicsText.includes("bowling") || titleText.includes("bowling")) return "bowling";
    if (mechanicsText.includes("target") || titleText.includes("target")) return "target";
    return "mini_golf";
  }, [mechanicsText, spec.metadata.category, titleText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let x = 80;
    let y = 280;
    let vx = 0;
    let vy = 0;
    let score = 0;
    let strokes = 0;
    const gravity = spec.world.physics.gravity[1] * 0.001;
    const friction = 1 - spec.world.physics.friction * 0.1;
    const holes = [{ x: 680, y: 100, r: 10 }];
    const targets = [{ x: 620, y: 80, r: 16, live: true }, { x: 640, y: 170, r: 16, live: true }];
    const pins = Array.from({ length: 10 }, (_, i) => ({ x: 620 + (i % 4) * 18, y: 150 + Math.floor(i / 4) * 18, live: true }));
    const trees = Array.from({ length: 30 }, (_, i) => ({ x: 120 + ((i * 37) % 560), y: 40 + ((i * 71) % 240), r: 11 }));
    const spawned: Array<{ x: number; y: number; vy: number }> = [];
    let dragStart: { x: number; y: number } | null = null;

    const pointerDown = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      dragStart = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      if (mode === "simulation") {
        spawned.push({ x: dragStart.x, y: dragStart.y, vy: 0 });
      }
    };
    const pointerUp = (event: PointerEvent) => {
      if (!dragStart || mode === "simulation") {
        dragStart = null;
        return;
      }
      const rect = canvas.getBoundingClientRect();
      const end = { x: event.clientX - rect.left, y: event.clientY - rect.top };
      vx += (dragStart.x - end.x) * 0.06;
      vy += (dragStart.y - end.y) * 0.06;
      strokes += 1;
      dragStart = null;
    };

    canvas.addEventListener("pointerdown", pointerDown);
    canvas.addEventListener("pointerup", pointerUp);

    let raf = 0;
    const loop = () => {
      vy += gravity;
      vx *= friction;
      vy *= friction;
      x += vx;
      y += vy;

      if (x < 10 || x > canvas.width - 10) vx *= -spec.world.physics.restitution;
      if (y < 10 || y > canvas.height - 10) vy *= -spec.world.physics.restitution;
      x = Math.max(10, Math.min(canvas.width - 10, x));
      y = Math.max(10, Math.min(canvas.height - 10, y));

      ctx.fillStyle = "#10231a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (mode === "mini_golf") {
        ctx.fillStyle = "#22c55e";
        ctx.beginPath();
        ctx.moveTo(20, 290);
        ctx.quadraticCurveTo(180, 190, 400, 220);
        ctx.quadraticCurveTo(560, 230, 740, 110);
        ctx.lineTo(740, 300);
        ctx.lineTo(20, 300);
        ctx.closePath();
        ctx.fill();

        trees.forEach((tree) => {
          ctx.fillStyle = "#14532d";
          ctx.beginPath();
          ctx.arc(tree.x, tree.y, tree.r, 0, Math.PI * 2);
          ctx.fill();
          if (Math.hypot(x - tree.x, y - tree.y) < tree.r + 9) {
            vx *= -0.5;
            vy *= -0.5;
          }
        });

        const hole = holes[0];
        ctx.fillStyle = "#0a0a0a";
        ctx.beginPath();
        ctx.arc(hole.x, hole.y, hole.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#f8fafc";
        ctx.beginPath();
        ctx.moveTo(hole.x, hole.y - 8);
        ctx.lineTo(hole.x, hole.y - 36);
        ctx.stroke();
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(hole.x, hole.y - 34, 14, 8);

        if (Math.hypot(x - hole.x, y - hole.y) < 12 && Math.hypot(vx, vy) < 1.2) {
          setStatus("Win");
        }
      }

      if (mode === "bowling") {
        ctx.fillStyle = "#a16207";
        ctx.fillRect(90, 30, 620, 260);
        ctx.fillStyle = "#fef3c7";
        ctx.fillRect(90, 40, 620, 6);
        ctx.fillRect(90, 274, 620, 6);
        pins.forEach((pin) => {
          if (!pin.live) return;
          ctx.fillStyle = "#f8fafc";
          ctx.fillRect(pin.x - 4, pin.y - 10, 8, 20);
          if (Math.hypot(x - pin.x, y - pin.y) < 16) {
            pin.live = false;
            score += 10;
          }
        });
        if (pins.every((pin) => !pin.live)) setStatus("Win");
      }

      if (mode === "target") {
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        targets.forEach((target) => {
          if (!target.live) return;
          ctx.fillStyle = "#ef4444";
          ctx.beginPath();
          ctx.arc(target.x, target.y, target.r, 0, Math.PI * 2);
          ctx.fill();
          if (Math.hypot(x - target.x, y - target.y) < target.r + 10) {
            target.live = false;
            score += 50;
          }
        });
        if (targets.every((target) => !target.live)) setStatus("Win");
      }

      if (mode === "simulation") {
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        spawned.forEach((obj) => {
          obj.vy += gravity || 0.2;
          obj.y += obj.vy;
          if (obj.y > 300) {
            obj.y = 300;
            obj.vy *= -0.4;
          }
          ctx.fillStyle = "#38bdf8";
          ctx.fillRect(obj.x - 8, obj.y - 8, 16, 16);
        });
      }

      const skin = titleText.includes("bunny") ? "🐰" : titleText.includes("tiger") ? "🐯" : "⚪";
      ctx.font = "18px sans-serif";
      ctx.fillText(skin, x - 9, y + 6);

      if (dragStart && mode !== "simulation") {
        ctx.strokeStyle = "#fde047";
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(dragStart.x, dragStart.y);
        ctx.stroke();
      }

      ctx.fillStyle = "white";
      ctx.fillText(`Mode:${mode} Score:${score} Strokes:${strokes}`, 14, 20);
      raf = requestAnimationFrame(loop);
    };

    loop();
    return () => {
      cancelAnimationFrame(raf);
      canvas.removeEventListener("pointerdown", pointerDown);
      canvas.removeEventListener("pointerup", pointerUp);
    };
  }, [mode, spec, titleText]);

  return (
    <div>
      <p className="mb-2 text-sm">Physics 2D · {spec.metadata.category} · Status: {status}</p>
      <canvas ref={canvasRef} width={760} height={320} className="border border-slate-700" />
      <p className="mt-2 text-xs">Drag to launch (sports). Click to spawn blocks (simulation).</p>
    </div>
  );
}
