export type GameType = 'snake' | 'clicker' | 'tictactoe' | 'flappy' | null;

export interface GameConfig {
  title?: string;
  description?: string;
  type: GameType;
  theme?: 'retro' | 'modern' | 'cyberpunk' | 'forest';
  difficulty?: 'easy' | 'medium' | 'hard';
  primaryColor?: string;
  speed?: number; // for snake
  targetScore?: number; // for clicker
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  gameConfig?: GameConfig; // If the message generates a game
}
