"use client";

import { useState } from "react";
import { db } from "@/services/db.client";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function runAI() {
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
    <main style={{ padding: 24 }}>
      <h1>GameForge</h1>

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Make a game..."
        style={{ width: "100%", height: 120 }}
      />

      <button onClick={runAI} disabled={loading}>
        {loading ? "Thinking..." : "Generate Game"}
      </button>

      <pre>{output}</pre>
    </main>
  );
}
