
'use client';

import { useState, useCallback, useEffect } from 'react';
import type {
  GameState,
  Player,
  Ship,
  PlayerStats,
  GameMode,
  Point,
  ActiveAbility,
  AbilitiesState,
  Board,
} from '@/lib/game';
import {
  SHIP_TYPES,
  createEmptyBoard,
  canPlaceShip,
  GRID_SIZE,
} from '@/lib/game';

const initialStats = (): PlayerStats => ({
    shotsFired: 0,
    hits: 0,
    misses: 0,
});

const initialAbilities = (): AbilitiesState => ({
  sonar: { uses: 2, cooldown: 0 },
  tomahawk: { uses: 1, cooldown: 0 },
  mine: { uses: 2, cooldown: 0 },
});

const initialPlayer = (id: 1 | 2): Player => ({
  id,
  name: `Player ${id}`,
  board: createEmptyBoard(),
  ships: [],
  stats: initialStats(),
  abilities: initialAbilities(),
  mines: [],
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
  scannedArea: null,
  activeAbility: null,
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
            {...initialPlayer(1), name: player1Name },
            {...initialPlayer(2), name: player2Name }
        ];

        return {
            ...getInitialState(),
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
      
      const { playerToPlace } = prev.placementState;
      const currentPlayer = prev.players[playerToPlace - 1];

      if (prev.gameMode === 'electronic' && prev.activeAbility === 'mine') {
          if(currentPlayer.board[y][x] !== 'empty') {
            return { ...prev, message: 'Cannot place a mine on a ship.' };
          }
          if (currentPlayer.mines.some(m => m.x === x && m.y === y)) {
            return { ...prev, message: 'A mine is already here.' };
          }

          const newBoard = currentPlayer.board.map(row => [...row]);
          newBoard[y][x] = 'mine';
          
          const newPlayer = { 
            ...currentPlayer, 
            board: newBoard, 
            mines: [...currentPlayer.mines, {x, y}],
            abilities: {
              ...currentPlayer.abilities,
              mine: { ...currentPlayer.abilities.mine, uses: currentPlayer.abilities.mine.uses - 1 }
            }
          };

          const newPlayers: [Player, Player] = [...prev.players];
          newPlayers[playerToPlace - 1] = newPlayer;

          return {
            ...prev,
            players: newPlayers,
            activeAbility: null,
            message: `${currentPlayer.name}, place your fleet.`
          }
      }

      const { shipIndex, orientation } = prev.placementState;
      const shipType = SHIP_TYPES[shipIndex];

      if (!shipType || !canPlaceShip(currentPlayer.board, shipType.size, x, y, orientation)) {
        return { ...prev, message: "Cannot place ship here. Try another location." };
      }

      const newBoard = currentPlayer.board.map((row) => [...row]);
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
        ...currentPlayer,
        board: newBoard,
        ships: [...currentPlayer.ships, newShip],
      };
      
      const newPlayers: [Player, Player] = [...prev.players];
      newPlayers[playerToPlace - 1] = newPlayer;

      const nextShipIndex = shipIndex + 1;

      if (nextShipIndex < SHIP_TYPES.length) {
        return {
          ...prev,
          players: newPlayers,
          placementState: { ...prev.placementState, shipIndex: nextShipIndex },
          message: `${currentPlayer.name}, place your ${SHIP_TYPES[nextShipIndex].name}.`,
        };
      } else {
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
                [key]: !prev.readyStates[key],
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
            activeAbility: null,
            message: `${nextPlayer.name}, your turn. ${currentGameState.gameMode === 'salvo' ? `(${shotsRemaining} shots remaining)`: ''}`
        }
    });
  }, []);

  const toggleAbility = useCallback((ability: ActiveAbility) => {
    setGameState(prev => {
      if (prev.phase !== 'battle' && prev.phase !== 'placement') return prev;
      if (prev.isTransitioning) return prev;
      if (prev.gameMode !== 'electronic') return prev;
      
      const currentPlayer = prev.players[prev.currentPlayerId - 1];
      if (ability && (!currentPlayer.abilities[ability] || currentPlayer.abilities[ability].uses <= 0)) {
        return { ...prev, message: `No uses of ${ability} left.` };
      }

      const isPlacementMine = prev.phase === 'placement' && ability === 'mine';
      if(isPlacementMine) {
          const playerToPlace = prev.players[prev.placementState.playerToPlace - 1];
          if(playerToPlace.abilities.mine.uses <= 0) return { ...prev, message: "No mines left." };
          return {
              ...prev,
              activeAbility: prev.activeAbility === ability ? null : ability,
              message: prev.activeAbility === ability ? `${playerToPlace.name}, place your fleet.` : 'Select a cell to place a mine.',
          }
      }

      return {
        ...prev,
        activeAbility: prev.activeAbility === ability ? null : ability,
        message: prev.activeAbility === ability 
          ? `${currentPlayer.name}, your turn.`
          : `Select a target for ${ability}.`,
      }
    });
  }, []);

  const processShot = (x: number, y: number, opponentBoard: Board, opponentShips: Ship[], gameMode: GameMode): { board: Board, ships: Ship[], message: string } => {
    let newBoard = opponentBoard.map(row => [...row]);
    let newShips = [...opponentShips];
    let message = '';
  
    if (newBoard[y][x] === 'ship') {
      newBoard[y][x] = 'hit';
      
      newShips = newShips.map(ship => {
        const isHit = ship.positions.some(p => p.x === x && p.y === y);
        if (isHit) {
          if (gameMode === 'nuclear') {
            message = `Opponent's ${ship.name} was obliterated!`;
            ship.positions.forEach(p => {
              if (newBoard[p.y][p.x] === 'ship') {
                newBoard[p.y][p.x] = 'hit';
              }
            });
            return { ...ship, hits: ship.positions, sunk: true };
          }
  
          const newHits = [...ship.hits, { x, y }];
          const sunk = newHits.length === ship.size;
          if (sunk) {
            message = `Opponent's ${ship.name} was sunk.`;
          } else {
            message = "Hit confirmed.";
          }
          return { ...ship, hits: newHits, sunk };
        }
        return ship;
      });
    } else if (newBoard[y][x] === 'empty') {
      newBoard[y][x] = 'miss';
      message = "Shot missed.";
    }
  
    return { board: newBoard, ships: newShips, message };
  };

  const handleFire = useCallback((x: number, y: number) => {
    setGameState((prev) => {
      if (prev.phase !== 'battle' || prev.isTransitioning) return prev;

      const { currentPlayerId, players, gameMode, shotsRemaining, activeAbility } = prev;
      const currentPlayer = players[currentPlayerId - 1];
      const opponentId = currentPlayerId === 1 ? 2 : 1;
      const opponent = players[opponentId - 1];

      // Handle abilities
      if (activeAbility) {
        let newPlayers: [Player, Player] = [...players];
        let transitionMessage = '';
        let shotResults: Point[] = [];

        if (activeAbility === 'sonar') {
          const scannedArea: Point[] = [];
          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const scanX = x + i;
              const scanY = y + j;
              if (scanX >= 0 && scanX < GRID_SIZE && scanY >= 0 && scanY < GRID_SIZE) {
                scannedArea.push({ x: scanX, y: scanY });
              }
            }
          }
          const newCurrentPlayer = {...currentPlayer, abilities: {...currentPlayer.abilities, sonar: { ...currentPlayer.abilities.sonar, uses: currentPlayer.abilities.sonar.uses - 1}}};
          newPlayers[currentPlayerId-1] = newCurrentPlayer;
          return { ...prev, players: newPlayers, scannedArea: [...(prev.scannedArea || []), ...scannedArea], activeAbility: null, isTransitioning: true, message: 'Scan complete. Area revealed.' };
        }

        if(activeAbility === 'tomahawk') {
            transitionMessage = 'Tomahawk strike launched!';
            const newCurrentPlayer = {...currentPlayer, abilities: {...currentPlayer.abilities, tomahawk: { ...currentPlayer.abilities.tomahawk, uses: currentPlayer.abilities.tomahawk.uses - 1}}};
            newPlayers[currentPlayerId-1] = newCurrentPlayer;
            let currentOpponent = newPlayers[opponentId-1];

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const fireX = x + i;
                    const fireY = y + j;
                    if (fireX >= 0 && fireX < GRID_SIZE && fireY >= 0 && fireY < GRID_SIZE) {
                        shotResults.push({x: fireX, y: fireY});
                        const { board, ships } = processShot(fireX, fireY, currentOpponent.board, currentOpponent.ships, gameMode);
                        currentOpponent = { ...currentOpponent, board, ships };
                    }
                }
            }
            newPlayers[opponentId-1] = currentOpponent;
        }

        const allShipsSunk = newPlayers[opponentId - 1].ships.every(ship => ship.sunk);
        if (allShipsSunk) {
            return {
                ...prev,
                players: newPlayers,
                phase: 'gameover',
                winner: currentPlayer,
                message: `Game Over. ${currentPlayer.name} is the winner.`,
                isTransitioning: false,
                shotResult: shotResults,
                activeAbility: null,
            };
        }

        return { ...prev, players: newPlayers, shotResult: shotResults, activeAbility: null, isTransitioning: true, message: transitionMessage };
      }

      if (opponent.board[y][x] === 'hit' || opponent.board[y][x] === 'miss') {
        return { ...prev, message: "You've already fired at this location." };
      }

      let newOpponentBoard = opponent.board.map(row => [...row]);
      let resultMessage = '';
      let newOpponentShips = [...opponent.ships];
      
      const newCurrentPlayerStats: PlayerStats = {
          ...currentPlayer.stats,
          shotsFired: currentPlayer.stats.shotsFired + 1,
      }
      
      // Mine detonation check
      if (opponent.board[y][x] === 'mine') {
          resultMessage = `${opponent.name}'s mine detonated! Massive damage on your fleet!`;
          
          let currentBoardForMine = currentPlayer.board.map(r => [...r]);
          let currentShipsForMine = [...currentPlayer.ships];
          let shotResults: Point[] = [];

          for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
              const fireX = x + i;
              const fireY = y + j;
              if (fireX >= 0 && fireX < GRID_SIZE && fireY >= 0 && fireY < GRID_SIZE) {
                const { board, ships } = processShot(fireX, fireY, currentBoardForMine, currentShipsForMine, gameMode);
                currentBoardForMine = board;
                currentShipsForMine = ships;
                shotResults.push({x: fireX, y: fireY});
              }
            }
          }
          const newCurrentPlayerAfterMine = { ...currentPlayer, board: currentBoardForMine, ships: currentShipsForMine };
          
          newOpponentBoard[y][x] = 'miss'; // The mine is gone
          const newOpponentAfterMine: Player = { ...opponent, board: newOpponentBoard, mines: opponent.mines.filter(m => !(m.x === x && m.y === y)) };
          
          const newPlayers: [Player, Player] = [...players];
          newPlayers[currentPlayerId-1] = newCurrentPlayerAfterMine;
          newPlayers[opponentId-1] = newOpponentAfterMine;

          const allPlayerShipsSunk = newCurrentPlayerAfterMine.ships.every(ship => ship.sunk);
          if (allPlayerShipsSunk) {
            return {
              ...prev,
              players: newPlayers,
              phase: 'gameover',
              winner: opponent,
              message: `Your fleet was destroyed by a mine! ${opponent.name} wins!`,
              isTransitioning: false,
            };
          }
          
          return {
              ...prev,
              players: newPlayers,
              isTransitioning: true,
              shotResult: {x,y}, // just show the initial shot
              message: resultMessage,
          }
      }
      
      const { board, ships, message } = processShot(x, y, newOpponentBoard, newOpponentShips, gameMode);
      newOpponentBoard = board;
      newOpponentShips = ships;
      resultMessage = message;

      if(resultMessage.includes("Hit") || resultMessage.includes("obliterated") || resultMessage.includes("sunk")) {
        newCurrentPlayerStats.hits += 1;
      } else {
        newCurrentPlayerStats.misses += 1;
      }

      const allShipsSunk = newOpponentShips.every(ship => ship.sunk);

      if (allShipsSunk) {
          const newPlayers: [Player, Player] = [...players];
          newPlayers[currentPlayerId-1] = {...currentPlayer, stats: newCurrentPlayerStats };
          newPlayers[opponentId-1] = {...opponent, board: newOpponentBoard, ships: newOpponentShips};

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
            activeAbility: null,
        }
    })
  }, []);

  return { gameState, setPlayerNames, placeShip, handleFire, resetGame, toggleOrientation, startNextPlacement, confirmShotAndSwitchTurn, togglePlayerReady, startBattle, forceWin, endPlacement, toggleAbility };
};

    