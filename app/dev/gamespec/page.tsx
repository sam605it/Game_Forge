"use client";

import { useState } from "react";
import { CATEGORIES, type Category, type GameSpecV1 } from "@/app/gamespec/types";
import { renderSpec } from "@/app/engine/spec/renderSpec";

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
        setSpec(data.spec);
      }
    } catch {
      setError("Request failed.");
      setSpec(null);
    } finally {
      setLoading(false);
    }
  };

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
