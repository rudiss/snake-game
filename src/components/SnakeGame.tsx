import React, { useMemo } from 'react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import { DEFAULT_BOARD_SIZE, WINNING_SCORE } from '../constants/game';

interface SnakeGameProps {
  boardSize?: number;
}

export const SnakeGame: React.FC<SnakeGameProps> = ({ boardSize = DEFAULT_BOARD_SIZE }) => {
  const { gameState, startGame } = useSnakeGame(boardSize);

  const snakeSet = useMemo(() => {
    return new Set(gameState.snake.map(s => `${s.x},${s.y}`));
  }, [gameState.snake]);

  const headKey = useMemo(() => (gameState.snake[0] ? `${gameState.snake[0].x},${gameState.snake[0].y}` : ''), [gameState.snake]);
  const foodKey = useMemo(() => `${gameState.food.x},${gameState.food.y}`, [gameState.food]);

  const getCellClass = (x: number, y: number): string => {
    const baseClass = 'w-5 h-5 border border-gray-200';
    const key = `${x},${y}`;

    if (key === headKey) {
      return `${baseClass} bg-green-600`;
    }
    if (snakeSet.has(key)) {
      return `${baseClass} bg-green-500`;
    }
    if (key === foodKey) {
      return `${baseClass} bg-blue-500`;
    }
    return `${baseClass} bg-white`;
  };

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

  const getStatusColor = (): string => {
    switch (gameState.status) {
      case 'GAME_OVER':
        return 'text-red-600';
      case 'WON':
        return 'text-green-600';
      case 'PLAYING':
        return 'text-blue-600';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-center mb-4 text-gray-800">Snake Game</h1>

        {/* Score and Status */}
        <div className="text-center mb-4">
          <div className="text-2xl font-semibold mb-2">
            Score: <span className="text-blue-600">{gameState.score}</span>
          </div>
          <div className={`text-lg font-medium ${getStatusColor()}`}>
            {getStatusMessage()}
          </div>
        </div>

        {/* Game Board */}
        <div className="inline-block border-2 border-gray-800 bg-gray-50">
          {Array.from({ length: boardSize }, (_, y) => (
            <div key={y} className="flex">
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
          {(gameState.status === 'NOT_STARTED' || gameState.status === 'GAME_OVER' || gameState.status === 'WON') && (
            <button
              onClick={startGame}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              {gameState.status === 'NOT_STARTED' ? 'Start Game' : 'Play Again'}
            </button>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center text-gray-600">
          <h2 className="font-semibold mb-2">How to Play:</h2>
          <ul className="text-sm space-y-1">
            <li>Use arrow keys to change direction</li>
            <li>Eat the blue food to grow and score points (+3 each)</li>
            <li>Avoid hitting walls or yourself</li>
            <li>Reach {WINNING_SCORE} points to win!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}; 