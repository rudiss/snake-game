export type Position = {
  x: number;
  y: number;
};

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameStatus = 'NOT_STARTED' | 'PLAYING' | 'GAME_OVER' | 'WON';

export type GameState = {
  snake: Position[];
  direction: Direction;
  nextDirection: Direction | null;
  food: Position;
  score: number;
  status: GameStatus;
  boardSize: number;
}; 