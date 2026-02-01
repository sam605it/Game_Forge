"use client";
import { useState } from "react";

export default function Home() {
  const [msg, setMsg] = useState("Frontend loaded.");

  const test = async () => {
    setMsg("Button clicked...");
    const res = await fetch("/api/ai", { method: "POST" });
    const json = await res.json();
    setMsg(JSON.stringify(json));
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>GameForge</h1>
      <p>{msg}</p>
      <button onClick={test}>Test API</button>
    </div>
  );
}
