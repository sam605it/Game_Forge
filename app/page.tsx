"use client";

import FigmaApp from "@/app/figma/App";

function IconButton({ label, icon }: { label: string; icon: string }) {
  return (
    <button
      type="button"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
      aria-label={label}
    >
      {icon}
    </button>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 text-slate-900">
      <div className="flex min-h-screen flex-col px-6 py-6">
        <div className="flex flex-1 flex-col rounded-3xl border border-slate-200 bg-white/80 shadow-xl backdrop-blur">
          <header className="flex flex-wrap items-center justify-between gap-6 border-b border-slate-200 px-8 py-6">
            <div>
              <div className="text-2xl font-semibold">Game Forge</div>
              <div className="text-sm text-slate-500">AI-Driven Mini Game Creator</div>
            </div>

            <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-2 py-1 text-sm font-medium text-slate-600 shadow-sm">
              <button className="rounded-full bg-slate-200 px-4 py-1.5 text-slate-800">
                Vault
              </button>
              <button className="rounded-full px-4 py-1.5 hover:bg-slate-100">Explore</button>
              <button className="rounded-full px-4 py-1.5 hover:bg-slate-100">Connect</button>
            </div>

            <div className="flex items-center gap-2">
              <IconButton label="Help" icon="?" />
              <IconButton label="Profile" icon="👤" />
            </div>
          </header>

          <main className="flex flex-1 min-h-0 px-8 py-8">
            <FigmaApp />
          </main>

          <footer className="border-t border-slate-200 px-8 py-4 text-sm text-slate-500">
            You&apos;re here...
          </footer>
        </div>
      </div>
    </div>
  );
}
