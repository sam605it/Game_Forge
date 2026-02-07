"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameSpecV1 } from "@/types";
import { createEngine } from "@/lib/runtime/engine";

const formatTime = (value: number | null) => {
  if (value === null) return null;
  return `${Math.ceil(value)}s`;
};

type GamePreviewProps = {
  spec: GameSpecV1 | null;
  onSave?: () => void;
};

export default function GamePreview({ spec, onSave }: GamePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<ReturnType<typeof createEngine> | null>(null);
  const [status, setStatus] = useState("idle");
  const [score, setScore] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const isPlayable = Boolean(spec);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    engineRef.current?.dispose();
    engineRef.current = createEngine(spec, canvas, {
      onStateChange: (state) => {
        setStatus(state.status);
        setScore(state.score);
        setTimeRemaining(state.timeRemaining);
        setMessage(state.message);
      },
    });
    setStatus(engineRef.current.getState().status);
    setScore(engineRef.current.getState().score);
    setTimeRemaining(engineRef.current.getState().timeRemaining);
    setMessage(engineRef.current.getState().message);

    return () => {
      engineRef.current?.dispose();
      engineRef.current = null;
    };
  }, [spec]);

  const hudItems = useMemo(() => {
    if (!spec) return [];
    return spec.ui.hud;
  }, [spec]);

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Game Preview</h2>
          <p className="text-xs text-white/60">
            {spec ? spec.title : "Your forged game will appear here."}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => engineRef.current?.start()}
            disabled={!isPlayable}
            className="rounded-full bg-emerald-400 px-4 py-1 text-xs font-semibold text-emerald-950 disabled:bg-white/10 disabled:text-white/40"
          >
            {status === "running" ? "Running" : "Start"}
          </button>
          <button
            type="button"
            onClick={() => engineRef.current?.pause()}
            disabled={!isPlayable}
            className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold text-white/70 disabled:text-white/40"
          >
            Pause
          </button>
          <button
            type="button"
            onClick={() => engineRef.current?.reset()}
            disabled={!isPlayable}
            className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold text-white/70 disabled:text-white/40"
          >
            Restart
          </button>
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={!isPlayable}
              className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold text-white/70 disabled:text-white/40"
            >
              Save to Vault
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 rounded-2xl border border-white/10 bg-black/40 p-3">
        <div className="relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
          <canvas ref={canvasRef} className="h-full w-full" />
          {!isPlayable && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-white/60">
              Forge a game to start playing.
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-white/70">
        <div className="flex flex-wrap items-center gap-4">
          {hudItems.some((item) => item.type === "score") && <span>Score: {score}</span>}
          {hudItems.some((item) => item.type === "timer") && (
            <span>Time: {formatTime(timeRemaining) ?? "--"}</span>
          )}
        </div>
        {message && (
          <div className="rounded-full border border-white/20 px-4 py-1 text-xs text-white/80">
            {message}
          </div>
        )}
      </div>

      {(status === "won" || status === "lost") && (
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
          <span>{status === "won" ? "You won!" : "Game over."}</span>
          <button
            type="button"
            onClick={() => engineRef.current?.reset()}
            className="rounded-full bg-white/10 px-4 py-1 text-xs text-white/80"
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}
