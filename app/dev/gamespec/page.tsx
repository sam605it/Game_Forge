"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type Category, type GameSpecV1 } from "@/app/gamespec/types";
import { renderSpec } from "@/app/engine/spec/renderSpec";
import { CATEGORY_EXAMPLES } from "@/app/gamespec/examples";
import { applyCategoryPreset } from "@/app/gamespec/presets";

export default function GameSpecDevPage() {
  const [prompt, setPrompt] = useState("Make mini golf with a bunny and lots of tree decorations.");
  const [categoryHint, setCategoryHint] = useState<Category>("sports");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [spec, setSpec] = useState<GameSpecV1 | null>(null);

  const onGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/generate-spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, categoryHint }),
      });
      const data = await response.json();
      if (!data.ok) {
        setError((data.errors || ["Failed to generate"]).join(", "));
        setSpec(null);
      } else {
        setSpec(applyCategoryPreset(data.spec));
      }
    } catch {
      setError("Request failed.");
      setSpec(null);
    } finally {
      setLoading(false);
    }
  };

  const smokeResults = useMemo(() => {
    return CATEGORIES.map((category) => {
      try {
        const normalized = applyCategoryPreset(CATEGORY_EXAMPLES[category]);
        return { category, ok: !!renderSpec(normalized) };
      } catch {
        return { category, ok: false };
      }
    });
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <h1 className="mb-4 text-2xl font-bold">GameSpec v1 Dev Playground</h1>

      <div className="mb-4 flex flex-col gap-3">
        <textarea
          className="h-28 w-full rounded border border-slate-700 bg-slate-900 p-3"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <div className="flex gap-3">
          <select
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2"
            value={categoryHint}
            onChange={(e) => setCategoryHint(e.target.value as Category)}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>

          <button
            className="rounded bg-emerald-600 px-4 py-2 font-medium disabled:opacity-40"
            onClick={onGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate & Play"}
          </button>
        </div>
      </div>

      <section className="mb-4 rounded border border-slate-700 bg-slate-900/40 p-3">
        <h2 className="mb-2 text-sm font-semibold">Golden Example Quick Load</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              className="rounded bg-slate-800 px-2 py-1 text-xs hover:bg-slate-700"
              onClick={() => {
                setCategoryHint(category);
                setPrompt(CATEGORY_EXAMPLES[category].metadata.title);
                setSpec(applyCategoryPreset(CATEGORY_EXAMPLES[category]));
                setError(null);
              }}
            >
              {category}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-300">
          Smoke check: {smokeResults.filter((r) => r.ok).length}/{smokeResults.length} categories renderable.
        </p>
      </section>

      {error && <p className="mb-4 text-red-400">{error}</p>}

      {spec && (
        <>
          <section className="mb-6 rounded border border-slate-700 p-3">
            {renderSpec(spec)}
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">Normalized Spec</h2>
            <pre className="overflow-auto rounded border border-slate-700 bg-slate-900 p-3 text-xs">
              {JSON.stringify(spec, null, 2)}
            </pre>
          </section>
        </>
      )}
    </main>
  );
}
