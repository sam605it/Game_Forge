"use client";

import { useEffect, useRef, useState } from "react";
import { ICONS, IconKey } from "@/app/lib/icons";

type Ball = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export default function GameRenderer({
  gameState,
}: {
  gameState: any;
}) {
  const world = { width: 800, height: 400 };

  const iconKey: IconKey = gameState?.playerIconKey ?? "default";
  const icon = ICONS[iconKey];
  const isDefaultBall = iconKey === "default";

  const [ball, setBall] = useState<Ball>({
    x: 100,
    y: 200,
    vx: 0,
    vy: 0,
  });

  const raf = useRef<number | null>(null);

  useEffect(() => {
    const friction = 0.98;

    function step() {
      setBall(b => {
        let vx = b.vx * friction;
        let vy = b.vy * friction;

        let x = b.x + vx;
        let y = b.y + vy;

        if (x < 0 || x > world.width) vx *= -0.6;
        if (y < 0 || y > world.height) vy *= -0.6;

        return { x, y, vx, vy };
      });

      raf.current = requestAnimationFrame(step);
    }

    raf.current = requestAnimationFrame(step);
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, []);

  function handleClick(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    setBall(b => ({
      ...b,
      vx: (b.x - mx) * 0.05,
      vy: (b.y - my) * 0.05,
    }));
  }

  return (
    <svg
      width={world.width}
      height={world.height}
      onClick={handleClick}
      style={{
        background: "#2e7d32",
        border: "2px solid black",
      }}
    >
      {/* Hole */}
      <circle cx={700} cy={200} r={14} fill="black" />

      {/* Ball / Icon */}
      {isDefaultBall ? (
        <circle
          cx={ball.x}
          cy={ball.y}
          r={10}
          fill="white"
          strokeWidth={2}
        />
      ) : (
        <text
          x={ball.x}
          y={ball.y}
          fontSize={24}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {icon}
        </text>
      )}
    </svg>
  );
}
