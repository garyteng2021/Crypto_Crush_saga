import { Player } from '../types/game';
import { telegramAPI } from './telegramApi';

class PlayerStorage {
  private readonly STORAGE_KEY = 'crypto_crush_players';
  private readonly CURRENT_PLAYER_KEY = 'crypto_crush_current_player';

  private getStoredPlayers(): Player[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private savePlayersToStorage(players: Player[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(players));
    } catch (error) {
      console.error('Failed to save players to storage:', error);
    }
  }

  getCurrentPlayer(): Player | null {
    try {
      const stored = localStorage.getItem(this.CURRENT_PLAYER_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // Try to create player from Telegram data
      const telegramUser = telegramAPI.getCurrentUser();
      if (telegramUser) {
        return this.createPlayerFromTelegram(telegramUser);
      }

      return null;
    } catch {
      return null;
    }
  }

  private createPlayerFromTelegram(telegramUser: any): Player {
    const player: Player = {
      id: telegramUser.id.toString(),
      username: telegramUser.username || '',
      firstName: telegramUser.first_name || 'Player',
      lastName: telegramUser.last_name,
      highScore: 0,
      currentScore: 0,
      lives: 5,
      level: 1,
      lastPlayed: Date.now(),
      gamesPlayed: 0,
    };

    this.saveCurrentPlayer(player);
    return player;
  }

  saveCurrentPlayer(player: Player): void {
    try {
      localStorage.setItem(this.CURRENT_PLAYER_KEY, JSON.stringify(player));
      
      // Also update in the players list
      const players = this.getStoredPlayers();
      const existingIndex = players.findIndex(p => p.id === player.id);
      
      if (existingIndex >= 0) {
        players[existingIndex] = player;
      } else {
        players.push(player);
      }
      
      this.savePlayersToStorage(players);
    } catch (error) {
      console.error('Failed to save current player:', error);
    }
  }

  getAllPlayers(): Player[] {
    return this.getStoredPlayers();
  }

  getTopPlayers(limit: number = 10): Player[] {
    return this.getStoredPlayers()
      .sort((a, b) => b.highScore - a.highScore)
      .slice(0, limit);
  }

  updatePlayerScore(playerId: string, score: number, level: number): boolean {
    try {
      const players = this.getStoredPlayers();
      const playerIndex = players.findIndex(p => p.id === playerId);
      
      if (playerIndex >= 0) {
        const player = players[playerIndex];
        const isNewHighScore = score > player.highScore;
        
        player.currentScore = score;
        player.level = level;
        player.lastPlayed = Date.now();
        player.gamesPlayed += 1;
        
        if (isNewHighScore) {
          player.highScore = score;
        }
        
        this.savePlayersToStorage(players);
        this.saveCurrentPlayer(player);
        
        return isNewHighScore;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update player score:', error);
      return false;
    }
  }

  resetAllScores(): void {
    try {
      const players = this.getStoredPlayers();
      players.forEach(player => {
        player.highScore = 0;
        player.currentScore = 0;
        player.level = 1;
      });
      
      this.savePlayersToStorage(players);
      
      // Update current player if exists
      const currentPlayer = this.getCurrentPlayer();
      if (currentPlayer) {
        currentPlayer.highScore = 0;
        currentPlayer.currentScore = 0;
        currentPlayer.level = 1;
        this.saveCurrentPlayer(currentPlayer);
      }
    } catch (error) {
      console.error('Failed to reset scores:', error);
    }
  }

  updatePlayerLives(playerId: string, lives: number): void {
    try {
      const players = this.getStoredPlayers();
      const playerIndex = players.findIndex(p => p.id === playerId);
      
      if (playerIndex >= 0) {
        players[playerIndex].lives = lives;
        players[playerIndex].lastPlayed = Date.now();
        this.savePlayersToStorage(players);
        
        // Update current player if it matches
        const currentPlayer = this.getCurrentPlayer();
        if (currentPlayer && currentPlayer.id === playerId) {
          currentPlayer.lives = lives;
          currentPlayer.lastPlayed = Date.now();
          this.saveCurrentPlayer(currentPlayer);
        }
      }
    } catch (error) {
      console.error('Failed to update player lives:', error);
    }
  }

  restoreLivesIfNeeded(playerId: string): number {
    try {
      const player = this.getStoredPlayers().find(p => p.id === playerId);
      if (!player) return 5;

      const now = Date.now();
      const timeSinceLastPlayed = now - player.lastPlayed;
      const livesRestoreTime = 30 * 60 * 1000; // 30 minutes
      const maxLives = 5;

      if (player.lives < maxLives && timeSinceLastPlayed >= livesRestoreTime) {
        const livesToRestore = Math.floor(timeSinceLastPlayed / livesRestoreTime);
        const newLives = Math.min(player.lives + livesToRestore, maxLives);
        
        this.updatePlayerLives(playerId, newLives);
        return newLives;
      }

      return player.lives;
    } catch (error) {
      console.error('Failed to restore lives:', error);
      return 5;
    }
  }
}

export const playerStorage = new PlayerStorage();