import React, { useState, useEffect, useCallback } from 'react';
import { GameState, Player, Cell } from './types/game';
import { MainMenu } from './components/MainMenu';
import { GameBoard } from './components/GameBoard';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { Leaderboard } from './components/Leaderboard';
import { playerStorage } from './utils/playerStorage';
import { telegramAPI } from './utils/telegramApi';
import { gameScheduler } from './utils/gameScheduler';
import { 
  createEmptyBoard, 
  fillBoard, 
  findMatches, 
  isValidSwap, 
  swapCells, 
  applyGravity, 
  calculateScore,
  hasValidMoves 
} from './utils/gameLogic';
import { GAME_CONFIG, ANIMATION_DURATIONS } from './config/gameConfig';
import './styles/game.css';

type GameScreen = 'menu' | 'game' | 'leaderboard' | 'settings' | 'info';

function App() {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>('menu');
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    board: createEmptyBoard(),
    score: 0,
    lives: GAME_CONFIG.INITIAL_LIVES,
    moves: GAME_CONFIG.INITIAL_MOVES,
    level: 1,
    combo: 0,
    isGameOver: false,
    isPaused: false,
    selectedCell: null,
  });
  const [showGameOver, setShowGameOver] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize player and game scheduler
  useEffect(() => {
    const initializeGame = async () => {
      const currentPlayer = playerStorage.getCurrentPlayer();
      if (currentPlayer) {
        // Restore lives if needed
        const restoredLives = playerStorage.restoreLivesIfNeeded(currentPlayer.id);
        if (restoredLives !== currentPlayer.lives) {
          currentPlayer.lives = restoredLives;
          setPlayer({ ...currentPlayer });
        } else {
          setPlayer(currentPlayer);
        }
      }

      // Start scheduled tasks
      gameScheduler.startScheduledTasks();
    };

    initializeGame();

    return () => {
      gameScheduler.stopScheduledTasks();
    };
  }, []);

  const initializeBoard = useCallback(() => {
    let board = createEmptyBoard();
    board = fillBoard(board);
    
    // Remove any initial matches
    let matches = findMatches(board);
    while (matches.length > 0) {
      matches.forEach(cell => {
        board[cell.row][cell.col].isMatched = true;
      });
      board = applyGravity(board);
      board = fillBoard(board);
      matches = findMatches(board);
    }
    
    return board;
  }, []);

  const startNewGame = useCallback(() => {
    if (!player || player.lives <= 0) return;

    const board = initializeBoard();
    setGameState({
      board,
      score: 0,
      lives: player.lives,
      moves: GAME_CONFIG.INITIAL_MOVES,
      level: 1,
      combo: 0,
      isGameOver: false,
      isPaused: false,
      selectedCell: null,
    });
    setShowGameOver(false);
    setIsNewHighScore(false);
    setCurrentScreen('game');
    
    // Update player's current score
    if (player) {
      const updatedPlayer = { ...player, currentScore: 0 };
      setPlayer(updatedPlayer);
      playerStorage.saveCurrentPlayer(updatedPlayer);
    }
  }, [player, initializeBoard]);

  const processMatches = useCallback(async (board: Cell[][], combo: number = 0): Promise<{ board: Cell[][], score: number, combo: number }> => {
    const matches = findMatches(board);
    
    if (matches.length === 0) {
      return { board, score: 0, combo: 0 };
    }

    // Mark matches and add score
    matches.forEach(cell => {
      board[cell.row][cell.col].isMatched = true;
    });

    const matchScore = calculateScore(matches, combo);
    
    // Add haptic feedback for matches
    telegramAPI.hapticFeedback(matches.length > 5 ? 'heavy' : 'medium');
    
    // Wait for match animation
    await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATIONS.MATCH));
    
    // Apply gravity and fill empty spaces
    board = applyGravity(board);
    board = fillBoard(board);
    
    // Wait for fall animation
    await new Promise(resolve => setTimeout(resolve, ANIMATION_DURATIONS.FALL));
    
    // Check for cascade matches
    const cascadeResult = await processMatches(board, combo + 1);
    
    return {
      board: cascadeResult.board,
      score: matchScore + cascadeResult.score,
      combo: Math.max(combo, cascadeResult.combo)
    };
  }, []);

  const handleCellClick = useCallback(async (row: number, col: number) => {
    if (isProcessing || gameState.isGameOver || gameState.isPaused) return;

    const { selectedCell } = gameState;

    if (!selectedCell) {
      // Select first cell
      setGameState(prev => ({
        ...prev,
        selectedCell: { row, col }
      }));
      telegramAPI.hapticFeedback('light');
      return;
    }

    if (selectedCell.row === row && selectedCell.col === col) {
      // Deselect
      setGameState(prev => ({
        ...prev,
        selectedCell: null
      }));
      return;
    }

    // Check if swap is valid
    if (!isValidSwap(gameState.board, selectedCell, { row, col })) {
      setGameState(prev => ({
        ...prev,
        selectedCell: { row, col }
      }));
      telegramAPI.hapticFeedback('light');
      return;
    }

    setIsProcessing(true);
    
    // Perform swap
    let newBoard = swapCells(gameState.board, selectedCell, { row, col });
    
    // Process matches
    const { board: finalBoard, score: matchScore, combo } = await processMatches(newBoard);
    
    const newScore = gameState.score + matchScore;
    const newMoves = gameState.moves - 1;
    const newLevel = Math.floor(newScore / GAME_CONFIG.LEVEL_SCORE_THRESHOLD) + 1;

    // Check if game should end
    const shouldEndGame = newMoves <= 0 || !hasValidMoves(finalBoard);
    
    setGameState(prev => ({
      ...prev,
      board: finalBoard,
      score: newScore,
      moves: newMoves,
      level: newLevel,
      combo,
      selectedCell: null,
      isGameOver: shouldEndGame,
    }));

    if (shouldEndGame) {
      handleGameOver(newScore, newLevel);
    } else {
      // Update player's current score
      if (player) {
        const updatedPlayer = { ...player, currentScore: newScore, level: newLevel };
        setPlayer(updatedPlayer);
        playerStorage.saveCurrentPlayer(updatedPlayer);
      }
    }

    setIsProcessing(false);
  }, [gameState, player, processMatches, isProcessing]);

  const handleGameOver = useCallback(async (finalScore: number, finalLevel: number) => {
    if (!player) return;

    // Use a life
    const newLives = Math.max(0, player.lives - 1);
    
    // Update player stats
    const newHighScore = playerStorage.updatePlayerScore(player.id, finalScore, finalLevel);
    
    // Update player lives
    playerStorage.updatePlayerLives(player.id, newLives);
    
    // Update local player state
    const updatedPlayer = {
      ...player,
      currentScore: finalScore,
      lives: newLives,
      level: finalLevel,
      highScore: newHighScore ? finalScore : player.highScore,
      gamesPlayed: player.gamesPlayed + 1,
    };
    
    setPlayer(updatedPlayer);
    setIsNewHighScore(newHighScore);
    setShowGameOver(true);
    
    // Send notification to Telegram group
    await telegramAPI.notifyGameOver(updatedPlayer, newHighScore);
    
    // Haptic feedback for game over
    telegramAPI.hapticFeedback('heavy');
  }, [player]);

  const handleRestart = useCallback(() => {
    if (player && player.lives > 0) {
      startNewGame();
    }
  }, [player, startNewGame]);

  const handleBackToMenu = useCallback(() => {
    setCurrentScreen('menu');
    setShowGameOver(false);
  }, []);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'menu':
        return (
          <MainMenu
            player={player}
            onStartGame={startNewGame}
            onShowLeaderboard={() => setCurrentScreen('leaderboard')}
            onShowSettings={() => setCurrentScreen('settings')}
            onShowInfo={() => setCurrentScreen('info')}
          />
        );
      
      case 'game':
        return (
          <div className="game-screen">
            {player && (
              <GameHUD
                gameState={gameState}
                player={player}
                onPause={() => setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }))}
              />
            )}
            <GameBoard
              board={gameState.board}
              selectedCell={gameState.selectedCell}
              onCellClick={handleCellClick}
              disabled={isProcessing || gameState.isPaused}
            />
            {showGameOver && player && (
              <GameOverModal
                gameState={gameState}
                player={player}
                isNewHighScore={isNewHighScore}
                onRestart={handleRestart}
                onHome={handleBackToMenu}
              />
            )}
          </div>
        );
      
      case 'leaderboard':
        return <Leaderboard onBack={() => setCurrentScreen('menu')} />;
      
      default:
        return (
          <div className="placeholder-screen">
            <h2>Coming Soon!</h2>
            <button onClick={() => setCurrentScreen('menu')}>Back to Menu</button>
          </div>
        );
    }
  };

  return (
    <div className="app">
      {renderCurrentScreen()}
    </div>
  );
}

export default App;