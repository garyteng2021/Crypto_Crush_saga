export interface CryptoType {
  id: string;
  name: string;
  color: string;
  symbol: string;
  gradient: string;
}

export interface Cell {
  id: string;
  type: CryptoType | null;
  row: number;
  col: number;
  isMatched: boolean;
  isAnimating: boolean;
}

export interface GameState {
  board: Cell[][];
  score: number;
  lives: number;
  moves: number;
  level: number;
  combo: number;
  isGameOver: boolean;
  isPaused: boolean;
  selectedCell: { row: number; col: number } | null;
}

export interface Player {
  id: string;
  username: string;
  firstName: string;
  lastName?: string;
  highScore: number;
  currentScore: number;
  lives: number;
  level: number;
  lastPlayed: number;
  gamesPlayed: number;
}

export interface TelegramConfig {
  botToken: string;
  chatId?: string;
  redPacketFrequency: number; // times per day
  hourlyLeaderboard: boolean;
}