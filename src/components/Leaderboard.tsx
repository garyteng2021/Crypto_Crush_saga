import React from 'react';
import { ArrowLeft, Trophy, Medal, Award } from 'lucide-react';
import { Player } from '../types/game';
import { playerStorage } from '../utils/playerStorage';

interface LeaderboardProps {
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const topPlayers = playerStorage.getTopPlayers(50);
  
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="rank-icon gold" />;
      case 2: return <Medal className="rank-icon silver" />;
      case 3: return <Award className="rank-icon bronze" />;
      default: return <span className="rank-number">{rank}</span>;
    }
  };

  const getRankClass = (rank: number) => {
    if (rank <= 3) return 'top-three';
    if (rank <= 10) return 'top-ten';
    return '';
  };

  return (
    <div className="leaderboard">
      <div className="leaderboard-header">
        <button className="back-btn" onClick={onBack}>
          <ArrowLeft size={24} />
        </button>
        <h2 className="leaderboard-title">🏆 Leaderboard</h2>
        <div className="leaderboard-subtitle">Top Players Worldwide</div>
      </div>
      
      <div className="leaderboard-list">
        {topPlayers.length === 0 ? (
          <div className="empty-leaderboard">
            <div className="empty-icon">🎮</div>
            <p>No players yet!</p>
            <p>Be the first to set a high score.</p>
          </div>
        ) : (
          topPlayers.map((player, index) => {
            const rank = index + 1;
            return (
              <div key={player.id} className={`leaderboard-item ${getRankClass(rank)}`}>
                <div className="rank-section">
                  {getRankIcon(rank)}
                </div>
                
                <div className="player-section">
                  <div className="player-avatar">
                    <span className="avatar-text">
                      {player.firstName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="player-info">
                    <span className="player-name">
                      {player.firstName} {player.lastName || ''}
                    </span>
                    <div className="player-details">
                      <span className="detail">Level {player.level}</span>
                      <span className="detail">•</span>
                      <span className="detail">{player.gamesPlayed} games</span>
                    </div>
                  </div>
                </div>
                
                <div className="score-section">
                  <span className="score-value">
                    {player.highScore.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {topPlayers.length > 0 && (
        <div className="leaderboard-footer">
          <div className="footer-stats">
            <div className="stat">
              <span className="stat-value">{topPlayers.length}</span>
              <span className="stat-label">Total Players</span>
            </div>
            <div className="stat">
              <span className="stat-value">
                {Math.max(...topPlayers.map(p => p.highScore)).toLocaleString()}
              </span>
              <span className="stat-label">Highest Score</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};