import { useState, useEffect, useCallback, useRef } from 'react';
import type { Position, Direction, GameState } from '../types/game';
import {
  DEFAULT_BOARD_SIZE,
  TICK_INTERVAL,
  POINTS_PER_FOOD,
  WINNING_SCORE,
  INITIAL_SNAKE_LENGTH
} from '../constants/game';

const getInitialSnake = (boardSize: number): Position[] => {
  const center = Math.floor(boardSize / 2);
  const snake: Position[] = [];
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: center - i, y: center });
  }
  return snake;
};

const getRandomEmptyPosition = (boardSize: number, snake: Position[]): Position => {
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
  const available: Position[] = [];

  for (let x = 0; x < boardSize; x++) {
    for (let y = 0; y < boardSize; y++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    throw new Error('No empty positions available');
  }

  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
};

const getNextPosition = (head: Position, direction: Direction): Position => {
  switch (direction) {
    case 'UP':
      return { x: head.x, y: head.y - 1 };
    case 'DOWN':
      return { x: head.x, y: head.y + 1 };
    case 'LEFT':
      return { x: head.x - 1, y: head.y };
    case 'RIGHT':
      return { x: head.x + 1, y: head.y };
    default:
      return head;
  }
};

const isOppositeDirection = (dir1: Direction, dir2: Direction): boolean => {
  return (
    (dir1 === 'UP' && dir2 === 'DOWN') ||
    (dir1 === 'DOWN' && dir2 === 'UP') ||
    (dir1 === 'LEFT' && dir2 === 'RIGHT') ||
    (dir1 === 'RIGHT' && dir2 === 'LEFT')
  );
};

export const useSnakeGame = (boardSize: number = DEFAULT_BOARD_SIZE) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialSnake = getInitialSnake(boardSize);
    return {
      snake: initialSnake,
      direction: 'RIGHT',
      nextDirection: null,
      food: getRandomEmptyPosition(boardSize, initialSnake),
      score: 0,
      status: 'NOT_STARTED',
      boardSize
    };
  });

  const gameLoopRef = useRef<number | null>(null);

  const startGame = useCallback(() => {
    const initialSnake = getInitialSnake(boardSize);
    setGameState({
      snake: initialSnake,
      direction: 'RIGHT',
      nextDirection: null,
      food: getRandomEmptyPosition(boardSize, initialSnake),
      score: 0,
      status: 'PLAYING',
      boardSize
    });
  }, [boardSize]);

  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState(prev => {
      if (prev.status !== 'PLAYING') return prev;

      const lastDirection = prev.nextDirection || prev.direction;
      // Prevent opposite direction changes relative to the most recent intent
      if (isOppositeDirection(lastDirection, newDirection)) {
        return prev;
      }

      // Queue the direction change for the next tick
      return { ...prev, nextDirection: newDirection };
    });
  }, []);

  const moveSnake = useCallback(() => {
    setGameState(prev => {
      if (prev.status !== 'PLAYING') return prev;

      // Apply queued direction change
      const currentDirection = prev.nextDirection || prev.direction;
      const newState = { ...prev, direction: currentDirection, nextDirection: null };

      const head = prev.snake[0];
      const newHead = getNextPosition(head, currentDirection);

      // Check wall collision
      if (
        newHead.x < 0 || newHead.x >= boardSize ||
        newHead.y < 0 || newHead.y >= boardSize
      ) {
        return { ...newState, status: 'GAME_OVER' };
      }

      // Check food collision (needed before self-collision to allow moving into the tail when it moves)
      const ateFood = newHead.x === prev.food.x && newHead.y === prev.food.y;

      // Check self collision
      const bodyToCheck = ateFood ? prev.snake : prev.snake.slice(0, -1);
      const selfCollision = bodyToCheck.some(
        segment => segment.x === newHead.x && segment.y === newHead.y
      );
      if (selfCollision) {
        return { ...newState, status: 'GAME_OVER' };
      }

      const newSnake = [newHead, ...prev.snake];
      if (!ateFood) {
        newSnake.pop(); // Remove tail if no food eaten
      }

      let newScore = prev.score;
      let newFood = prev.food;

      if (ateFood) {
        newScore += POINTS_PER_FOOD;

        // Check win condition
        if (newScore >= WINNING_SCORE) {
          return { ...newState, snake: newSnake, score: newScore, status: 'WON' };
        }

        // Spawn new food
        try {
          newFood = getRandomEmptyPosition(boardSize, newSnake);
        } catch {
          // Board is full, game won
          return { ...newState, snake: newSnake, score: newScore, status: 'WON' };
        }
      }

      return {
        ...newState,
        snake: newSnake,
        food: newFood,
        score: newScore
      };
    });
  }, [boardSize]);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          changeDirection('UP');
          break;
        case 'ArrowDown':
          e.preventDefault();
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
          e.preventDefault();
          changeDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [changeDirection]);

  // Game loop
  useEffect(() => {
    if (gameState.status === 'PLAYING') {
      gameLoopRef.current = setInterval(moveSnake, TICK_INTERVAL);
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [gameState.status, moveSnake]);

  return {
    gameState,
    startGame,
    changeDirection
  };
}; 