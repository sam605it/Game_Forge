"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import GamePreview from "@/components/GamePreview";
import { getVaultGames, removeVaultGame } from "@/lib/storage";
import type { GameSpecV1 } from "@/types";

const getCreatedAt = (id: string) => {
  const numeric = Number(id.split("-")[0]);
  if (!Number.isFinite(numeric)) return "Unknown";
  return new Date(numeric).toLocaleString();
};

export default function VaultPage() {
  const [vaultGames, setVaultGames] = useState<GameSpecV1[]>([]);
  const [selected, setSelected] = useState<GameSpecV1 | null>(null);

  useEffect(() => {
    const games = getVaultGames();
    setVaultGames(games);
    setSelected(games[0] ?? null);
  }, []);

  const handleDelete = (id: string) => {
    removeVaultGame(id);
    setVaultGames((prev) => prev.filter((game) => game.id !== id));
    if (selected?.id === id) {
      setSelected(null);
    }
  };

  const emptyState = useMemo(() => vaultGames.length === 0, [vaultGames.length]);

  return (
    <div className="min-h-screen bg-[#070b16] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Vault</h1>
            <p className="text-sm text-white/60">Saved game specs live here for instant replay.</p>
          </div>
          <nav className="flex items-center gap-4 text-sm text-white/70">
            <Link className="rounded-full border border-white/20 px-4 py-2 hover:bg-white/10" href="/">
              Back to Forge
            </Link>
          </nav>
        </header>

        <div className="grid flex-1 gap-6 md:grid-cols-[320px_1fr]">
          <aside className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
            <h2 className="text-lg font-semibold">Saved Games</h2>
            {emptyState ? (
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/60">
                No games saved yet. Forge a game and save it to see it here.
              </div>
            ) : (
              <div className="space-y-3">
                {vaultGames.map((game) => (
                  <button
                    key={game.id}
                    type="button"
                    onClick={() => setSelected(game)}
                    className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                      selected?.id === game.id
                        ? "border-emerald-400/60 bg-emerald-500/10"
                        : "border-white/10 bg-black/30 hover:border-white/30"
                    }`}
                  >
                    <div className="font-semibold text-white">{game.title}</div>
                    <div className="text-xs text-white/60">{getCreatedAt(game.id)}</div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          <div className="flex flex-col gap-4">
            <GamePreview spec={selected} />
            {selected && (
              <button
                type="button"
                onClick={() => handleDelete(selected.id)}
                className="self-end rounded-full border border-white/20 px-4 py-2 text-xs text-white/70 hover:bg-white/10"
              >
                Delete from Vault
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
