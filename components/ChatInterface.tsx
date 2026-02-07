"use client";

import { useMemo } from "react";
const classNames = (...classes: Array<string | boolean | undefined>) =>
  classes.filter(Boolean).join(" ");

export type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

type ChatInterfaceProps = {
  messages: ChatMessage[];
  input: string;
  flashRemaining: number;
  isLoading: boolean;
  lastPrompt: string;
  onInputChange: (value: string) => void;
  onForge: () => void;
  onRegenerate: () => void;
};

export default function ChatInterface({
  messages,
  input,
  flashRemaining,
  isLoading,
  lastPrompt,
  onInputChange,
  onForge,
  onRegenerate,
}: ChatInterfaceProps) {
  const canForge = flashRemaining > 0 && !isLoading;
  const disableForge = !input.trim() || !canForge;
  const disableRegenerate = !lastPrompt || !canForge;

  const flashLabel = useMemo(() => {
    if (flashRemaining <= 0) return "Out of Flash";
    return `${flashRemaining} Flash`;
  }, [flashRemaining]);

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-white/10 bg-slate-950/60 p-5 text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Forge Chat</h2>
          <p className="text-xs text-white/60">Describe the game you want to play.</p>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-emerald-200">
          {flashLabel}
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-4">
        {messages.length === 0 ? (
          <div className="text-sm text-white/60">Start by describing your mini-game idea.</div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={classNames(
                "max-w-[85%] rounded-2xl px-4 py-2 text-sm",
                message.role === "user"
                  ? "ml-auto bg-emerald-400/20 text-emerald-100"
                  : "bg-white/10 text-white/80",
              )}
            >
              {message.content}
            </div>
          ))
        )}
      </div>

      {flashRemaining <= 0 && (
        <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3 text-xs text-amber-200">
          You are out of Flash credits. Upgrade to keep forging games.
        </div>
      )}

      <div className="space-y-3">
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          placeholder="Make spooky pinball with pumpkins..."
          rows={3}
          className="w-full resize-none rounded-2xl border border-white/10 bg-black/40 p-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onForge}
            disabled={disableForge}
            className={classNames(
              "rounded-full px-5 py-2 text-sm font-semibold transition",
              disableForge
                ? "bg-white/10 text-white/40"
                : "bg-emerald-400 text-emerald-950 hover:bg-emerald-300",
            )}
          >
            {isLoading ? "Forging..." : "Forge"}
          </button>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={disableRegenerate}
            className={classNames(
              "rounded-full px-5 py-2 text-sm font-semibold transition",
              disableRegenerate
                ? "bg-white/10 text-white/40"
                : "border border-white/20 text-white/80 hover:bg-white/10",
            )}
          >
            Regenerate
          </button>
          <span className="text-xs text-white/50">Last prompt: {lastPrompt || "None"}</span>
        </div>
      </div>
    </div>
  );
}
