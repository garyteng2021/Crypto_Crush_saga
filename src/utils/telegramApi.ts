import { Player, TelegramConfig } from '../types/game';
import { TELEGRAM_CONFIG } from '../config/gameConfig';

class TelegramAPI {
  private config: TelegramConfig;
  private chatId: string | null = null;
  private isGroupChat: boolean = false;

  constructor() {
    this.config = TELEGRAM_CONFIG;
    this.initializeTelegram();
  }

  private initializeTelegram() {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
      
      // Get chat info from Telegram WebApp
      const webApp = window.Telegram.WebApp;
      
      // First, try to get chat ID from initDataUnsafe
      if (webApp.initDataUnsafe) {
        // Check if we're in a group/channel chat
        if (webApp.initDataUnsafe.chat) {
          this.chatId = webApp.initDataUnsafe.chat.id?.toString();
          this.isGroupChat = webApp.initDataUnsafe.chat.type === 'group' || 
                            webApp.initDataUnsafe.chat.type === 'supergroup' ||
                            webApp.initDataUnsafe.chat.type === 'channel';
          console.log('Detected group/channel chat:', this.chatId, 'Type:', webApp.initDataUnsafe.chat.type);
        }
        // Fallback to user ID for private chats
        else if (webApp.initDataUnsafe.user) {
          this.chatId = webApp.initDataUnsafe.user.id?.toString();
          this.isGroupChat = false;
          console.log('Detected private chat with user:', this.chatId);
        }
      }
      
      // Fallback: Parse from raw initData if initDataUnsafe is not available
      if (!this.chatId && webApp.initData) {
        try {
          const params = new URLSearchParams(webApp.initData);
          
          // Try to get chat data first
          const chatData = params.get('chat');
          if (chatData) {
            const chat = JSON.parse(chatData);
            this.chatId = chat.id?.toString();
            this.isGroupChat = chat.type === 'group' || chat.type === 'supergroup' || chat.type === 'channel';
            console.log('Parsed chat from initData:', this.chatId, 'Type:', chat.type);
          }
          // Fallback to user data
          else {
            const userData = params.get('user');
            if (userData) {
              const user = JSON.parse(userData);
              this.chatId = user.id?.toString();
              this.isGroupChat = false;
              console.log('Parsed user from initData:', this.chatId);
            }
          }
        } catch (error) {
          console.error('Failed to parse Telegram initData:', error);
        }
      }
      
      if (!this.chatId) {
        console.warn('Could not determine chat ID from Telegram WebApp');
      } else {
        console.log('Telegram API initialized with chat ID:', this.chatId, 'Is group:', this.isGroupChat);
      }
    } else {
      console.warn('Telegram WebApp not available');
    }
  }

  async sendMessage(text: string, chatId?: string): Promise<boolean> {
    try {
      const targetChatId = chatId || this.chatId;
      if (!targetChatId) {
        console.warn('No chat ID available for sending message');
        return false;
      }

      const response = await fetch(`https://api.telegram.org/bot${this.config.botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: targetChatId,
          text,
          parse_mode: 'HTML',
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        console.error('Telegram API error:', result);
        return false;
      }

      console.log('Message sent successfully to chat:', targetChatId);
      return true;
    } catch (error) {
      console.error('Failed to send Telegram message:', error);
      return false;
    }
  }

  async notifyGameOver(player: Player, isNewHighScore: boolean): Promise<void> {
    // Only send group notifications for high scores or if explicitly in a group
    if (!this.isGroupChat && !isNewHighScore) {
      return;
    }

    const emoji = isNewHighScore ? '🎉' : '💀';
    const message = `
${emoji} <b>Game Over!</b> ${emoji}

👤 Player: ${player.firstName} ${player.lastName || ''}
${isNewHighScore ? '🏆 NEW HIGH SCORE! 🏆' : ''}
📊 Score: ${player.currentScore.toLocaleString()}
🥇 Best: ${player.highScore.toLocaleString()}
🎯 Level: ${player.level}
🎮 Games Played: ${player.gamesPlayed}

${isNewHighScore ? 'Congratulations on the new record! 🔥' : 'Keep trying to beat your high score! 💪'}
    `.trim();

    await this.sendMessage(message);
  }

  async sendLeaderboard(players: Player[]): Promise<void> {
    // Only send leaderboard to groups
    if (!this.isGroupChat) {
      return;
    }

    const top10 = players
      .sort((a, b) => b.highScore - a.highScore)
      .slice(0, 10);

    let message = '🏆 <b>TOP 10 LEADERBOARD</b> 🏆\n\n';
    
    top10.forEach((player, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      message += `${medal} ${player.firstName} - ${player.highScore.toLocaleString()}\n`;
    });

    message += '\n💎 Keep playing to climb the rankings!';

    await this.sendMessage(message);
  }

  async sendRedPacketNotification(topPlayers: Player[]): Promise<void> {
    // Only send red packet notifications to groups
    if (!this.isGroupChat) {
      return;
    }

    const message = `
🧧 <b>RED PACKET DISTRIBUTION!</b> 🧧

🎉 Congratulations to our TOP 10 players!
Touch 'n Go red packets are now available!

💰 Rewards distributed to:
${topPlayers.map((player, index) => 
  `${index + 1}. ${player.firstName} - ${player.highScore.toLocaleString()}`
).join('\n')}

📈 Scores have been reset! 
🔥 New competition starts now!

#CryptoCrush #RedPacket #TelegramGame
    `.trim();

    await this.sendMessage(message);
  }

  getCurrentUser(): any {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user) {
      return window.Telegram.WebApp.initDataUnsafe.user;
    }
    return null;
  }

  getChatInfo(): { chatId: string | null; isGroupChat: boolean } {
    return {
      chatId: this.chatId,
      isGroupChat: this.isGroupChat
    };
  }

  hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light'): void {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(type);
    }
  }

  showAlert(message: string): void {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.showAlert(message);
    } else {
      alert(message);
    }
  }
}

export const telegramAPI = new TelegramAPI();

// Extend Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
          };
          chat?: {
            id: number;
            type: 'private' | 'group' | 'supergroup' | 'channel';
            title?: string;
            username?: string;
          };
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy') => void;
        };
        showAlert: (message: string) => void;
      };
    };
  }
}