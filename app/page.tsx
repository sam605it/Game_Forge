"use client";

import { useState } from "react";

export default function Page() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function run() {
    if (!input) return;
    setLoading(true);
    setOutput("");

    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: input }),
    });

    const data = await res.json();
    setOutput(data.text || "No response");
    setLoading(false);
  }

  return (
    <main style={{ padding: 24, maxWidth: 700 }}>
      <h1>🎮 GameForge AI</h1>

      <textarea
        rows={4}
        style={{ width: "100%" }}
        placeholder="Make a game about..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button onClick={run} disabled={loading}>
        {loading ? "Thinking..." : "Generate"}
      </button>

      {output && (
        <pre style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
          {output}
        </pre>
      )}
    </main>
  );
}
