import React from 'react';
import { Heart, Trophy, Star, Zap } from 'lucide-react';
import { GameState, Player } from '../types/game';

interface GameHUDProps {
  gameState: GameState;
  player: Player;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({ gameState, player, onPause }) => {
  return (
    <div className="game-hud">
      <div className="hud-top">
        <div className="hud-section">
          <div className="hud-item">
            <Heart className="hud-icon heart" />
            <span className="hud-value">{gameState.lives}</span>
          </div>
          <div className="hud-item">
            <Star className="hud-icon star" />
            <span className="hud-value">{gameState.moves}</span>
          </div>
        </div>
        
        <div className="hud-center">
          <div className="level-display">
            <span className="level-text">Level {gameState.level}</span>
          </div>
        </div>
        
        <div className="hud-section">
          <button className="pause-btn" onClick={onPause}>
            ⏸️
          </button>
        </div>
      </div>
      
      <div className="hud-bottom">
        <div className="score-section">
          <div className="current-score">
            <Trophy className="hud-icon trophy" />
            <span className="score-value">{gameState.score.toLocaleString()}</span>
          </div>
          <div className="high-score">
            <span className="high-score-label">Best: {player.highScore.toLocaleString()}</span>
          </div>
        </div>
        
        {gameState.combo > 0 && (
          <div className="combo-display">
            <Zap className="combo-icon" />
            <span className="combo-text">COMBO x{gameState.combo + 1}</span>
          </div>
        )}
      </div>
    </div>
  );
};