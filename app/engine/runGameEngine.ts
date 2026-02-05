import { genreSystems } from "./genres/genreSystems";
import type { GenreId } from "./genres/genreTypes";

type GameDefinition = {
  genre: GenreId;
};

function runSystem(_systemName: string, _world: unknown) {
  // System implementations are intentionally stubbed during deployment hardening.
}

export function runGameEngine(game: GameDefinition, world: unknown) {
  const systemsToRun = genreSystems[game.genre] ?? [];

  if (!systemsToRun.length) {
    console.warn(`No systems registered for genre: ${game.genre}`);
    return;
  }

  systemsToRun.forEach((systemName) => {
    runSystem(systemName, world);
  });
}

export function tick(game: GameDefinition, world: unknown) {
  const activeSystems = genreSystems[game.genre] ?? [];
  activeSystems.forEach((system) => runSystem(system, world));
}

export async function requestGameStateUpdate(gameState: unknown, action: string) {
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
