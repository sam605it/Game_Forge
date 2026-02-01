"use client";

import { useState } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    { role: "ai", content: "Welcome to Game Forge. Click Start to begin your adventure." }
  ]);
  const [gameState, setGameState] = useState({});
  const [loading, setLoading] = useState(false);

  const sendToEngine = async (playerInput) => {
    setLoading(true);

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: playerInput,
          gameState
        })
      });

      const json = await res.json();

      if (!json.ok) throw new Error("AI engine error");

      setMessages(prev => [
        ...prev,
        { role: "player", content: playerInput },
        { role: "ai", content: json.data.scene }
      ]);

      setGameState(prev => ({
        ...prev,
        ...json.data.stateChanges
      }));

    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        { role: "ai", content: "⚠️ The engine crashed. Check logs." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif", maxWidth: "700px", margin: "auto" }}>
      <h1>🎮 Game Forge AI</h1>

      <div style={{ border: "1px solid #ccc", padding: "1rem", minHeight: "300px" }}>
        {messages.map((m, i) => (
          <p key={i}>
            <strong>{m.role === "player" ? "You" : "AI"}:</strong> {m.content}
          </p>
        ))}
        {loading && <p><em>Thinking...</em></p>}
      </div>

      <button
        onClick={() => sendToEngine("Start the game")}
        disabled={loading}
        style={{ marginTop: "1rem" }}
      >
        Start Game
      </button>
    </main>
  );
}
