"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("Type something to start.");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;

    setLoading(true);
    setOutput("Thinking...");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input })
      });

      const json = await res.json();
      setOutput(JSON.stringify(json, null, 2));
    } catch {
      setOutput("Fetch failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Game Forge</h1>

      <p>{output}</p>

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Make Checkers"
      />

      <button onClick={send} disabled={loading}>
        Send
      </button>
    </main>
  );
}
