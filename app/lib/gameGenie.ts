import { ChatMessage, GameConfig } from "@/app/types";

/**
 * Initial system message shown when app loads
 */
export function createInitialMessage(): ChatMessage {
  return {
    id: "system-1",
    role: "assistant",
    content:
      "Hello! I'm GameGenie. Tell me what kind of mini-game you want to create 🎮",
  };
}

/**
 * TEMP logic: echoes user input and optionally creates a fake game config
 * (We will replace this with Gemini later)
 */
export function processUserMessage(
  text: string,
  currentConfig?: GameConfig
): ChatMessage {
  // basic demo config trigger
  let gameConfig: GameConfig | undefined;

  if (!currentConfig) {
    gameConfig = {
      title: text,
      description: `A game based on: ${text}`,
    };
  }

  return {
    id: Date.now().toString(),
    role: "assistant",
    content: `Got it! Building: "${text}"`,
    gameConfig,
  };
}
