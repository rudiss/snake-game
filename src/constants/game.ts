/**
 * Game Configuration Constants
 * 
 * These constants control the core game mechanics and can be easily
 * modified to adjust gameplay difficulty and behavior.
 */

/** Default size of the game board (creates a 20x20 grid) */
export const DEFAULT_BOARD_SIZE = 20;

/** Game tick interval in milliseconds - controls snake movement speed */
export const TICK_INTERVAL = 150; // milliseconds

/** Points awarded for eating each piece of food */
export const POINTS_PER_FOOD = 3;

/** Score required to win the game */
export const WINNING_SCORE = 30;

/** Initial length of the snake when game starts */
export const INITIAL_SNAKE_LENGTH = 3;

/** Cell size in pixels for rendering (currently unused but available for future enhancements) */
export const CELL_SIZE = 20; // pixels for rendering 