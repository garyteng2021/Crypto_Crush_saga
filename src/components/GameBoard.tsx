import React from 'react';
import { Cell } from '../types/game';
import { CryptoCell } from './CryptoCell';
import { GAME_CONFIG } from '../config/gameConfig';

interface GameBoardProps {
  board: Cell[][];
  selectedCell: { row: number; col: number } | null;
  onCellClick: (row: number, col: number) => void;
  disabled: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({ board, selectedCell, onCellClick, disabled }) => {
  const cellSize = Math.min(
    (window.innerWidth - 40) / GAME_CONFIG.BOARD_SIZE,
    (window.innerHeight - 200) / GAME_CONFIG.BOARD_SIZE
  );

  return (
    <div className="game-board-container">
      <div 
        className="game-board"
        style={{
          gridTemplateColumns: `repeat(${GAME_CONFIG.BOARD_SIZE}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${GAME_CONFIG.BOARD_SIZE}, ${cellSize}px)`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <CryptoCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              isSelected={
                selectedCell?.row === rowIndex && selectedCell?.col === colIndex
              }
              onClick={() => !disabled && onCellClick(rowIndex, colIndex)}
              size={cellSize}
            />
          ))
        )}
      </div>
    </div>
  );
};