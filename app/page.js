"use client";

import { useState } from "react";

export default function Home() {
  const [text, setText] = useState("Frontend loaded.");
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setText("Calling API...");

    try {
      const res = await fetch("/api/ai", {
        method: "POST"
      });

      const json = await res.json();
      setText(JSON.stringify(json, null, 2));
    } catch (err) {
      setText("Fetch failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: "2rem" }}>
      <h1>Game Forge</h1>
      <p>{text}</p>

      <button onClick={testApi} disabled={loading}>
        Test API
      </button>
    </main>
  );
}
