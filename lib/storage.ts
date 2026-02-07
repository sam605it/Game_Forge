import type { GameSpecV1 } from "@/types";

const FLASH_KEY = "flash_remaining";
const VAULT_KEY = "vault_games";
const LAST_PROMPT_KEY = "last_prompt";

const defaultFlash = 40;

const isBrowser = () => typeof window !== "undefined";

export const getFlashRemaining = (): number => {
  if (!isBrowser()) return defaultFlash;
  const raw = window.localStorage.getItem(FLASH_KEY);
  const value = raw ? Number(raw) : defaultFlash;
  return Number.isFinite(value) ? value : defaultFlash;
};

export const setFlashRemaining = (value: number) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(FLASH_KEY, String(Math.max(0, value)));
};

export const getVaultGames = (): GameSpecV1[] => {
  if (!isBrowser()) return [];
  const raw = window.localStorage.getItem(VAULT_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as GameSpecV1[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export const setVaultGames = (games: GameSpecV1[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(VAULT_KEY, JSON.stringify(games));
};

export const addVaultGame = (game: GameSpecV1) => {
  const games = getVaultGames();
  setVaultGames([game, ...games]);
};

export const removeVaultGame = (id: string) => {
  const games = getVaultGames().filter((game) => game.id !== id);
  setVaultGames(games);
};

export const getLastPrompt = (): string => {
  if (!isBrowser()) return "";
  return window.localStorage.getItem(LAST_PROMPT_KEY) ?? "";
};

export const setLastPrompt = (prompt: string) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(LAST_PROMPT_KEY, prompt);
};
