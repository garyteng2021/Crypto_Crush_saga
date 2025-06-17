import { CryptoType, TelegramConfig } from '../types/game';

export const CRYPTO_TYPES: CryptoType[] = [
  {
    id: 'btc',
    name: 'Bitcoin',
    symbol: '₿',
    color: '#F7931A',
    gradient: 'linear-gradient(135deg, #F7931A 0%, #FFB800 100%)'
  },
  {
    id: 'eth',
    name: 'Ethereum',
    symbol: 'Ξ',
    color: '#627EEA',
    gradient: 'linear-gradient(135deg, #627EEA 0%, #8FA2F5 100%)'
  },
  {
    id: 'doge',
    name: 'Dogecoin',
    symbol: 'Ð',
    color: '#C2A633',
    gradient: 'linear-gradient(135deg, #C2A633 0%, #D4AF37 100%)'
  },
  {
    id: 'sol',
    name: 'Solana',
    symbol: '◎',
    color: '#9945FF',
    gradient: 'linear-gradient(135deg, #9945FF 0%, #14F195 100%)'
  },
  {
    id: 'usdt',
    name: 'Tether',
    symbol: '₮',
    color: '#26A17B',
    gradient: 'linear-gradient(135deg, #26A17B 0%, #50AF95 100%)'
  },
  {
    id: 'ton',
    name: 'Toncoin',
    symbol: '💎',
    color: '#0088CC',
    gradient: 'linear-gradient(135deg, #0088CC 0%, #00A6FB 100%)'
  }
];

export const GAME_CONFIG = {
  BOARD_SIZE: 8,
  INITIAL_LIVES: 5,
  INITIAL_MOVES: 30,
  POINTS_PER_MATCH: 100,
  COMBO_MULTIPLIER: 1.5,
  LIFE_RESTORE_TIME: 30 * 60 * 1000, // 30 minutes
  MAX_LIVES: 5,
  LEVEL_SCORE_THRESHOLD: 10000,
};

export const TELEGRAM_CONFIG: TelegramConfig = {
  botToken: '7605180526:AAHmW9vwXLJLHSreMhxtOVrH7p_loUFLDds',
  redPacketFrequency: 2, // 2 times per day
  hourlyLeaderboard: true,
};

export const ANIMATION_DURATIONS = {
  FALL: 300,
  MATCH: 200,
  COMBO: 400,
  PARTICLE: 800,
};