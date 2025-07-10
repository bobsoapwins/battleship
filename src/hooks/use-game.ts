
'use client';

import { useState, useCallback } from 'react';
import type {
  GameState,
  Player,
  Ship,
  PlayerStats,
  GameMode,
} from '@/lib/game';
import {
  SHIP_TYPES,
  createEmptyBoard,
  canPlaceShip,
} from '@/lib/game';

const initialStats = (): PlayerStats => ({
    shotsFired: 0,
    hits: 0,
    misses: 0,
});

const initialPlayer = (id: 1 | 2): Player => ({
  id,
  name: `Player ${id}`,
  board: createEmptyBoard(),
  ships: [],
  stats: initialStats(),
});

const getInitialState = (): GameState => ({
  phase: 'setup',
  gameMode: 'classic',
  players: [initialPlayer(1), initialPlayer(2)],
  currentPlayerId: 1,
  winner: null,
  message: 'Welcome! Set player names to begin.',
  placementState: {
    playerToPlace: 1,
    shipIndex: 0,
    orientation: 'horizontal',
    placementComplete: false,
  },
  isTransitioning: false,
  shotResult: null,
  readyStates: {
      player1: false,
      player2: false,
  },
  shotsRemaining: 1,
});

export const useGame = () => {
  const [gameState, setGameState] = useState<GameState>(getInitialState);

  const resetGame = useCallback(() => {
    setGameState(getInitialState());
  }, []);

  const setPlayerNames = useCallback((player1Name: string, player2Name: string, gameMode: GameMode) => {
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
            gameMode: gameMode,
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
      if (prev.phase !== 'placement' || prev.placementState.placementComplete) return prev;

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
        // Last ship is placed, mark as complete but don't change phase yet
        return {
          ...prev,
          players: newPlayers,
          placementState: {
            ...prev.placementState,
            shipIndex: nextShipIndex,
            placementComplete: true,
          },
          message: `${newPlayer.name}'s fleet is ready.`,
        };
      }
    });
  }, []);

  const endPlacement = useCallback(() => {
    setGameState(prev => {
        if (prev.phase !== 'placement' || !prev.placementState.placementComplete) return prev;
        
        const { playerToPlace } = prev.placementState;
        
        if (playerToPlace === 1) {
          return {
            ...prev,
            phase: 'intermission',
            message: `${prev.players[0].name}'s fleet is ready. Pass to ${prev.players[1].name}.`,
          };
        } else {
          return {
            ...prev,
            phase: 'pre-battle',
            message: 'All fleets are placed. Ready for battle!',
          };
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
                placementComplete: false,
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
                [key]: true,
            }
        }
    })
  }, []);

  const startBattle = useCallback(() => {
    setGameState(prev => {
        if(prev.phase !== 'pre-battle' || !prev.readyStates.player1 || !prev.readyStates.player2) return prev;
        
        const currentPlayer = prev.players[0];
        let shotsRemaining = 1;
        if (prev.gameMode === 'salvo') {
            shotsRemaining = currentPlayer.ships.filter(s => !s.sunk).length;
        }

        return {
            ...prev,
            phase: 'battle',
            currentPlayerId: 1,
            isTransitioning: false,
            shotsRemaining,
            message: `${currentPlayer.name}, your turn. ${prev.gameMode === 'salvo' ? `(${shotsRemaining} shots remaining)` : ''}`
        }
    })
  }, []);

  const confirmShotAndSwitchTurn = useCallback(() => {
    setGameState(currentGameState => {
        if (currentGameState.phase !== 'battle' || !currentGameState.isTransitioning) return currentGameState;
        
        const nextPlayerId = currentGameState.currentPlayerId === 1 ? 2 : 1;
        const nextPlayer = currentGameState.players[nextPlayerId - 1];
        
        let shotsRemaining = 1;
        if (currentGameState.gameMode === 'salvo') {
            shotsRemaining = nextPlayer.ships.filter(s => !s.sunk).length;
            if (shotsRemaining === 0) shotsRemaining = 1; // Failsafe
        }
        
        return {
            ...currentGameState,
            isTransitioning: false,
            shotResult: null,
            currentPlayerId: nextPlayerId,
            shotsRemaining,
            message: `${nextPlayer.name}, your turn. ${currentGameState.gameMode === 'salvo' ? `(${shotsRemaining} shots remaining)`: ''}`
        }
    });
  }, []);

  const handleFire = useCallback((x: number, y: number) => {
    setGameState((prev) => {
      if (prev.phase !== 'battle' || prev.isTransitioning) return prev;

      const { currentPlayerId, players, gameMode, shotsRemaining } = prev;
      const currentPlayer = players[currentPlayerId - 1];
      const opponentId = currentPlayerId === 1 ? 2 : 1;
      const opponent = players[opponentId - 1];

      if (opponent.board[y][x] === 'hit' || opponent.board[y][x] === 'miss') {
        return { ...prev, message: "You've already fired at this location." };
      }

      const newOpponentBoard = opponent.board.map(row => [...row]);
      let resultMessage = '';
      let newOpponentShips = [...opponent.ships];
      let shotHit = false;

      const newCurrentPlayerStats: PlayerStats = {
          ...currentPlayer.stats,
          shotsFired: currentPlayer.stats.shotsFired + 1,
      }

      if (opponent.board[y][x] === 'ship') {
        shotHit = true;
        newOpponentBoard[y][x] = 'hit';
        newCurrentPlayerStats.hits += 1;
        let allShipsSunk = true;

        newOpponentShips = opponent.ships.map(ship => {
            const isHit = ship.positions.some(p => p.x === x && p.y === y);
            if (isHit) {
                if (gameMode === 'nuclear') {
                    // Instantly sink the ship
                    resultMessage = `Opponent's ${ship.name} was obliterated!`;
                    // Mark all positions as hit
                    ship.positions.forEach(p => {
                        if (newOpponentBoard[p.y][p.x] === 'ship') {
                            newOpponentBoard[p.y][p.x] = 'hit';
                        }
                    });
                    return { ...ship, hits: ship.positions, sunk: true };
                }

                // Classic and Salvo logic
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
            const newPlayers: [Player, Player] = [...players];
            newPlayers[currentPlayerId-1] = {...currentPlayer, stats: newCurrentPlayerStats };

            return {
                ...prev,
                players: newPlayers,
                phase: 'gameover',
                winner: players[currentPlayerId - 1],
                message: `Game Over. ${players[currentPlayerId - 1].name} is the winner.`,
                isTransitioning: false,
                shotResult: { x, y },
            };
        }
      } else {
        newOpponentBoard[y][x] = 'miss';
        newCurrentPlayerStats.misses += 1;
        resultMessage = "Shot missed.";
      }

      const newOpponent: Player = { ...opponent, board: newOpponentBoard, ships: newOpponentShips };
      const newCurrentPlayer: Player = { ...currentPlayer, stats: newCurrentPlayerStats };

      const newPlayers: [Player, Player] = [...players];
      newPlayers[opponentId-1] = newOpponent;
      newPlayers[currentPlayerId-1] = newCurrentPlayer;
      
      const newShotsRemaining = shotsRemaining - 1;

      if (gameMode === 'salvo' && newShotsRemaining > 0) {
        return {
          ...prev,
          players: newPlayers,
          shotsRemaining: newShotsRemaining,
          shotResult: { x, y },
          message: `${resultMessage} ${newShotsRemaining} shots remaining.`
        }
      }

      return {
        ...prev,
        players: newPlayers,
        isTransitioning: true,
        shotResult: { x, y },
        message: resultMessage,
      };
    });
  }, []);

  const forceWin = useCallback((playerId: 1 | 2) => {
    setGameState(prev => {
        if (prev.phase === 'gameover') return prev;
        const winner = prev.players[playerId - 1];
        const newPlayers: [Player, Player] = [...prev.players];
        const winnerIndex = newPlayers.findIndex(p => p.id === playerId);
        if (winnerIndex !== -1) {
            newPlayers[winnerIndex] = {
                ...newPlayers[winnerIndex],
                ships: newPlayers[winnerIndex].ships.map(s => ({...s, sunk: true}))
            }
        }

        return {
            ...prev,
            players: newPlayers,
            phase: 'gameover',
            winner: winner,
            message: `Game Over. ${winner.name} is the winner.`,
            isTransitioning: false,
        }
    })
  }, []);

  return { gameState, setPlayerNames, placeShip, handleFire, resetGame, toggleOrientation, startNextPlacement, confirmShotAndSwitchTurn, togglePlayerReady, startBattle, forceWin, endPlacement };
};
