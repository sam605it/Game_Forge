"use client";

import { useState } from "react";

export default function AppClient() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function runAI() {
    if (!prompt) return;

    setLoading(true);
    setOutput("");

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    setOutput(data.text || "No response");
    setLoading(false);
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gradient mb-4">
        Gemini Game Forge
      </h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Make Checkers..."
        className="w-full p-3 rounded glass mb-4"
        rows={4}
      />

      <button
        onClick={runAI}
        disabled={loading}
        className="px-4 py-2 rounded bg-sky-500 text-black font-semibold"
      >
        {loading ? "Thinking..." : "Generate"}
      </button>

      {output && (
        <pre className="mt-4 p-4 glass custom-scrollbar whitespace-pre-wrap">
          {output}
        </pre>
      )}
    </div>
  );
}
