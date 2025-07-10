
export const GRID_SIZE = 10;

export const SHIP_TYPES = [
  { name: 'Carrier', size: 5 },
  { name: 'Battleship', size: 4 },
  { name: 'Cruiser', size: 3 },
  { name: 'Submarine', size: 3 },
  { name: 'Destroyer', size: 2 },
] as const;

export type Point = { x: number; y: number };

export type ShipType = (typeof SHIP_TYPES)[number];
export type ShipName = ShipType['name'];
export type Orientation = 'horizontal' | 'vertical';
export type GameMode = 'classic' | 'salvo' | 'nuclear' | 'electronic';

export interface Ship {
  name: ShipName;
  size: number;
  positions: Point[];
  hits: Point[];
  sunk: boolean;
}

export type CellType = 'empty' | 'ship' | 'hit' | 'miss';

export type Board = CellType[][];

export type PlayerStats = {
    shotsFired: number;
    hits: number;
    misses: number;
}

export type Player = {
  id: 1 | 2;
  name: string;
  board: Board;
  ships: Ship[];
  stats: PlayerStats;
};

export type GamePhase = 'setup' | 'placement' | 'intermission' | 'pre-battle' | 'battle' | 'gameover';

export type ReadyStates = {
    player1: boolean;
    player2: boolean;
}

export interface PlacementState {
    playerToPlace: 1 | 2;
    shipIndex: number;
    orientation: Orientation;
    placementComplete: boolean;
}

export interface GameState {
  phase: GamePhase;
  gameMode: GameMode;
  players: [Player, Player];
  currentPlayerId: 1 | 2;
  winner: Player | null;
  message: string;
  placementState: PlacementState;
  isTransitioning: boolean;
  shotResult: Point | null;
  readyStates: ReadyStates;
  shotsRemaining: number;
  scannedArea: Point[] | null;
  isScanning: boolean;
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
