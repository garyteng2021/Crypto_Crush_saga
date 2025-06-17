import React from 'react';
import { Cell } from '../types/game';

interface CryptoCellProps {
  cell: Cell;
  isSelected: boolean;
  onClick: () => void;
  size: number;
}

export const CryptoCell: React.FC<CryptoCellProps> = ({ cell, isSelected, onClick, size }) => {
  if (!cell.type) return <div className="crypto-cell empty" style={{ width: size, height: size }} />;

  return (
    <div
      className={`crypto-cell ${isSelected ? 'selected' : ''} ${cell.isMatched ? 'matched' : ''} ${cell.isAnimating ? 'animating' : ''}`}
      style={{
        width: size,
        height: size,
        background: cell.type.gradient,
      }}
      onClick={onClick}
    >
      <div className="crypto-symbol">
        {cell.type.symbol}
      </div>
      <div className="crypto-glow" />
      {isSelected && <div className="selection-ring" />}
    </div>
  );
};