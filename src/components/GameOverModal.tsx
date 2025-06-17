import React from 'react';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { GameState, Player } from '../types/game';

interface GameOverModalProps {
  gameState: GameState;
  player: Player;
  isNewHighScore: boolean;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  gameState,
  player,
  isNewHighScore,
  onRestart,
  onHome,
}) => {
  return (
    <div className="game-over-modal">
      <div className="modal-content">
        <div className="game-over-header">
          {isNewHighScore ? (
            <>
              <div className="celebration">🎉</div>
              <h2 className="modal-title new-record">NEW HIGH SCORE!</h2>
              <div className="celebration">🎉</div>
            </>
          ) : (
            <h2 className="modal-title">Game Over</h2>
          )}
        </div>
        
        <div className="game-over-stats">
          <div className="stat-item">
            <Trophy className="stat-icon" />
            <div className="stat-info">
              <span className="stat-label">Final Score</span>
              <span className="stat-value">{gameState.score.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="stat-item">
            <span className="stat-emoji">🏆</span>
            <div className="stat-info">
              <span className="stat-label">Best Score</span>
              <span className="stat-value">{player.highScore.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="stat-item">
            <span className="stat-emoji">🎯</span>
            <div className="stat-info">
              <span className="stat-label">Level Reached</span>
              <span className="stat-value">{gameState.level}</span>
            </div>
          </div>
        </div>
        
        {gameState.lives <= 0 && (
          <div className="no-lives-message">
            <span className="lives-icon">💔</span>
            <p>No lives remaining! Lives restore over time.</p>
            <p className="lives-timer">Next life in: 30 minutes</p>
          </div>
        )}
        
        <div className="modal-actions">
          <button 
            className="action-btn primary" 
            onClick={onRestart}
            disabled={gameState.lives <= 0}
          >
            <RotateCcw size={20} />
            Play Again
          </button>
          <button className="action-btn secondary" onClick={onHome}>
            <Home size={20} />
            Menu
          </button>
        </div>
        
        {isNewHighScore && (
          <div className="achievement-badge">
            <span className="badge-text">Achievement Unlocked!</span>
            <span className="badge-desc">New Personal Best 🔥</span>
          </div>
        )}
      </div>
    </div>
  );
};