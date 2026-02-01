"use client";

import { useState } from "react";

export default function Page() {
  // STATE WILL GO HERE

  async function run(prompt: string) {
    const res = await fetch("/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });

    const data = await res.json();
    return data.text;
  }

  return (
    <>
      {/* YOUR OLD APP JSX GOES HERE */}
    </>
  );
}
