'use client';

import { useState, useCallback } from 'react';
import type {
  GameState,
  Player,
  Ship,
} from '@/lib/game';
import {
  SHIP_TYPES,
  createEmptyBoard,
  canPlaceShip,
} from '@/lib/game';

const initialPlayer = (id: 1 | 2): Player => ({
  id,
  name: `Player ${id}`,
  board: createEmptyBoard(),
  ships: [],
});

const getInitialState = (): GameState => ({
  phase: 'placement',
  players: [initialPlayer(1), initialPlayer(2)],
  currentPlayerId: 1,
  winner: null,
  message: 'Player 1, place your fleet.',
  placementState: {
    playerToPlace: 1,
    shipIndex: 0,
    orientation: 'horizontal',
  },
  isTransitioning: false,
  shotResult: null,
});

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialState);

  const resetGame = useCallback(() => {
    setGameState(getInitialState());
  }, []);

  const toggleOrientation = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      placementState: {
        ...prev.placementState,
        orientation:
          prev.placementState.orientation === 'horizontal'
            ? 'vertical'
            : 'horizontal',
      },
    }));
  }, []);

  const placeShip = useCallback((x: number, y: number) => {
    setGameState((prev) => {
      if (prev.phase !== 'placement') return prev;

      const { playerToPlace, shipIndex, orientation } = prev.placementState;
      const player = prev.players[playerToPlace - 1];
      const shipType = SHIP_TYPES[shipIndex];

      if (!shipType || !canPlaceShip(player.board, shipType.size, x, y, orientation)) {
        return { ...prev, message: "Cannot place ship here. Try another location." };
      }

      const newBoard = player.board.map((row) => [...row]);
      const newShip: Ship = {
        name: shipType.name,
        size: shipType.size,
        positions: [],
        hits: [],
        sunk: false,
      };

      for (let i = 0; i < shipType.size; i++) {
        if (orientation === 'horizontal') {
          newBoard[y][x + i] = 'ship';
          newShip.positions.push({ x: x + i, y });
        } else {
          newBoard[y + i][x] = 'ship';
          newShip.positions.push({ x, y: y + i });
        }
      }

      const newPlayer: Player = {
        ...player,
        board: newBoard,
        ships: [...player.ships, newShip],
      };
      
      const newPlayers: [Player, Player] = [...prev.players];
      newPlayers[playerToPlace - 1] = newPlayer;

      const nextShipIndex = shipIndex + 1;

      if (nextShipIndex < SHIP_TYPES.length) {
        return {
          ...prev,
          players: newPlayers,
          placementState: { ...prev.placementState, shipIndex: nextShipIndex },
          message: `${player.name}, place your ${SHIP_TYPES[nextShipIndex].name}.`,
        };
      } else {
        if (playerToPlace === 1) {
          return {
            ...prev,
            players: newPlayers,
            phase: 'intermission',
            message: "Player 1's fleet is ready. Pass to Player 2.",
          };
        } else {
          return {
            ...prev,
            players: newPlayers,
            phase: 'battle',
            currentPlayerId: 1,
            message: 'All fleets are ready! Player 1, your turn to fire.',
          };
        }
      }
    });
  }, []);

  const startNextPlacement = useCallback(() => {
    setGameState((prev) => {
        if (prev.phase !== 'intermission') return prev;
        return {
            ...prev,
            phase: 'placement',
            placementState: {
                playerToPlace: 2,
                shipIndex: 0,
                orientation: 'horizontal',
            },
            message: `Player 2, place your fleet.`,
        }
    })
  }, []);

  const handleFire = useCallback((x: number, y: number) => {
    setGameState((prev) => {
      if (prev.phase !== 'battle' || prev.isTransitioning) return prev;

      const { currentPlayerId, players } = prev;
      const opponentId = currentPlayerId === 1 ? 2 : 1;
      const opponent = players[opponentId - 1];

      if (opponent.board[y][x] === 'hit' || opponent.board[y][x] === 'miss') {
        return { ...prev, message: "You've already fired at this location." };
      }

      const newOpponentBoard = opponent.board.map(row => [...row]);
      let resultMessage = '';
      let newOpponentShips = [...opponent.ships];
      let hitShip = false;

      if (opponent.board[y][x] === 'ship') {
        newOpponentBoard[y][x] = 'hit';
        hitShip = true;
        let allShipsSunk = true;

        newOpponentShips = opponent.ships.map(ship => {
            const isHit = ship.positions.some(p => p.x === x && p.y === y);
            if (isHit) {
                const newHits = [...ship.hits, {x, y}];
                const sunk = newHits.length === ship.size;
                if(sunk) {
                    resultMessage = `You sunk their ${ship.name}!`;
                } else {
                    resultMessage = "It's a HIT!";
                }
                return { ...ship, hits: newHits, sunk };
            }
            return ship;
        });

        allShipsSunk = newOpponentShips.every(ship => ship.sunk);

        if (allShipsSunk) {
            return {
                ...prev,
                phase: 'gameover',
                winner: players[currentPlayerId - 1],
                message: `Game Over! ${players[currentPlayerId - 1].name} wins!`,
                isTransitioning: false,
                shotResult: { x, y },
            };
        }
      } else {
        newOpponentBoard[y][x] = 'miss';
        resultMessage = "It's a MISS!";
      }

      const newOpponent: Player = { ...opponent, board: newOpponentBoard, ships: newOpponentShips };
      const newPlayers: [Player, Player] = [...players];
      newPlayers[opponentId-1] = newOpponent;
      
      setTimeout(() => {
        setGameState(currentGameState => {
            if (currentGameState.phase !== 'battle' || !currentGameState.isTransitioning) return currentGameState;
            const nextPlayerId = currentGameState.currentPlayerId === 1 ? 2 : 1;
            const nextPlayer = currentGameState.players[nextPlayerId - 1];
            return {
                ...currentGameState,
                isTransitioning: false,
                shotResult: null,
                currentPlayerId: nextPlayerId,
                message: `${nextPlayer.name}, your turn.`
            }
        });
      }, 1500);

      return {
        ...prev,
        players: newPlayers,
        isTransitioning: true,
        shotResult: { x, y },
        message: resultMessage,
      };
    });
  }, []);

  return { gameState, placeShip, handleFire, resetGame, toggleOrientation, startNextPlacement };
};
