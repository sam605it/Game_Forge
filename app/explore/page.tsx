"use client";

import Link from "next/link";

const prompts = [
  "Make spooky pinball with pumpkins",
  "Design a neon hover-racer with boost pads",
  "Create a cozy cloud-jumping platformer",
  "Build a rhythm lane game with stars",
  "Craft a word trivia sprint about space",
];

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#070b16] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">Explore</h1>
            <p className="text-sm text-white/60">Try a prompt template to kickstart your next forge.</p>
          </div>
          <nav className="flex items-center gap-4 text-sm text-white/70">
            <Link className="rounded-full border border-white/20 px-4 py-2 hover:bg-white/10" href="/">
              Back to Forge
            </Link>
          </nav>
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          {prompts.map((prompt) => (
            <Link
              key={prompt}
              href={`/?prompt=${encodeURIComponent(prompt)}`}
              className="rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-white/80 transition hover:border-emerald-400/60 hover:bg-emerald-500/10"
            >
              {prompt}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
