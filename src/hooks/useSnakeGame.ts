import { useState, useEffect, useCallback, useRef } from 'react';
import type { Position, Direction, GameState } from '../types/game';
import {
  DEFAULT_BOARD_SIZE,
  TICK_INTERVAL,
  POINTS_PER_FOOD,
  WINNING_SCORE,
  INITIAL_SNAKE_LENGTH
} from '../constants/game';

/**
 * Creates the initial snake positioned at the center of the board
 * Snake starts moving right with the specified initial length
 * 
 * @param boardSize - The size of the game board (boardSize x boardSize)
 * @returns Array of positions representing the snake segments
 */
const getInitialSnake = (boardSize: number): Position[] => {
  const center = Math.floor(boardSize / 2);
  const snake: Position[] = [];

  // Create snake segments extending left from center
  // Head is at center, body segments extend to the left
  for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
    snake.push({ x: center - i, y: center });
  }
  return snake;
};

/**
 * Finds a random empty position on the board for food placement
 * Ensures food never spawns on top of the snake
 * 
 * @param boardSize - The size of the game board
 * @param snake - Current snake segments to avoid
 * @returns A random empty position for food
 * @throws Error if no empty positions are available (board full)
 */
const getRandomEmptyPosition = (boardSize: number, snake: Position[]): Position => {
  // Create a set of occupied positions for O(1) lookup
  const occupied = new Set(snake.map(s => `${s.x},${s.y}`));
  const available: Position[] = [];

  // Find all empty positions on the board
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

  // Return random empty position
  const randomIndex = Math.floor(Math.random() * available.length);
  return available[randomIndex];
};

/**
 * Calculates the next position based on current position and direction
 * 
 * @param head - Current head position
 * @param direction - Direction to move
 * @returns New position after moving in the specified direction
 */
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
      // Defensive programming: return current position if invalid direction
      return head;
  }
};

/**
 * Checks if two directions are opposite to each other
 * Used to prevent the snake from immediately reversing direction
 * 
 * @param dir1 - First direction
 * @param dir2 - Second direction
 * @returns True if directions are opposite
 */
const isOppositeDirection = (dir1: Direction, dir2: Direction): boolean => {
  return (
    (dir1 === 'UP' && dir2 === 'DOWN') ||
    (dir1 === 'DOWN' && dir2 === 'UP') ||
    (dir1 === 'LEFT' && dir2 === 'RIGHT') ||
    (dir1 === 'RIGHT' && dir2 === 'LEFT')
  );
};

/**
 * Custom hook that manages the Snake game state and logic
 * Handles game initialization, movement, collision detection, scoring, and input
 * 
 * @param boardSize - Size of the game board (default: DEFAULT_BOARD_SIZE)
 * @returns Object containing game state and control functions
 */
export const useSnakeGame = (boardSize: number = DEFAULT_BOARD_SIZE) => {
  // Main game state - contains all game data
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialSnake = getInitialSnake(boardSize);
    return {
      snake: initialSnake,
      direction: 'RIGHT', // Snake starts moving right
      nextDirection: null, // Queued direction change
      food: getRandomEmptyPosition(boardSize, initialSnake),
      score: 0,
      status: 'NOT_STARTED',
      boardSize
    };
  });

  const gameLoopRef = useRef<number | null>(null);

  /**
   * Starts or restarts the game
   * Resets all game state to initial values and begins the game loop
   */
  const startGame = useCallback(() => {
    const initialSnake = getInitialSnake(boardSize);
    setGameState({
      snake: initialSnake,
      direction: 'RIGHT',
      nextDirection: null,
      food: getRandomEmptyPosition(boardSize, initialSnake),
      score: 0,
      status: 'PLAYING', // This triggers the game loop
      boardSize
    });
  }, [boardSize]);

  /**
   * Changes the snake's direction
   * Uses direction queuing to prevent invalid moves and ensure smooth gameplay
   * 
   * @param newDirection - The new direction to move
   */
  const changeDirection = useCallback((newDirection: Direction) => {
    setGameState(prev => {
      // Only allow direction changes during gameplay
      if (prev.status !== 'PLAYING') return prev;

      // Get the most recent intended direction (queued or current)
      const lastDirection = prev.nextDirection || prev.direction;

      // Prevent opposite direction changes to avoid immediate collision
      if (isOppositeDirection(lastDirection, newDirection)) {
        return prev;
      }

      // Queue the direction change for the next game tick
      // This ensures smooth movement and prevents rapid direction changes
      return { ...prev, nextDirection: newDirection };
    });
  }, []);

  /**
   * Main game logic function - moves the snake and handles all game mechanics
   * Called every TICK_INTERVAL milliseconds during gameplay
   */
  const moveSnake = useCallback(() => {
    setGameState(prev => {
      // Only move during active gameplay
      if (prev.status !== 'PLAYING') return prev;

      // Apply any queued direction change
      const currentDirection = prev.nextDirection || prev.direction;
      const newState = { ...prev, direction: currentDirection, nextDirection: null };

      // Calculate new head position
      const head = prev.snake[0];
      const newHead = getNextPosition(head, currentDirection);

      // Check for wall collision
      if (
        newHead.x < 0 || newHead.x >= boardSize ||
        newHead.y < 0 || newHead.y >= boardSize
      ) {
        return { ...newState, status: 'GAME_OVER' };
      }

      // Check food collision first (needed for proper self-collision logic)
      const ateFood = newHead.x === prev.food.x && newHead.y === prev.food.y;

      // Check self collision
      // If food was eaten, check against full body; otherwise exclude tail
      // (since tail will move away, allowing movement into previous tail position)
      const bodyToCheck = ateFood ? prev.snake : prev.snake.slice(0, -1);
      const selfCollision = bodyToCheck.some(
        segment => segment.x === newHead.x && segment.y === newHead.y
      );
      if (selfCollision) {
        return { ...newState, status: 'GAME_OVER' };
      }

      // Create new snake with new head
      const newSnake = [newHead, ...prev.snake];
      if (!ateFood) {
        newSnake.pop(); // Remove tail if no food eaten (maintains length)
      }

      let newScore = prev.score;
      let newFood = prev.food;

      // Handle food consumption
      if (ateFood) {
        newScore += POINTS_PER_FOOD;

        // Check win condition
        if (newScore >= WINNING_SCORE) {
          return { ...newState, snake: newSnake, score: newScore, status: 'WON' };
        }

        // Spawn new food in empty location
        try {
          newFood = getRandomEmptyPosition(boardSize, newSnake);
        } catch {
          // Board is completely full - player wins
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

  useEffect(() => {
    /**
     * Handles keyboard input for snake direction control
     * Maps arrow keys to direction changes and prevents default browser behavior
     */
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

    // Cleanup listener on unmount
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [changeDirection]);

  useEffect(() => {
    // Start game loop when status changes to PLAYING
    if (gameState.status === 'PLAYING') {
      gameLoopRef.current = setInterval(moveSnake, TICK_INTERVAL);

      // Cleanup interval when effect re-runs or component unmounts
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
    // Note: Interval automatically clears when status changes from PLAYING
  }, [gameState.status, moveSnake]);

  return {
    gameState,
    startGame,
    changeDirection
  };
}; 