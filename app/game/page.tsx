"use client";

import { useState } from "react";

export default function GamePage() {
  const [scene, setScene] = useState("Click Start to begin.");
  const [options, setOptions] = useState([]);
  const [gameState, setGameState] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runEngine = async (playerInput) => {
    setLoading(true);
    setError(null);

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

      if (!json.ok) {
        throw new Error(json.error || "Engine failed");
      }

      const { scene, playerOptions, stateChanges } = json.data;

      setScene(scene);
      setOptions(playerOptions);
      setGameState(prev => ({
        ...prev,
        ...stateChanges
      }));

    } catch (err) {
      console.error(err);
      setError("The AI engine crashed. Check Vercel logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <h1>🎮 Game Forge</h1>

      <p>{scene}</p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {options.length === 0 && (
        <button onClick={() => runEngine("Start the game")}>
          Start Game
        </button>
      )}

      {options.map((option, i) => (
        <button
          key={i}
          onClick={() => runEngine(option)}
          disabled={loading}
          style={{ display: "block", margin: "0.5rem 0" }}
