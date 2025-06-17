import { playerStorage } from './playerStorage';
import { telegramAPI } from './telegramApi';
import { TELEGRAM_CONFIG } from '../config/gameConfig';

class GameScheduler {
  private leaderboardInterval: NodeJS.Timeout | null = null;
  private redPacketTimeouts: NodeJS.Timeout[] = [];

  startScheduledTasks(): void {
    this.startHourlyLeaderboard();
    this.scheduleDailyRedPackets();
  }

  stopScheduledTasks(): void {
    if (this.leaderboardInterval) {
      clearInterval(this.leaderboardInterval);
      this.leaderboardInterval = null;
    }

    this.redPacketTimeouts.forEach(timeout => clearTimeout(timeout));
    this.redPacketTimeouts = [];
  }

  private startHourlyLeaderboard(): void {
    if (!TELEGRAM_CONFIG.hourlyLeaderboard) return;

    // Send leaderboard every hour
    const sendLeaderboard = () => {
      const topPlayers = playerStorage.getTopPlayers(10);
      if (topPlayers.length > 0) {
        telegramAPI.sendLeaderboard(topPlayers);
      }
    };

    // Send immediately and then every hour
    sendLeaderboard();
    this.leaderboardInterval = setInterval(sendLeaderboard, 60 * 60 * 1000); // 1 hour
  }

  private scheduleDailyRedPackets(): void {
    const frequency = TELEGRAM_CONFIG.redPacketFrequency;
    const hoursInDay = 24;
    const intervalHours = hoursInDay / frequency;

    // Calculate times for red packet distribution
    const distributionTimes: number[] = [];
    for (let i = 0; i < frequency; i++) {
      const hour = Math.floor(intervalHours * i);
      distributionTimes.push(hour);
    }

    // Schedule red packets for today
    this.scheduleRedPacketsForToday(distributionTimes);

    // Schedule for future days
    const scheduleNextDay = () => {
      setTimeout(() => {
        this.scheduleRedPacketsForToday(distributionTimes);
        scheduleNextDay();
      }, 24 * 60 * 60 * 1000); // 24 hours
    };

    scheduleNextDay();
  }

  private scheduleRedPacketsForToday(distributionTimes: number[]): void {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    distributionTimes.forEach(hour => {
      const distributionTime = new Date(today);
      distributionTime.setHours(hour, 0, 0, 0);

      // If the time has already passed today, skip it
      if (distributionTime.getTime() <= Date.now()) {
        return;
      }

      const timeUntilDistribution = distributionTime.getTime() - Date.now();
      const timeout = setTimeout(() => {
        this.distributeRedPackets();
      }, timeUntilDistribution);

      this.redPacketTimeouts.push(timeout);
    });
  }

  private async distributeRedPackets(): Promise<void> {
    const topPlayers = playerStorage.getTopPlayers(10);
    
    if (topPlayers.length > 0) {
      // Send notification about red packet distribution
      await telegramAPI.sendRedPacketNotification(topPlayers);
      
      // Reset all scores after distribution
      playerStorage.resetAllScores();
    }
  }

  // Manual trigger for red packet distribution (for admin use)
  async triggerRedPacketDistribution(): Promise<void> {
    await this.distributeRedPackets();
  }
}

export const gameScheduler = new GameScheduler();