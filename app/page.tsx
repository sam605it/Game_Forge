"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";

const navItems = [
  { key: "forge", label: "FORGE", icon: ForgeIcon },
  { key: "vault", label: "VAULT", icon: VaultIcon },
  { key: "explore", label: "EXPLORE", icon: ExploreIcon },
  { key: "connect", label: "CONNECT", icon: ConnectIcon },
];

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

const BunnyIcon = () => (
  <svg width="88" height="88" viewBox="0 0 128 128" fill="none" aria-hidden>
    <ellipse cx="45" cy="23" rx="13" ry="28" fill="#F7F7FB" stroke="#2B2B2B" strokeWidth="4" />
    <ellipse cx="83" cy="23" rx="13" ry="28" fill="#F7F7FB" stroke="#2B2B2B" strokeWidth="4" />
    <ellipse cx="45" cy="30" rx="6" ry="16" fill="#FFC8D9" />
    <ellipse cx="83" cy="30" rx="6" ry="16" fill="#FFC8D9" />
    <circle cx="64" cy="72" r="34" fill="#F7F7FB" stroke="#2B2B2B" strokeWidth="4" />
    <circle cx="52" cy="68" r="4" fill="#2B2B2B" />
    <circle cx="76" cy="68" r="4" fill="#2B2B2B" />
    <path d="M64 74C60 74 57 77 57 81C57 85 60 88 64 88C68 88 71 85 71 81C71 77 68 74 64 74Z" fill="#FF8FB2" />
    <path d="M53 92C58 97 70 97 75 92" stroke="#2B2B2B" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const CoursePreview = () => (
  <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[#d7d2dc] bg-gradient-to-br from-[#9ebf5e] via-[#87a94c] to-[#6a8b3c]">
    <div className="absolute inset-0 opacity-70">
      <div className="absolute left-8 top-8 h-20 w-32 rounded-full bg-[#6f8f3e] blur-sm" />
      <div className="absolute right-10 top-10 h-24 w-28 rounded-full bg-[#6f8f3e] blur-sm" />
      <div className="absolute bottom-10 left-12 h-16 w-32 rounded-full bg-[#6f8f3e] blur-sm" />
      <div className="absolute bottom-14 right-14 h-12 w-24 rounded-full bg-[#6f8f3e] blur-sm" />
    </div>
    <div className="absolute inset-7 rounded-[26px] border-[12px] border-[#d3b767] bg-[#82a54a] shadow-inner">
      <div className="absolute left-1/2 top-6 h-14 w-14 -translate-x-1/2 rounded-full bg-[#bdc1c4] shadow-md" />
      <div className="absolute left-16 top-24 h-10 w-10 rounded-full bg-[#a3c56b]" />
      <div className="absolute right-20 top-16 h-10 w-10 rounded-full bg-[#a3c56b]" />
      <div className="absolute right-14 bottom-14 h-12 w-12 rounded-full bg-[#a3c56b]" />
      <div className="absolute right-12 top-28 h-8 w-8 rounded-full bg-[#d0d8c2]" />
      <div className="absolute bottom-16 left-1/2 flex -translate-x-1/2 items-center justify-center drop-shadow-md">
        <BunnyIcon />
      </div>
      <div className="absolute bottom-10 left-[55%] h-4 w-4 rounded-full bg-white shadow" />
      <div className="absolute right-10 bottom-20 flex items-center gap-1">
        <div className="h-12 w-1.5 rounded-full bg-[#3b2f2f]" />
        <div className="h-4 w-4 -translate-y-1 rounded-sm bg-[#f5c13c]" />
        <div className="h-4 w-4 -translate-y-1 rounded-sm bg-[#e84c3d]" />
      </div>
    </div>
  </div>
);

export default function Page() {
  const [activeNav, setActiveNav] = useState("forge");
  const [messages, setMessages] = useState(["Make mini golf"]);
  const [input, setInput] = useState("");
  const [strokes, setStrokes] = useState(2);
  const lastMessage = useMemo(() => messages[messages.length - 1] ?? "", [messages]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim()) {
      return;
    }
    setMessages((prev) => [...prev, input.trim()]);
    setInput("");
  };

  const handleShare = async () => {
    if (typeof navigator === "undefined") {
      return;
    }
    const shareText = `Game Forge: ${lastMessage} (Strokes: ${strokes})`;
    if (navigator.share) {
      await navigator.share({ title: "Game Forge", text: shareText });
      return;
    }
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(shareText);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1c22] text-white">
      <div className="relative min-h-screen overflow-hidden px-6 py-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_58%)]" />
        <div className="mx-auto flex min-h-[86vh] max-w-[1680px] flex-col gap-7">
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div className="text-[26px] font-semibold tracking-[0.35em]">GAME FORGE</div>
            <nav className="flex items-center gap-10 text-[13px] font-semibold tracking-[0.3em] text-white/60">
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
              <div className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-[13px] font-semibold text-white/80">
                3 Creations
              </div>
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/40 bg-gradient-to-br from-amber-200 via-pink-200 to-purple-200 text-lg">
                👩‍🎨
              </div>
            </div>
          </header>

          <main className="grid flex-1 grid-cols-1 gap-6 md:grid-cols-[360px_1fr]">
            <section className="flex flex-col rounded-[28px] border border-white/40 bg-gradient-to-b from-white via-[#f7f6fb] to-[#ededf5] p-4 text-[#3b3b45] shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2 text-base font-semibold">
                  <span className="text-lg">⚡</span>
                  Chatbox
                </div>
                <span className="text-slate-500">▾</span>
              </div>
              <div className="mt-4 flex-1 rounded-2xl border border-slate-200 bg-white/70 p-3">
                {messages.map((message, index) => (
                  <div
                    key={`${message}-${index}`}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm"
                  >
                    {message}
                  </div>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="mt-4">
                <input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Describe a game or action..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-inner outline-none focus:border-slate-400"
                />
              </form>
            </section>

            <section className="flex flex-col rounded-[28px] border border-white/40 bg-gradient-to-b from-white via-[#f7f6fb] to-[#ededf5] p-5 text-slate-800 shadow-[0_24px_50px_rgba(0,0,0,0.35)]">
              <div className="flex-1">
                <div className="aspect-[16/10] rounded-2xl border border-slate-200 bg-white p-4">
                  <CoursePreview />
                </div>
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-500">
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
              </div>
              <div className="mt-6 flex justify-center gap-4">
                <button
                  type="button"
                  onClick={() => setStrokes(0)}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setStrokes((prev) => prev + 1)}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-500 shadow-sm transition hover:bg-slate-50"
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
