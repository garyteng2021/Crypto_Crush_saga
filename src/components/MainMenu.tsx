import React from 'react';
import { Play, Trophy, Settings, Info } from 'lucide-react';
import { Player } from '../types/game';

interface MainMenuProps {
  player: Player | null;
  onStartGame: () => void;
  onShowLeaderboard: () => void;
  onShowSettings: () => void;
  onShowInfo: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  player,
  onStartGame,
  onShowLeaderboard,
  onShowSettings,
  onShowInfo,
}) => {
  return (
    <div className="main-menu">
      <div className="menu-header">
        <h1 className="game-title">
          <span className="title-crypto">Crypto</span>
          <span className="title-crush">Crush</span>
          <span className="title-saga">Saga</span>
        </h1>
        <div className="title-subtitle">Match the cryptos, crush the market!</div>
      </div>
      
      {player && (
        <div className="player-info">
          <div className="player-avatar">
            <span className="avatar-text">
              {player.firstName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="player-details">
            <h3 className="player-name">{player.firstName} {player.lastName || ''}</h3>
            <div className="player-stats">
              <span className="stat">❤️ {player.lives}</span>
              <span className="stat">🏆 {player.highScore.toLocaleString()}</span>
              <span className="stat">🎯 Level {player.level}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="menu-actions">
        <button 
          className="menu-btn primary" 
          onClick={onStartGame}
          disabled={player && player.lives <= 0}
        >
          <Play size={24} />
          <span>Start Game</span>
          {player && player.lives <= 0 && (
            <small className="btn-subtitle">No lives remaining</small>
          )}
        </button>
        
        <button className="menu-btn secondary" onClick={onShowLeaderboard}>
          <Trophy size={24} />
          <span>Leaderboard</span>
        </button>
        
        <button className="menu-btn secondary" onClick={onShowSettings}>
          <Settings size={24} />
          <span>Settings</span>
        </button>
        
        <button className="menu-btn secondary" onClick={onShowInfo}>
          <Info size={24} />
          <span>How to Play</span>
        </button>
      </div>
      
      <div className="crypto-showcase">
        <div className="showcase-title">Collect All Cryptos!</div>
        <div className="crypto-icons">
          <div className="crypto-preview btc">₿</div>
          <div className="crypto-preview eth">Ξ</div>
          <div className="crypto-preview doge">Ð</div>
          <div className="crypto-preview sol">◎</div>
          <div className="crypto-preview usdt">₮</div>
          <div className="crypto-preview ton">💎</div>
        </div>
      </div>
    </div>
  );
};