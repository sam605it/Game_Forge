"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", content: "Say something to start a game." }
  ]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim()) return;

    setLoading(true);

    // Show user message immediately
    setMessages(prev => [
      ...prev,
      { role: "user", content: input }
    ]);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: input,
          gameState: {}
        })
      });

      const json = await res.json();

      setMessages(prev => [
        ...prev,
        {
          role: "ai",
          content: JSON.stringify(json, null, 2)
        }
      ]);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "❌ Fetch failed" }
      ]);
      console.error(err);
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  return (
    <main style={{ padding: "2rem", maxWidth: "700px", margin: "auto" }}>
      <h1>Game Forge</h1>

      <div style={{ border: "1px solid #ccc", padding: "1rem", minHeight: "200px" }}>
        {messages.map((m, i) => (
          <p key={i}>
            <strong>{m.role}:</strong> {m.content}
          </p>
        ))}
        {loading && <p><em>Thinking...</em></p>}
      </div>

      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Type: Make Checkers"
        style={{ width: "100%", marginTop: "1rem" }}
      />

      <button onClick={send} disabled={loading} style={{ marginTop: "0.5rem" }}>
        Send
      </button>
    </main>
  );
}
