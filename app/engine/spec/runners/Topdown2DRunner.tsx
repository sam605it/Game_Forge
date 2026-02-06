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

    const category = spec.metadata.category;
    let x = 80;
    let y = 160;
    let heading = 0;
    let velocity = 0;
    let score = 0;
    let hp = 100;
    let towerBudget = 3;
    const start = performance.now();
    const roundDurationMs = 30000;
    const keys: Record<string, boolean> = {};
    let gameOver = false;

    const coins = Array.from({ length: 8 }, (_, i) => ({
      x: 160 + i * 70,
      y: 80 + (i % 3) * 70,
      r: 8,
      live: true,
    }));
    const hazards = Array.from({ length: 6 }, (_, i) => ({
      x: 160 + i * 90,
      y: 50 + (i % 4) * 60,
      r: 11,
    }));
    const enemies = Array.from({ length: 6 }, (_, i) => ({
      x: 430 + i * 40,
      y: 30 + (i % 5) * 50,
      hp: 20,
      live: true,
    }));
    const bullets: Array<{ x: number; y: number; vx: number; vy: number; live: boolean }> = [];
    const towers: Array<{ x: number; y: number }> = [];

    const path = [
      { x: 40, y: 80 },
      { x: 220, y: 80 },
      { x: 220, y: 240 },
      { x: 520, y: 240 },
      { x: 520, y: 120 },
      { x: 730, y: 120 },
    ];

    const finish = (nextStatus: "Win" | "Lose") => {
      if (gameOver) return;
      gameOver = true;
      setStatus(nextStatus);
    };

    const onDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keys[key] = true;

      if (category === "shooter" && key === " ") {
        bullets.push({
          x,
          y,
          vx: Math.cos(heading) * 5,
          vy: Math.sin(heading) * 5,
          live: true,
        });
      }
    };

    const onUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (category !== "shooter") return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      heading = Math.atan2(my - y, mx - x);
    };

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (category === "strategy" && towerBudget > 0) {
        towers.push({ x: mx, y: my });
        towerBudget -= 1;
      }

      if (category === "shooter") {
        heading = Math.atan2(my - y, mx - x);
        bullets.push({
          x,
          y,
          vx: Math.cos(heading) * 5,
          vy: Math.sin(heading) * 5,
          live: true,
        });
      }
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    canvas.addEventListener("mousemove", onPointerMove);
    canvas.addEventListener("click", onClick);

    let raf = 0;
    const step = () => {
      const elapsed = performance.now() - start;
      const speed = category === "racing" ? 2.4 : 2.0;

      if (!gameOver) {
        if (category === "racing") {
          if (keys.w) velocity += 0.08;
          if (keys.s) velocity -= 0.08;
          if (keys.a) heading -= 0.05;
          if (keys.d) heading += 0.05;
          velocity *= 0.97;
          x += Math.cos(heading) * velocity * 3;
          y += Math.sin(heading) * velocity * 3;
        } else {
          if (keys.w) y -= speed;
          if (keys.s) y += speed;
          if (keys.a) x -= speed;
          if (keys.d) x += speed;
        }

        x = Math.max(10, Math.min(canvas.width - 10, x));
        y = Math.max(10, Math.min(canvas.height - 10, y));

        if (category === "arcade") {
          coins.forEach((coin) => {
            if (coin.live && Math.hypot(coin.x - x, coin.y - y) < 16) {
              coin.live = false;
              score += 10;
            }
          });

          hazards.forEach((hazard) => {
            if (Math.hypot(hazard.x - x, hazard.y - y) < 18) {
              score = Math.max(0, score - 1);
            }
          });

          if (elapsed > roundDurationMs) finish(score >= 50 ? "Win" : "Lose");
        }

        if (category === "action") {
          hazards.forEach((hazard, i) => {
            hazard.y += 1 + (i % 3) * 0.4;
            if (hazard.y > canvas.height + 12) hazard.y = -10;
            if (Math.hypot(hazard.x - x, hazard.y - y) < 18) hp -= 0.4;
          });

          if (hp <= 0) finish("Lose");
          if (elapsed > roundDurationMs) finish("Win");
        }

        if (category === "shooter") {
          enemies.forEach((enemy) => {
            if (!enemy.live) return;
            const dx = x - enemy.x;
            const dy = y - enemy.y;
            const d = Math.max(1, Math.hypot(dx, dy));
            enemy.x += (dx / d) * 0.6;
            enemy.y += (dy / d) * 0.6;
            if (d < 18) hp -= 0.3;
          });

          bullets.forEach((bullet) => {
            if (!bullet.live) return;
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            if (
              bullet.x < 0 ||
              bullet.y < 0 ||
              bullet.x > canvas.width ||
              bullet.y > canvas.height
            ) {
              bullet.live = false;
            }

            enemies.forEach((enemy) => {
              if (!bullet.live || !enemy.live) return;
              if (Math.hypot(enemy.x - bullet.x, enemy.y - bullet.y) < 14) {
                enemy.hp -= 10;
                bullet.live = false;
                if (enemy.hp <= 0) {
                  enemy.live = false;
                  score += 20;
                }
              }
            });
          });

          if (hp <= 0) finish("Lose");
          if (score >= 80) finish("Win");
        }

        if (category === "strategy") {
          enemies.forEach((enemy, idx) => {
            if (!enemy.live) return;
            const waypoint =
              path[Math.min(path.length - 1, Math.floor((elapsed / 1800 + idx) % path.length))];
            const dx = waypoint.x - enemy.x;
            const dy = waypoint.y - enemy.y;
            const d = Math.max(1, Math.hypot(dx, dy));
            enemy.x += (dx / d) * 0.9;
            enemy.y += (dy / d) * 0.9;

            towers.forEach((tower) => {
              if (Math.hypot(tower.x - enemy.x, tower.y - enemy.y) < 90) enemy.hp -= 0.35;
            });

            if (enemy.hp <= 0) {
              enemy.live = false;
              score += 15;
            }
            if (enemy.x > 700) hp -= 0.2;
          });

          if (hp <= 0) finish("Lose");
          if (score >= 70) finish("Win");
        }
      }

      if (category === "party_social") {
        const objective = "Tag the glowing target before time runs out";
        const target = { x: 620 - (elapsed / 30) % 500, y: 60 + ((elapsed / 40) % 220) };

        if (!gameOver && Math.hypot(target.x - x, target.y - y) < 22) {
          score += 1;
          x = 80;
          y = 160;
        }

        if (!gameOver && elapsed > roundDurationMs) finish(score >= 3 ? "Win" : "Lose");

        ctx.fillStyle = "#111827";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#a855f7";
        ctx.font = "14px sans-serif";
        ctx.fillText(objective, 16, 22);
        ctx.fillStyle = "#facc15";
        ctx.beginPath();
        ctx.arc(target.x, target.y, 13, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#22d3ee";
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.fillText(
          `Round: ${(Math.max(0, roundDurationMs - elapsed) / 1000).toFixed(1)}s Score:${score}`,
          16,
          42,
        );
        raf = requestAnimationFrame(step);
        return;
      }

      ctx.fillStyle = category === "racing" ? "#1f2937" : "#111827";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (category === "racing") {
        ctx.strokeStyle = "#e5e7eb";
        ctx.lineWidth = 48;
        ctx.beginPath();
        ctx.moveTo(60, 260);
        ctx.lineTo(260, 60);
        ctx.lineTo(640, 60);
        ctx.lineTo(700, 250);
        ctx.lineTo(160, 250);
        ctx.stroke();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 4;
        ctx.strokeRect(650, 180, 16, 70);
        ctx.fillStyle = "#ef4444";
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(heading);
        ctx.fillRect(-10, -6, 20, 12);
        ctx.restore();

        if (!gameOver) {
          const finished = x > 650 && x < 666 && y > 180 && y < 250;
          if (finished) finish("Win");
        }
      } else {
        if (category === "strategy") {
          ctx.strokeStyle = "#38bdf8";
          ctx.lineWidth = 22;
          ctx.beginPath();
          ctx.moveTo(path[0].x, path[0].y);
          path.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
          ctx.stroke();
          towers.forEach((tower) => {
            ctx.fillStyle = "#f59e0b";
            ctx.fillRect(tower.x - 8, tower.y - 8, 16, 16);
          });
        }

        if (category === "arcade" || category === "action") {
          hazards.forEach((hazard) => {
            ctx.fillStyle = "#f87171";
            ctx.beginPath();
            ctx.arc(hazard.x, hazard.y, hazard.r, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        if (category === "arcade") {
          coins.forEach((coin) => {
            if (!coin.live) return;
            ctx.fillStyle = "#fde047";
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, coin.r, 0, Math.PI * 2);
            ctx.fill();
          });
        }

        if (category === "shooter" || category === "strategy") {
          enemies.forEach((enemy) => {
            if (!enemy.live) return;
            ctx.fillStyle = "#f87171";
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, 10, 0, Math.PI * 2);
            ctx.fill();
          });
          bullets.forEach((bullet) => {
            if (!bullet.live) return;
            ctx.fillStyle = "#facc15";
            ctx.fillRect(bullet.x - 2, bullet.y - 2, 4, 4);
          });
        }

        ctx.fillStyle = "#22d3ee";
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();

        if (category === "shooter") {
          ctx.strokeStyle = "#93c5fd";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(heading) * 18, y + Math.sin(heading) * 18);
          ctx.stroke();
        }
      }

      ctx.fillStyle = "white";
      const timeLeft = Math.max(0, (roundDurationMs - elapsed) / 1000).toFixed(1);
      ctx.fillText(`Cat:${category} Score:${Math.round(score)} HP:${Math.round(hp)} T:${timeLeft}s`, 16, 18);
      raf = requestAnimationFrame(step);
    };

    setStatus("Playing");
    step();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      canvas.removeEventListener("mousemove", onPointerMove);
      canvas.removeEventListener("click", onClick);
    };
  }, [spec]);

  return (
    <div>
      <p className="mb-2 text-sm">Topdown 2D · {spec.metadata.category} · Status: {status}</p>
      <canvas ref={canvasRef} width={760} height={320} className="border border-slate-700" />
      <p className="mt-2 text-xs">
        Controls: WASD move · Mouse aim + Space/Click shoot (shooter) · Click to place towers (strategy)
      </p>
    </div>
  );
}
