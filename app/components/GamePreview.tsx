"use client";

import { useEffect, useRef, useState } from "react";
import type { GameSpec } from "@/lib/gamespec/schema";
import { runMiniGolf } from "@/lib/engine/runtime";

type Props = {
  spec: GameSpec | null;
};

export default function GamePreview({ spec }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [resetToken, setResetToken] = useState(0);

  useEffect(() => {
    if (!spec || !canvasRef.current) return;
    if (spec.template !== "mini_golf") return;

    const runtime = runMiniGolf(spec, canvasRef.current);
    return () => runtime.dispose();
  }, [spec, resetToken]);

  if (!spec) {
    return (
      <div className="text-slate-400 text-lg">Describe a game to begin 🎮</div>
    );
  }

  if (spec.template !== "mini_golf") {
    return (
      <div className="max-w-xl space-y-3 rounded-lg border border-slate-200 p-6 text-sm">
        <div className="text-base font-semibold">Template scaffolded</div>
        <div>
          The {spec.template} template is scaffolded. Mini golf is fully playable.
        </div>
        {spec.notes?.length ? (
          <ul className="list-disc pl-5">
            {spec.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="w-full max-w-3xl space-y-3">
        <div className="text-center">
          <h2 className="text-xl font-semibold">{spec.title}</h2>
          <p className="text-sm text-slate-500">
            Template: {spec.template} · Theme: {spec.theme.skin}
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-lg">
          <div className="bg-slate-800 p-4">
            <canvas ref={canvasRef} className="w-full rounded-xl bg-slate-100" />
          </div>
          <div className="flex items-center justify-between bg-slate-900 px-5 py-4 text-sm text-slate-200">
            <div>Strokes: tracked in-game</div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setResetToken((value) => value + 1)}
                className="rounded-lg border border-slate-500 px-4 py-2 text-slate-100 transition hover:bg-slate-700"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setResetToken((value) => value + 1)}
                className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-800 transition hover:bg-slate-100"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
