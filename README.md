# Snake Game

A classic Snake game implementation built with React, TypeScript, and Tailwind CSS.

## 🎮 Live Demo

<https://snake-game-two-gilt.vercel.app/>

## Requirements Fulfilled

**Core Requirements:**

- React 18+ with functional components and hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Comprehensive unit tests with Vitest
- Keyboard controls (arrow keys)
- Configurable board size (default 20×20)

**Game Mechanics:**

- Snake moves automatically every 150ms
- Arrow keys change direction (not immediate movement)
- Snake grows by 1 segment when eating food
- Food (blue) gives +3 points
- Score displayed on screen
- Game ends on: wall collision, self collision, or reaching 30 points

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd snake-game
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to:

```
http://localhost:5173
```

### Running Tests

Run all tests:

```bash
npm test
```

Run tests with UI:

```bash
npm run test:ui
```

Run tests with coverage:

```bash
npm run test:coverage
```

## How to Play

1. Click "Start Game" to begin
2. Use arrow keys to control the snake's direction:
   - ⬆️ Arrow Up: Move up
   - ⬇️ Arrow Down: Move down
   - ⬅️ Arrow Left: Move left
   - ➡️ Arrow Right: Move right
3. Eat the blue food to grow and score points (+3 each)
4. Avoid hitting walls or yourself
5. Reach 30 points to win!

## 🏗️ Project Structure

```
src/
├── components/
│   └── SnakeGame.tsx       # Main game component
├── hooks/
│   └── useSnakeGame.ts     # Game logic hook
├── types/
│   └── game.ts             # TypeScript type definitions
├── constants/
│   └── game.ts             # Game configuration constants
└── App.tsx                 # Root component
```

## 🔧 Configuration

The game is easily configurable through constants in `src/constants/game.ts`:

```typescript
export const DEFAULT_BOARD_SIZE = 20;  // Board dimensions
export const TICK_INTERVAL = 150;      // Game speed (ms)
export const POINTS_PER_FOOD = 3;      // Points per food eaten
export const WINNING_SCORE = 30;       // Score needed to win
export const INITIAL_SNAKE_LENGTH = 3; // Starting snake length
```

### Changing Board Size

You can easily change the board size by passing a prop to the `SnakeGame` component:

```tsx
<SnakeGame boardSize={30} />  // 30×30 board
```

## 🛠️ Technical Implementation

### Architecture Decisions

1. **Custom Hook Pattern (`useSnakeGame`)**:
   - Separates game logic from presentation
   - Makes testing easier
   - Reusable and maintainable

2. **State Management**:
   - Single state object for all game data
   - Immutable state updates using React's functional updates
   - Direction queueing to prevent invalid moves

3. **Game Loop**:
   - Uses `setInterval` for consistent timing
   - Automatically cleans up on unmount
   - Pauses when game ends

4. **Collision Detection**:
   - Wall collision: Checks if snake head is outside board boundaries
   - Self collision: Checks if head position matches any body segment
   - Food collision: Simple coordinate comparison

5. **Food Spawning**:
   - Random placement on empty cells
   - Ensures food never spawns on snake

### Performance Optimizations

- Memoized callbacks with `useCallback` to prevent unnecessary re-renders
- Efficient collision detection using coordinate comparison
- Single interval timer for game loop

### Testing Strategy

- **Unit Tests**: Comprehensive tests for game logic hook
- **Component Tests**: UI rendering and interaction tests
- **Coverage**: Movement, collision, scoring, game states

## 📝 Assumptions Made

1. **Game Speed**: Fixed at 150ms per tick for balanced gameplay
2. **Snake Start Position**: Always starts in the center moving right
3. **Food Color**: Blue as specified in requirements
4. **Snake Color**: Green for visibility (head is darker)
5. **Board Style**: Grid with visible cell borders for clarity
6. **No Wrap-Around**: Snake cannot move through walls to opposite side

---
