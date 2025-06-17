import { Cell, CryptoType, GameState } from '../types/game';
import { CRYPTO_TYPES, GAME_CONFIG } from '../config/gameConfig';

export const createEmptyBoard = (): Cell[][] => {
  const board: Cell[][] = [];
  for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
      board[row][col] = {
        id: `${row}-${col}`,
        type: null,
        row,
        col,
        isMatched: false,
        isAnimating: false,
      };
    }
  }
  return board;
};

export const getRandomCrypto = (): CryptoType => {
  return CRYPTO_TYPES[Math.floor(Math.random() * CRYPTO_TYPES.length)];
};

export const fillBoard = (board: Cell[][]): Cell[][] => {
  const newBoard = board.map(row => [...row]);
  
  for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
    for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
      if (!newBoard[row][col].type) {
        let crypto: CryptoType;
        let attempts = 0;
        
        // Avoid creating immediate matches
        do {
          crypto = getRandomCrypto();
          attempts++;
        } while (
          attempts < 10 && 
          wouldCreateMatch(newBoard, row, col, crypto)
        );
        
        newBoard[row][col].type = crypto;
      }
    }
  }
  
  return newBoard;
};

const wouldCreateMatch = (board: Cell[][], row: number, col: number, crypto: CryptoType): boolean => {
  // Check horizontal matches
  let horizontalCount = 1;
  
  // Check left
  let leftCol = col - 1;
  while (leftCol >= 0 && board[row][leftCol].type?.id === crypto.id) {
    horizontalCount++;
    leftCol--;
  }
  
  // Check right
  let rightCol = col + 1;
  while (rightCol < GAME_CONFIG.BOARD_SIZE && board[row][rightCol].type?.id === crypto.id) {
    horizontalCount++;
    rightCol++;
  }
  
  if (horizontalCount >= 3) return true;
  
  // Check vertical matches
  let verticalCount = 1;
  
  // Check up
  let upRow = row - 1;
  while (upRow >= 0 && board[upRow][col].type?.id === crypto.id) {
    verticalCount++;
    upRow--;
  }
  
  // Check down
  let downRow = row + 1;
  while (downRow < GAME_CONFIG.BOARD_SIZE && board[downRow][col].type?.id === crypto.id) {
    verticalCount++;
    downRow++;
  }
  
  return verticalCount >= 3;
};

export const findMatches = (board: Cell[][]): Cell[] => {
  const matches: Cell[] = [];
  const matchedCells = new Set<string>();
  
  // Find horizontal matches
  for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
    let count = 1;
    let currentType = board[row][0].type;
    
    for (let col = 1; col < GAME_CONFIG.BOARD_SIZE; col++) {
      if (board[row][col].type && board[row][col].type!.id === currentType?.id) {
        count++;
      } else {
        if (count >= 3 && currentType) {
          for (let i = col - count; i < col; i++) {
            if (!matchedCells.has(`${row}-${i}`)) {
              matches.push(board[row][i]);
              matchedCells.add(`${row}-${i}`);
            }
          }
        }
        count = 1;
        currentType = board[row][col].type;
      }
    }
    
    if (count >= 3 && currentType) {
      for (let i = GAME_CONFIG.BOARD_SIZE - count; i < GAME_CONFIG.BOARD_SIZE; i++) {
        if (!matchedCells.has(`${row}-${i}`)) {
          matches.push(board[row][i]);
          matchedCells.add(`${row}-${i}`);
        }
      }
    }
  }
  
  // Find vertical matches
  for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
    let count = 1;
    let currentType = board[0][col].type;
    
    for (let row = 1; row < GAME_CONFIG.BOARD_SIZE; row++) {
      if (board[row][col].type && board[row][col].type!.id === currentType?.id) {
        count++;
      } else {
        if (count >= 3 && currentType) {
          for (let i = row - count; i < row; i++) {
            if (!matchedCells.has(`${i}-${col}`)) {
              matches.push(board[i][col]);
              matchedCells.add(`${i}-${col}`);
            }
          }
        }
        count = 1;
        currentType = board[row][col].type;
      }
    }
    
    if (count >= 3 && currentType) {
      for (let i = GAME_CONFIG.BOARD_SIZE - count; i < GAME_CONFIG.BOARD_SIZE; i++) {
        if (!matchedCells.has(`${i}-${col}`)) {
          matches.push(board[i][col]);
          matchedCells.add(`${i}-${col}`);
        }
      }
    }
  }
  
  return matches;
};

export const isValidSwap = (board: Cell[][], from: { row: number; col: number }, to: { row: number; col: number }): boolean => {
  const rowDiff = Math.abs(from.row - to.row);
  const colDiff = Math.abs(from.col - to.col);
  
  // Only allow adjacent cells
  if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) {
    // Simulate the swap
    const testBoard = board.map(row => row.map(cell => ({ ...cell })));
    const temp = testBoard[from.row][from.col].type;
    testBoard[from.row][from.col].type = testBoard[to.row][to.col].type;
    testBoard[to.row][to.col].type = temp;
    
    // Check if swap creates matches
    return findMatches(testBoard).length > 0;
  }
  
  return false;
};

export const swapCells = (board: Cell[][], from: { row: number; col: number }, to: { row: number; col: number }): Cell[][] => {
  const newBoard = board.map(row => [...row]);
  const temp = newBoard[from.row][from.col].type;
  newBoard[from.row][from.col].type = newBoard[to.row][to.col].type;
  newBoard[to.row][to.col].type = temp;
  return newBoard;
};

export const applyGravity = (board: Cell[][]): Cell[][] => {
  const newBoard = board.map(row => row.map(cell => ({ ...cell })));
  
  for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
    // Collect non-null cells from bottom to top
    const column: (CryptoType | null)[] = [];
    for (let row = GAME_CONFIG.BOARD_SIZE - 1; row >= 0; row--) {
      if (newBoard[row][col].type && !newBoard[row][col].isMatched) {
        column.push(newBoard[row][col].type);
      }
    }
    
    // Fill column from bottom
    for (let row = GAME_CONFIG.BOARD_SIZE - 1; row >= 0; row--) {
      const typeIndex = GAME_CONFIG.BOARD_SIZE - 1 - row;
      if (typeIndex < column.length) {
        newBoard[row][col].type = column[typeIndex];
        newBoard[row][col].isMatched = false;
      } else {
        newBoard[row][col].type = getRandomCrypto();
        newBoard[row][col].isMatched = false;
      }
    }
  }
  
  return newBoard;
};

export const calculateScore = (matches: Cell[], combo: number): number => {
  const baseScore = matches.length * GAME_CONFIG.POINTS_PER_MATCH;
  const comboBonus = Math.floor(baseScore * (Math.pow(GAME_CONFIG.COMBO_MULTIPLIER, combo) - 1));
  return baseScore + comboBonus;
};

export const hasValidMoves = (board: Cell[][]): boolean => {
  for (let row = 0; row < GAME_CONFIG.BOARD_SIZE; row++) {
    for (let col = 0; col < GAME_CONFIG.BOARD_SIZE; col++) {
      // Check right
      if (col < GAME_CONFIG.BOARD_SIZE - 1) {
        if (isValidSwap(board, { row, col }, { row, col: col + 1 })) {
          return true;
        }
      }
      // Check down
      if (row < GAME_CONFIG.BOARD_SIZE - 1) {
        if (isValidSwap(board, { row, col }, { row: row + 1, col })) {
          return true;
        }
      }
    }
  }
  return false;
};