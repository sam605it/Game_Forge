// ❌ DO NOT import Gemini here
// This file runs on the client

console.log("API KEY PRESENT:", !!process.env.API_KEY);
console.log("API KEY EXISTS:", !!process.env.API_KEY);


import { GoogleGenerativeAI } from "@google/generative-ai";

import { genreSystems } from "@/engine/genres/genreSystems";
import { runSystem } from "./systems/runSystem";
import type { GameDefinition } from "./types";

export function runGameEngine(game: GameDefinition, world: any) {
  const systemsToRun = genreSystems[game.genre];

  if (!systemsToRun) {
    console.warn(`No systems registered for genre: ${game.genre}`);
    return;
  }

  systemsToRun.forEach(systemName => {
    runSystem(systemName, world);
  });
}

const activeSystems = genreSystems[game.genre];

export function tick(world: any) {
  activeSystems.forEach(system => runSystem(system, world));
}



const ai = new GoogleGenerativeAI(process.env.API_KEY!);


export async function runGameEngine(
  gameState: any,
  action: string
) {
  const res = await fetch("/api/game", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state: gameState,
      action,
    }),
  });

  if (!res.ok) {
    throw new Error("Engine request failed");
  }

  return res.json();
}
