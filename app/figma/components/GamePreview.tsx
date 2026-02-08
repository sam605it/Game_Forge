"use client";

import { useEffect, useRef, useState } from "react";
import { GameSpec } from "@/engine/spec/gameSpec";
import { renderGameSpec } from "@/engine/renderer/canvasRenderer";

export function GamePreview({
  gameSpec,
  isDarkMode,
  isGenerating,
  error,
}: {
  gameSpec?: GameSpec | null;
  isDarkMode: boolean;
  isGenerating: boolean;
  error?: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        setSize({
          width: Math.floor(entry.contentRect.width),
          height: Math.floor(entry.contentRect.height),
        });
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !gameSpec || size.width === 0 || size.height === 0) {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }

    const dpr = window.devicePixelRatio || 1;
    const scaleX = size.width / gameSpec.world.w;
    const scaleY = size.height / gameSpec.world.h;
    const scale = Math.min(scaleX, scaleY);
    const renderWidth = gameSpec.world.w * scale;
    const renderHeight = gameSpec.world.h * scale;

    canvas.width = Math.floor(renderWidth * dpr);
    canvas.height = Math.floor(renderHeight * dpr);
    canvas.style.width = `${renderWidth}px`;
    canvas.style.height = `${renderHeight}px`;

    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    renderGameSpec(ctx, gameSpec);
  }, [gameSpec, size]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full flex items-center justify-center text-sm relative ${
        isDarkMode ? "text-slate-400" : "text-slate-600"
      }`}
    >
      {gameSpec ? (
        <canvas ref={canvasRef} className="rounded-xl shadow-inner" />
      ) : (
        <div className="text-center space-y-2">
          <div className="text-sm font-semibold">No game generated yet.</div>
          <div className="text-xs">Describe a mini golf theme to begin.</div>
        </div>
      )}
      {isGenerating && (
        <div className="absolute top-4 right-4 text-xs bg-black/60 text-white px-3 py-1 rounded-full">
          Generating...
        </div>
      )}
      {error && (
        <div className="absolute bottom-4 right-4 text-xs bg-red-500/80 text-white px-3 py-1 rounded-full">
          {error}
        </div>
      )}
    </div>
  );
}
