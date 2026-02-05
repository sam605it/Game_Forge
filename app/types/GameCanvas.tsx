"use client";

import { useEffect, useRef } from "react";
import { GameBlueprint } from "@/app/types/GameBlueprint";

export function GameCanvas({ blueprint }: { blueprint: GameBlueprint | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!blueprint) return;

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    canvas.width = blueprint.world.width;
    canvas.height = blueprint.world.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    blueprint.objects.forEach(obj => {
      ctx.beginPath();
      ctx.arc(obj.x, obj.y, obj.radius ?? 10, 0, Math.PI * 2);
      ctx.fillStyle = "white";
      ctx.fill();
    });
  }, [blueprint]);

  return <canvas ref={canvasRef} className="w-full h-full" />;
}
