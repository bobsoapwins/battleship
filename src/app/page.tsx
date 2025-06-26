'use client';

import { useGame } from '@/hooks/use-game';
import { GameBoard } from '@/components/game-board';
import { ShipSelector } from '@/components/ship-selector';
import { GameStatus } from '@/components/game-status';
import { SHIP_TYPES } from '@/lib/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Swords } from 'lucide-react';

export default function Home() {
  const { gameState, placeShip, handleFire, resetGame, toggleOrientation, startNextPlacement } = useGame();
  const { phase, players, currentPlayerId, message, placementState } = gameState;

  const currentPlayer = players[currentPlayerId - 1];
  const opponentPlayer = players[currentPlayerId === 1 ? 1 : 0];

  const renderPlacementPhase = () => {
    const playerToPlace = players[placementState.playerToPlace - 1];
    const shipToPlace = SHIP_TYPES[placementState.shipIndex];

    if (!shipToPlace) return null;

    return (
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="w-full lg:w-1/3">
          <ShipSelector
            shipToPlace={shipToPlace}
            orientation={placementState.orientation}
            onToggleOrientation={toggleOrientation}
            shipsPlacedCount={placementState.shipIndex}
            totalShips={SHIP_TYPES.length}
          />
        </div>
        <div className="w-full lg:w-2/3">
          <h2 className="text-2xl font-headline mb-4 text-center">{playerToPlace.name}'s Grid</h2>
          <GameBoard
            boardData={playerToPlace.board}
            ships={playerToPlace.ships}
            onCellClick={(x, y) => placeShip(x, y)}
            isPlayerBoard={true}
          />
        </div>
      </div>
    );
  };

  const renderBattlePhase = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <div className={cn("p-4 rounded-xl transition-all duration-500", currentPlayerId === currentPlayer.id ? 'bg-primary/10 ring-2 ring-accent' : 'opacity-60')}>
        <h2 className="text-2xl font-headline mb-4 text-center">{currentPlayer.name}'s Fleet (You)</h2>
        <GameBoard
          boardData={currentPlayer.board}
          ships={currentPlayer.ships}
          onCellClick={() => {}}
          isPlayerBoard={true}
          disabled={true}
        />
      </div>
      <div className={cn("p-4 rounded-xl transition-all duration-500", currentPlayerId !== currentPlayer.id ? 'bg-primary/10 ring-2 ring-accent' : 'opacity-60')}>
        <h2 className="text-2xl font-headline mb-4 text-center">{opponentPlayer.name}'s Fleet (Opponent)</h2>
        <GameBoard
          boardData={opponentPlayer.board}
          ships={opponentPlayer.ships}
          onCellClick={(x, y) => handleFire(x, y)}
          isPlayerBoard={false}
          disabled={currentPlayerId !== currentPlayer.id}
        />
      </div>
    </div>
  );

  const renderContent = () => {
    switch (phase) {
      case 'placement':
        return renderPlacementPhase();
      case 'battle':
      case 'gameover':
        return renderBattlePhase();
      case 'intermission':
        return null; // The GameStatus component handles this case.
      default:
        return null;
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center">
      <div className="w-full mb-8">
        <GameStatus phase={phase} message={message} onReset={resetGame} onStartNextPlacement={startNextPlacement} />
      </div>
      <div className="w-full">
        {renderContent()}
      </div>
    </main>
  );
}
