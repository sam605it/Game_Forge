"use client";

import type { FormEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { GameSpec } from "@/lib/gamespec/schema";
import { runMiniGolf } from "@/lib/engine/runtime";
import { parsePromptToRequirements } from "@/lib/nlp/requirements";
import { buildGameSpec } from "@/lib/nlp/promptToSpec";

const navItems = [
  { key: "forge", label: "FORGE", icon: ForgeIcon },
  { key: "vault", label: "VAULT", icon: VaultIcon },
  { key: "explore", label: "EXPLORE", icon: ExploreIcon },
  { key: "connect", label: "CONNECT", icon: ConnectIcon },
];

function GameCanvas({
  spec,
  resetToken,
  onStatsChange,
}: {
  spec: GameSpec | null;
  resetToken: number;
  onStatsChange?: (stats: { strokes: number; holeIndex: number; holeCount: number }) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!spec || !canvas || spec.template !== "mini_golf") return;
    const runtime = runMiniGolf(spec, canvas, {
      showHud: false,
      backgroundColor: "#7da047",
      onStatsChange,
    });
    return () => runtime.dispose();
  }, [onStatsChange, resetToken, spec]);

  if (!spec) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/80">
        Describe a game to begin 🎮
      </div>
    );
  }

  if (spec.template !== "mini_golf") {
    const templateLabel = spec.template || "mini_golf";
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-white/80">
        Template scaffolded for {templateLabel}.
      </div>
    );
  }

  return (
    <canvas ref={canvasRef} className="h-full w-full rounded-2xl" />
  );
}

function ForgeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="2.5" y="2.5" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.8 12.6L13.4 6M11.6 6H13.4V7.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6.6 9.8V13.4H10.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function VaultIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M4 10.2C4 6.9 6.6 4.4 9.8 4.4C13 4.4 15.6 6.9 15.6 10.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.2 11.8C4.6 13.8 7 15.1 9.8 15.1C12.6 15.1 15 13.8 16.4 11.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9.8" cy="10.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ExploreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.2 12.5L12.8 7.4L11.6 12.4L8.2 12.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  );
}

function ConnectIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.4 10H16.6M10 3.2V16.8M5.6 6.1H14.4M5.6 13.9H14.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="15.4" cy="4.6" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="4.6" cy="10" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="15.4" cy="15.4" r="2.2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.6 9.2L13.2 6.1M6.6 10.8L13.2 13.9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export default function Page() {
  const initialPrompt = "Make mini golf";
  const [activeNav, setActiveNav] = useState("forge");
  const [messages, setMessages] = useState([initialPrompt]);
  const [input, setInput] = useState("");
  const [strokes, setStrokes] = useState(0);
  const [spec, setSpec] = useState<GameSpec | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState(0);
  const lastMessage = useMemo(() => messages[messages.length - 1] ?? "", [messages]);
  const handleStatsChange = useCallback(
    (stats: { strokes: number; holeIndex: number; holeCount: number }) => {
      setStrokes(stats.strokes);
    },
    [],
  );

  const applySpec = useCallback((nextSpec: GameSpec) => {
    setSpec(nextSpec);
    setStrokes(0);
    setResetToken((value) => value + 1);
  }, []);

  const fetchGameSpec = useCallback(async (prompt: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/game", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      if (!response.ok) {
        throw new Error("Failed to generate game.");
      }
      const data = (await response.json()) as GameSpec;
      if (data.error?.message) {
        setErrorMessage(data.error.message);
      }
      applySpec(data);
    } catch {
      const requirements = parsePromptToRequirements(prompt);
      applySpec(buildGameSpec(requirements));
      setErrorMessage("We hit an issue generating that game. Showing a fallback build.");
    } finally {
      setIsLoading(false);
    }
  }, [applySpec]);

  useEffect(() => {
    fetchGameSpec(initialPrompt);
  }, [fetchGameSpec, initialPrompt]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }
    const nextMessage = input.trim();
    setMessages((prev) => [...prev, nextMessage]);
    fetchGameSpec(nextMessage);
    setInput("");
  };

  const handleShare = async () => {
    if (typeof navigator === "undefined") {
      return;
    }
    const shareText = `Game Forge: ${lastMessage} (Strokes: ${strokes})`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Game Forge", text: shareText });
        return;
      }
    } catch {
      // Fall through to clipboard fallback.
    }
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      }
    } catch {
      // Ignore clipboard errors in non-secure contexts.
    }
  };

  return (
    <div className="min-h-screen bg-[#1b1b21] text-white">
      <div className="relative min-h-screen overflow-hidden px-8 py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_58%)]" />
        <div className="mx-auto flex min-h-[86vh] max-w-[1280px] flex-col gap-6">
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div className="text-[22px] font-semibold tracking-[0.45em] text-white/90">GAME FORGE</div>
            <nav className="flex items-center gap-10 text-[12px] font-semibold tracking-[0.35em] text-white/60">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveNav(item.key)}
                  className={`relative flex items-center gap-2 transition ${
                    activeNav === item.key ? "text-white" : "hover:text-white"
                  }`}
                >
                  <item.icon />
                  <span>{item.label}</span>
                  {activeNav === item.key && (
                    <span className="absolute -bottom-4 left-1/2 h-[2px] w-14 -translate-x-1/2 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[12px] font-semibold text-white/80">
                3 Creations
              </div>
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-gradient-to-br from-amber-200 via-pink-200 to-purple-200 text-lg">
                👩‍🎨
              </div>
            </div>
          </header>

          <main className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-[310px_1fr]">
            <section className="flex flex-col rounded-[28px] border border-white/40 bg-gradient-to-b from-white via-[#f7f6fb] to-[#ededf5] p-4 text-[#3b3b45] shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="text-sm font-semibold">Chatbox</div>
                <span className="text-slate-500">▾</span>
              </div>
              <div className="mt-3 flex-1 rounded-2xl border border-slate-200 bg-white/70 p-3">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500 shadow-sm">
                  {lastMessage || "Make mini golf"}
                </div>
              </div>
              <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Describe a game or action..."
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 shadow-inner outline-none focus:border-slate-400"
                />
                <button
                  type="submit"
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50"
                >
                  Send
                </button>
              </form>
            </section>

            <section className="flex flex-col rounded-[28px] border border-white/40 bg-gradient-to-b from-white via-[#f7f6fb] to-[#ededf5] p-5 text-slate-800 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
              <div className="flex-1">
                <div className="aspect-[16/10] rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="h-full w-full overflow-hidden rounded-2xl border border-[#d7d2dc] bg-[#92b255]">
                    <div className="relative h-full w-full rounded-2xl border-[10px] border-[#d8b86c] bg-[#7da047]">
                      <div className="absolute inset-0">
                        <GameCanvas
                          spec={spec}
                          resetToken={resetToken}
                          onStatsChange={handleStatsChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 text-xs font-semibold text-slate-500">
                  <div>Strokes: {strokes}</div>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-2 text-slate-500 transition hover:text-slate-700"
                  >
                    <ShareIcon />
                    Share
                  </button>
                </div>
                {isLoading && (
                  <div className="mt-3 text-xs text-slate-400">
                    Forging a new game...
                  </div>
                )}
                {errorMessage && (
                  <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                    <div className="font-semibold text-amber-800">Fallback game loaded</div>
                    <div>{errorMessage}</div>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setStrokes(0);
                    setResetToken((value) => value + 1);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2 text-xs font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => {}}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2 text-xs font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50"
                >
                  Save Game
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
