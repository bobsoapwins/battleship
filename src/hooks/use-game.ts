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
  phase: 'setup',
  players: [initialPlayer(1), initialPlayer(2)],
  currentPlayerId: 1,
  winner: null,
  message: 'Welcome! Set player names to begin.',
  placementState: {
    playerToPlace: 1,
    shipIndex: 0,
    orientation: 'horizontal',
  },
  isTransitioning: false,
  shotResult: null,
  readyStates: {
      player1: false,
      player2: false,
  }
});

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialState);

  const resetGame = useCallback(() => {
    setGameState(getInitialState());
  }, []);

  const setPlayerNames = useCallback((player1Name: string, player2Name: string) => {
    setGameState(prev => {
        if (prev.phase !== 'setup') return prev;

        const newPlayers: [Player, Player] = [
            {...prev.players[0], name: player1Name },
            {...prev.players[1], name: player2Name }
        ];

        return {
            ...prev,
            players: newPlayers,
            phase: 'placement',
            message: `${newPlayers[0].name}, place your fleet.`
        }
    });
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
            message: `${newPlayer.name}'s fleet is ready. Pass to ${newPlayers[1].name}.`,
          };
        } else {
          return {
            ...prev,
            players: newPlayers,
            phase: 'pre-battle',
            message: 'All fleets are placed. Ready for battle!',
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
            message: `${prev.players[1].name}, place your fleet.`,
        }
    })
  }, []);

  const togglePlayerReady = useCallback((playerId: 1 | 2) => {
    setGameState(prev => {
        if (prev.phase !== 'pre-battle') return prev;
        const key = `player${playerId}` as keyof typeof prev.readyStates;
        return {
            ...prev,
            readyStates: {
                ...prev.readyStates,
                [key]: !prev.readyStates[key],
            }
        }
    })
  }, []);

  const startBattle = useCallback(() => {
    setGameState(prev => {
        if(prev.phase !== 'pre-battle' || !prev.readyStates.player1 || !prev.readyStates.player2) return prev;
        return {
            ...prev,
            phase: 'battle',
            currentPlayerId: 1,
            isTransitioning: true, // Start in transition to hide board
            message: `Hand device to ${prev.players[0].name}. Press continue to start your turn.`
        }
    })
  }, []);

  const confirmShotAndSwitchTurn = useCallback(() => {
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
                    resultMessage = `Opponent's ${ship.name} was sunk.`;
                } else {
                    resultMessage = "Hit confirmed.";
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
                message: `Game Over. ${players[currentPlayerId - 1].name} is the winner.`,
                isTransitioning: false,
                shotResult: { x, y },
            };
        }
      } else {
        newOpponentBoard[y][x] = 'miss';
        resultMessage = "Shot missed.";
      }

      const newOpponent: Player = { ...opponent, board: newOpponentBoard, ships: newOpponentShips };
      const newPlayers: [Player, Player] = [...players];
      newPlayers[opponentId-1] = newOpponent;
      
      return {
        ...prev,
        players: newPlayers,
        isTransitioning: true,
        shotResult: { x, y },
        message: resultMessage,
      };
    });
  }, []);

  return { gameState, setPlayerNames, placeShip, handleFire, resetGame, toggleOrientation, startNextPlacement, confirmShotAndSwitchTurn, togglePlayerReady, startBattle };
};
