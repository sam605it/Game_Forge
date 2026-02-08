"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { toast } from "sonner";
import ChatInterface, { type ChatMessage } from "@/components/ChatInterface";
import ErrorBoundary from "@/components/ErrorBoundary";
import GamePreview from "@/components/GamePreview";
import { buildPromptFallbackSpec } from "@/lib/ai/promptFallback";
import {
  addVaultGame,
  getFlashRemaining,
  getLastPrompt,
  getVaultGames,
  setFlashRemaining,
  setLastPrompt,
} from "@/lib/storage";
import type { GameSpecV1 } from "@/types";

export default function ForgePage() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [spec, setSpec] = useState<GameSpecV1 | null>(null);
  const [flashRemaining, setFlashState] = useState(40);
  const [vaultCount, setVaultCount] = useState(0);
  const [lastPrompt, setLastPromptState] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const storedFlash = getFlashRemaining();
    const storedPrompt = getLastPrompt();
    const storedVault = getVaultGames();
    setFlashState(storedFlash);
    setVaultCount(storedVault.length);
    setLastPromptState(storedPrompt);
    const urlPrompt = searchParams.get("prompt");
    if (urlPrompt) {
      setInput(urlPrompt);
      setLastPrompt(urlPrompt);
      setLastPromptState(urlPrompt);
    } else if (storedPrompt) {
      setInput(storedPrompt);
    }
  }, [searchParams]);

  const updateFlash = (value: number) => {
    setFlashState(value);
    setFlashRemaining(value);
  };

  const handleForge = useCallback(
    async (prompt: string) => {
      if (!prompt.trim()) return;
      setIsLoading(true);
      setErrorMessage(null);
      setMessages((prev) => [...prev, { role: "user", content: prompt }]);
      try {
        const response = await fetch("/api/forge", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt, flashRemaining }),
        });
        if (!response.ok) {
          throw new Error("Forge request failed.");
        }
        const data = (await response.json()) as GameSpecV1;
        if (!data || !data.title) {
          throw new Error("Invalid game data.");
        }
        setSpec(data);
        setMessages((prev) => [...prev, { role: "assistant", content: `Game forged: ${data.title}` }]);
        setLastPrompt(prompt);
        setLastPromptState(prompt);
        updateFlash(Math.max(0, flashRemaining - 1));
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        setErrorMessage(message);
        setSpec(buildPromptFallbackSpec(prompt));
      } finally {
        setIsLoading(false);
      }
    },
    [flashRemaining],
  );

  const handleSave = () => {
    if (!spec) return;
    const timestamp = Date.now();
    const vaultSpec = { ...spec, id: `${timestamp}-${spec.id}` };
    addVaultGame(vaultSpec);
    setVaultCount((count) => count + 1);
  };

  const handlePreviewError = useCallback(() => {
    const fallback = buildPromptFallbackSpec(lastPrompt || "Safe fallback");
    setSpec(fallback);
    toast.success("Recovered safely.");
  }, [lastPrompt]);

  return (
    <div className="min-h-screen bg-[#070b16] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">AI Mini-Game Forge</h1>
            <p className="text-sm text-white/60">Forge playable games from a prompt using 40 Flash credits.</p>
          </div>
          <nav className="flex items-center gap-4 text-sm text-white/70">
            <Link className="rounded-full border border-white/20 px-4 py-2 hover:bg-white/10" href="/">
              Forge
            </Link>
            <Link className="rounded-full border border-white/20 px-4 py-2 hover:bg-white/10" href="/vault">
              Vault ({vaultCount})
            </Link>
            <Link className="rounded-full border border-white/20 px-4 py-2 hover:bg-white/10" href="/explore">
              Explore
            </Link>
          </nav>
        </header>

        <PanelGroup direction="horizontal" className="flex-1">
          <Panel defaultSize={40} minSize={28}>
            <ChatInterface
              messages={messages}
              input={input}
              flashRemaining={flashRemaining}
              isLoading={isLoading}
              lastPrompt={lastPrompt}
              onInputChange={setInput}
              onForge={() => handleForge(input)}
              onRegenerate={() => handleForge(lastPrompt)}
            />
          </Panel>
          <PanelResizeHandle className="mx-2 w-2 rounded-full bg-white/10" />
          <Panel defaultSize={60} minSize={38}>
            <ErrorBoundary
              fallback={(
                <div className="flex h-full min-h-[420px] items-center justify-center rounded-3xl border border-white/10 bg-slate-950/60 p-6 text-sm text-white/70">
                  The game preview hit a snag. Try forging again.
                </div>
              )}
              onError={handlePreviewError}
              resetKey={spec?.id ?? "empty"}
            >
              <GamePreview spec={spec} onSave={handleSave} />
            </ErrorBoundary>
            {errorMessage && (
              <div className="mt-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100">
                {errorMessage}
              </div>
            )}
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
