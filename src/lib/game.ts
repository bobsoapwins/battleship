export const GRID_SIZE = 10;

export const SHIP_TYPES = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 },
] as const;

export type ShipType = (typeof SHIP_TYPES)[number];
export type ShipName = ShipType['name'];
export type Orientation = 'horizontal' | 'vertical';

export interface Ship {
  name: ShipName;
  size: number;
  positions: { x: number; y: number }[];
  hits: { x: number; y: number }[];
  sunk: boolean;
}

export type CellType = 'empty' | 'ship' | 'hit' | 'miss';

export type Board = CellType[][];

export type Player = {
  id: 1 | 2;
  name: string;
  board: Board;
  ships: Ship[];
};

export type GamePhase = 'setup' | 'placement' | 'intermission' | 'pre-battle' | 'battle' | 'gameover';

export type ReadyStates = {
    player1: boolean;
    player2: boolean;
}

export interface GameState {
  phase: GamePhase;
  players: [Player, Player];
  currentPlayerId: 1 | 2;
  winner: Player | null;
  message: string;
  placementState: {
    playerToPlace: 1 | 2;
    shipIndex: number;
    orientation: Orientation;
  };
  isTransitioning: boolean;
  shotResult: { x: number; y: number } | null;
  readyStates: ReadyStates;
}

export const createEmptyBoard = (): Board =>
  Array(GRID_SIZE)
    .fill(null)
    .map(() => Array(GRID_SIZE).fill('empty'));

export const canPlaceShip = (
  board: Board,
  shipSize: number,
  x: number,
  y: number,
  orientation: Orientation
): boolean => {
  if (orientation === 'horizontal') {
    if (x + shipSize > GRID_SIZE) return false;
    for (let i = 0; i < shipSize; i++) {
      if (board[y][x + i] !== 'empty') return false;
    }
  } else {
    if (y + shipSize > GRID_SIZE) return false;
    for (let i = 0; i < shipSize; i++) {
      if (board[y + i][x] !== 'empty') return false;
    }
  }
  return true;
};
