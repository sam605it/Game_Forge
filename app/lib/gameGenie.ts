import { GameConfig, ChatMessage } from '@/app/types';

const INITIAL_GREETING = "Hello! I'm GameGenie. Tell me what kind of mini-game you'd like to create (Snake, Clicker, or Tic-Tac-Toe), and pick a theme (Retro, Cyberpunk, Forest)!";

export const createInitialMessage = (): ChatMessage => ({
  id: 'init',
  role: 'assistant',
  content: INITIAL_GREETING
});

export const processUserMessage = (text: string, currentConfig: GameConfig | undefined): ChatMessage => {
  const lower = text.toLowerCase();
  
  let newConfig: GameConfig = currentConfig ? { ...currentConfig } : { type: null };
  let responseText = "";

  // Detect Game Type
  if (lower.includes('snake')) {
    newConfig.type = 'snake';
    responseText = "I've generated a Snake game for you! ";
  } else if (lower.includes('clicker')) {
    newConfig.type = 'clicker';
    responseText = "Here is a Clicker game! ";
  } else if (lower.includes('tic') || lower.includes('tac')) {
    newConfig.type = 'tictactoe';
    responseText = "Tic-Tac-Toe it is! ";
  }

  // Detect Theme
  if (lower.includes('cyberpunk') || lower.includes('neon')) {
    newConfig.theme = 'cyberpunk';
    responseText += "Applied the Cyberpunk theme. ";
  } else if (lower.includes('retro') || lower.includes('pixel')) {
    newConfig.theme = 'retro';
    responseText += "Going old school with Retro theme. ";
  } else if (lower.includes('forest') || lower.includes('nature')) {
    newConfig.theme = 'forest';
    responseText += "Applied the Forest theme. ";
  } else if (lower.includes('modern')) {
    newConfig.theme = 'modern';
    responseText += "Kept it clean and Modern. ";
  }

  // Detect Difficulty
  if (lower.includes('hard') || lower.includes('impossible')) {
    newConfig.difficulty = 'hard';
    responseText += "Difficulty set to Hard. Good luck! ";
  } else if (lower.includes('easy') || lower.includes('simple')) {
    newConfig.difficulty = 'easy';
    responseText += "Difficulty set to Easy. ";
  } else if (lower.includes('medium')) {
    newConfig.difficulty = 'medium';
  }

  // Fallback if no specific change detected but we have a config
  if (!responseText) {
    if (newConfig.type) {
      responseText = `I've updated the ${newConfig.type} game based on your request.`;
    } else {
      responseText = "I'm not sure what game you mean. Try asking for Snake, Clicker, or Tic-Tac-Toe.";
      // Don't update config if we didn't understand
      return {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseText
      };
    }
  }

  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: responseText,
    gameConfig: newConfig
  };
};
