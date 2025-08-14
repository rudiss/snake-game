import React, { useMemo } from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import { DEFAULT_BOARD_SIZE, WINNING_SCORE, POINTS_PER_FOOD } from '../constants/game';

/**
 * Props interface for the SnakeGame component
 */
interface SnakeGameProps {
  /** Optional board size override (defaults to DEFAULT_BOARD_SIZE) */
  boardSize?: number;
}

/**
 * Main Snake Game React component
 * Renders the game board, controls, and UI elements
 * Uses the useSnakeGame hook for all game logic
 * 
 * @param props - Component props
 * @returns JSX element representing the complete Snake game UI
 */
export const SnakeGame: React.FC<SnakeGameProps> = ({ boardSize = DEFAULT_BOARD_SIZE }) => {
  // Get game state and controls from custom hook
  const { gameState, startGame } = useSnakeGame(boardSize);

  /**
   * Memoized set of snake positions for O(1) lookup performance
   * Converts snake array to Set for efficient cell type checking
   * Recalculates only when snake positions change
   */
  const snakeSet = useMemo(() => {
    return new Set(gameState.snake.map(s => `${s.x},${s.y}`));
  }, [gameState.snake]);

  /**
   * Memoized snake head position key for quick comparison
   * Used to distinguish head from body segments in rendering
   */
  const headKey = useMemo(() => (
    gameState.snake[0] ? `${gameState.snake[0].x},${gameState.snake[0].y}` : ''
  ), [gameState.snake]);

  /**
   * Memoized food position key for efficient food cell identification
   */
  const foodKey = useMemo(() => `${gameState.food.x},${gameState.food.y}`, [gameState.food]);

  /**
   * Determines the CSS classes for a specific board cell
   * Uses memoized lookups for optimal performance
   * 
   * @param x - Cell x coordinate
   * @param y - Cell y coordinate
   * @returns CSS class string for the cell
   */
  const getCellClass = (x: number, y: number): string => {
    const baseClass = 'w-5 h-5 border border-gray-200';
    const key = `${x},${y}`;

    // Check cell type in order of priority
    if (key === headKey) {
      return `${baseClass} bg-green-600`; // Snake head (darker green)
    }
    if (snakeSet.has(key)) {
      return `${baseClass} bg-green-500`; // Snake body (regular green)
    }
    if (key === foodKey) {
      return `${baseClass} bg-blue-500`; // Food (blue)
    }
    return `${baseClass} bg-white`; // Empty cell (white)
  };

  /**
   * Gets the appropriate status message based on current game state
   * 
   * @returns Status message string
   */
  const getStatusMessage = (): string => {
    switch (gameState.status) {
      case 'NOT_STARTED':
        return 'Press Start to begin';
      case 'PLAYING':
        return `Score: ${gameState.score} / ${WINNING_SCORE}`;
      case 'GAME_OVER':
        return 'Game Over! You hit a wall or yourself';
      case 'WON':
        return `Congratulations! You won with ${gameState.score} points!`;
      default:
        return '';
    }
  };

  /**
   * Gets the appropriate CSS color class for status text
   * 
   * @returns CSS color class string
   */
  const getStatusColor = (): string => {
    switch (gameState.status) {
      case 'GAME_OVER':
        return 'text-red-600';   // Red for game over
      case 'WON':
        return 'text-green-600'; // Green for victory
      case 'PLAYING':
        return 'text-blue-600';  // Blue for active game
      default:
        return 'text-gray-700';  // Gray for neutral states
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Game Title */}
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">Snake Game</h1>

        {/* Score and Status Display */}
        <div className="text-center mb-4">
          {/* Current Score */}
          <div className="text-2xl font-semibold mb-2">
            Score: <span className="text-blue-600">{gameState.score}</span>
          </div>

          {/* Dynamic Status Message */}
          <div className={`text-lg font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>
        </div>

        {/* Game Board */}
        <div className="inline-block border-2 border-gray-800 bg-gray-50">
          {/* Generate board rows */}
          {Array.from({ length: boardSize }, (_, y) => (
            <div key={y} className="flex">
              {/* Generate board columns for each row */}
              {Array.from({ length: boardSize }, (_, x) => (
                <div
                  key={`${x}-${y}`}
                  className={getCellClass(x, y)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Game Controls */}
        <div className="mt-6 text-center">
          {/* Show start/restart button when game is not actively playing */}
          {(gameState.status === 'NOT_STARTED' ||
            gameState.status === 'GAME_OVER' ||
            gameState.status === 'WON') && (
              <button
                onClick={startGame}
                className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                {gameState.status === 'NOT_STARTED' ? 'Start Game' : 'Play Again'}
              </button>
            )}
        </div>

        {/* Game Instructions */}
        <div className="mt-6 text-center text-gray-600">
          <h2 className="font-semibold mb-2">How to Play:</h2>
          <ul className="text-sm space-y-1">
            <li>Use arrow keys to change direction</li>
            <li>Eat the blue food to grow and score points (+{POINTS_PER_FOOD} each)</li>
            <li>Avoid hitting walls or yourself</li>
            <li>Reach {WINNING_SCORE} points to win!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 