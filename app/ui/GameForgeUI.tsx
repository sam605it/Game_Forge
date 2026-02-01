"use client";

import { useState } from "react";

export default function GameForgeUI() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState("Waiting for input...");

  async function runAI() {
    setResult("Thinking...");
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setResult(data.output || "No response");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="glass w-full max-w-2xl p-6 rounded-xl space-y-4">
        <h1 className="text-3xl font-bold text-gradient">
          Gemini Game Forge
        </h1>

        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Make a game..."
          className="w-full p-3 rounded bg-black/40 border border-white/10 text-white"
          rows={4}
        />

        <button
          onClick={runAI}
          className="px-4 py-2 rounded bg-sky-400 text-black font-semibold hover:bg-sky-300"
        >
          Generate
        </button>

        <pre className="bg-black/50 p-3 rounded text-sm whitespace-pre-wrap">
          {result}
        </pre>
      </div>
    </main>
  );
}
