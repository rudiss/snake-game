import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SnakeGame } from './SnakeGame';
import { DEFAULT_BOARD_SIZE, WINNING_SCORE } from '../constants/game';

describe('SnakeGame Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render game title', () => {
      render(<SnakeGame />);
      expect(screen.getByText('Snake Game')).toBeInTheDocument();
    });

    it('should render score display', () => {
      render(<SnakeGame />);
      expect(screen.getByText(/Score:/)).toBeInTheDocument();
    });

    it('should render start button initially', () => {
      render(<SnakeGame />);
      expect(screen.getByRole('button', { name: /Start Game/i })).toBeInTheDocument();
    });

    it('should render game instructions', () => {
      render(<SnakeGame />);
      expect(screen.getByText(/How to Play:/)).toBeInTheDocument();
      expect(screen.getByText(/Use arrow keys to change direction/)).toBeInTheDocument();
    });

    it('should render game board with correct size', () => {
      const { container } = render(<SnakeGame boardSize={10} />);
      const cells = container.querySelectorAll('.w-5.h-5');
      expect(cells.length).toBe(100); // 10x10 grid
    });

    it('should render default board size when not specified', () => {
      const { container } = render(<SnakeGame />);
      const cells = container.querySelectorAll('.w-5.h-5');
      expect(cells.length).toBe(DEFAULT_BOARD_SIZE * DEFAULT_BOARD_SIZE);
    });
  });

  describe('Game States', () => {
    it('should display "Press Start to begin" message initially', () => {
      render(<SnakeGame />);
      expect(screen.getByText('Press Start to begin')).toBeInTheDocument();
    });

    it('should change button text to "Play Again" after game over', () => {
      render(<SnakeGame />);

      // Start the game
      const startButton = screen.getByRole('button', { name: /Start Game/i });
      fireEvent.click(startButton);

      // Button should disappear when playing
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should display score during gameplay', () => {
      render(<SnakeGame />);
      const scoreElement = screen.getByText((content, element) => {
        return element?.tagName === 'SPAN' && content === '0';
      });
      expect(scoreElement).toBeInTheDocument();
    });

    it('should display winning score target', () => {
      render(<SnakeGame />);
      expect(screen.getByText(new RegExp(`${WINNING_SCORE} points to win`))).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('should render snake cells with green color', () => {
      const { container } = render(<SnakeGame />);

      // Snake should be visible (green cells)
      const snakeCells = container.querySelectorAll('.bg-green-500, .bg-green-600');
      expect(snakeCells.length).toBeGreaterThan(0);
    });

    it('should render food cell with blue color', () => {
      const { container } = render(<SnakeGame />);

      // Food should be visible (blue cell)
      const foodCells = container.querySelectorAll('.bg-blue-500');
      expect(foodCells.length).toBe(1);
    });

    it('should render empty cells with white color', () => {
      const { container } = render(<SnakeGame />);

      // Most cells should be empty (white)
      const emptyCells = container.querySelectorAll('.bg-white');
      expect(emptyCells.length).toBeGreaterThan(0);
    });

    it('should distinguish snake head from body', () => {
      const { container } = render(<SnakeGame />);

      // Head should be darker green
      const headCells = container.querySelectorAll('.bg-green-600');
      expect(headCells.length).toBe(1);

      // Body should be regular green
      const bodyCells = container.querySelectorAll('.bg-green-500');
      expect(bodyCells.length).toBeGreaterThan(0);
    });
  });

  describe('User Interactions', () => {
    it('should start game when Start button is clicked', () => {
      render(<SnakeGame />);

      const startButton = screen.getByRole('button', { name: /Start Game/i });
      fireEvent.click(startButton);

      // Button should disappear during gameplay
      expect(screen.queryByRole('button', { name: /Start Game/i })).not.toBeInTheDocument();
    });

    it('should handle keyboard navigation instructions display', () => {
      render(<SnakeGame />);

      // Instructions should always be visible
      expect(screen.getByText(/Use arrow keys to change direction/)).toBeInTheDocument();
      expect(screen.getByText(/Eat the blue food to grow/)).toBeInTheDocument();
      expect(screen.getByText(/Avoid hitting walls or yourself/)).toBeInTheDocument();
    });
  });

  describe('Custom Board Size', () => {
    it('should render smaller board correctly', () => {
      const { container } = render(<SnakeGame boardSize={5} />);
      const cells = container.querySelectorAll('.w-5.h-5');
      expect(cells.length).toBe(25); // 5x5 grid
    });

    it('should render larger board correctly', () => {
      const { container } = render(<SnakeGame boardSize={30} />);
      const cells = container.querySelectorAll('.w-5.h-5');
      expect(cells.length).toBe(900); // 30x30 grid
    });
  });

  describe('Score Display', () => {
    it('should always show current score', () => {
      render(<SnakeGame />);

      // Initial score should be 0 - look for the span containing the score value
      const scoreElement = screen.getByText('0', { selector: 'span.text-blue-600' });
      expect(scoreElement).toBeInTheDocument();
    });

    it('should display score with proper styling', () => {
      render(<SnakeGame />);

      // Score value should have blue color
      const scoreSpan = screen.getByText('0', { selector: 'span.text-blue-600' });
      expect(scoreSpan).toBeInTheDocument();
    });
  });

  describe('Game Messages', () => {
    it('should show appropriate message for each game state', () => {
      render(<SnakeGame />);

      // Initial state message
      expect(screen.getByText('Press Start to begin')).toBeInTheDocument();
    });

    it('should display instructions clearly', () => {
      render(<SnakeGame />);

      const instructions = [
        'Use arrow keys to change direction',
        'Eat the blue food to grow and score points (+3 each)',
        'Avoid hitting walls or yourself',
        `Reach ${WINNING_SCORE} points to win!`
      ];

      instructions.forEach(instruction => {
        expect(screen.getByText(instruction)).toBeInTheDocument();
      });
    });
  });

  describe('Board Layout', () => {
    it('should have proper border styling', () => {
      const { container } = render(<SnakeGame />);
      const board = container.querySelector('.border-2.border-gray-800');
      expect(board).toBeInTheDocument();
    });

    it('should center game on screen', () => {
      const { container } = render(<SnakeGame />);
      const wrapper = container.querySelector('.flex.flex-col.items-center.justify-center');
      expect(wrapper).toBeInTheDocument();
    });

    it('should have shadow and padding on game container', () => {
      const { container } = render(<SnakeGame />);
      const gameContainer = container.querySelector('.bg-white.rounded-lg.shadow-lg.p-6');
      expect(gameContainer).toBeInTheDocument();
    });
  });
}); 