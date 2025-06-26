'use client';

import { useState } from 'react';
import { useGame } from '@/hooks/use-game';
import { GameBoard } from '@/components/game-board';
import { ShipSelector } from '@/components/ship-selector';
import { GameStatus } from '@/components/game-status';
import { SHIP_TYPES } from '@/lib/game';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { gameState, placeShip, handleFire, resetGame, toggleOrientation, startNextPlacement, confirmShotAndSwitchTurn } = useGame();
  const { phase, players, currentPlayerId, message, placementState, isTransitioning, shotResult } = gameState;
  const [showMyBoard, setShowMyBoard] = useState(false);

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

  const renderBattlePhase = () => {
    return (
      <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
        {/* My Board */}
        <div className={cn("w-full lg:w-1/2 p-4 rounded-xl transition-all duration-500", phase === 'battle' && !isTransitioning ? 'opacity-50' : '')}>
          <h2 className="text-2xl font-headline mb-4 text-center">{`${currentPlayer.name}'s Fleet (You)`}</h2>
          <GameBoard
            boardData={currentPlayer.board}
            ships={currentPlayer.ships}
            onCellClick={() => {}}
            isPlayerBoard={true}
            disabled={true}
            lastShot={null}
          />
        </div>

        {/* Opponent's Board */}
        <div className={cn("w-full lg:w-1/2 p-4 rounded-xl transition-all duration-500", phase === 'battle' && !isTransitioning ? 'bg-primary/10 ring-2 ring-accent' : 'opacity-80')}>
          <h2 className="text-2xl font-headline mb-4 text-center">{`${opponentPlayer.name}'s Fleet (Opponent)`}</h2>
          <GameBoard
            boardData={opponentPlayer.board}
            ships={opponentPlayer.ships}
            onCellClick={handleFire}
            isPlayerBoard={false}
            disabled={phase !== 'battle' || isTransitioning}
            lastShot={shotResult}
          />
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (phase) {
      case 'placement':
        return renderPlacementPhase();
      case 'battle':
        return renderBattlePhase();
      case 'gameover':
        return null;
      case 'intermission':
        return null; // The GameStatus component handles this case.
      default:
        return null;
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center">
      <div className="w-full mb-8">
        <GameStatus
          phase={phase}
          message={message}
          onReset={resetGame}
          onStartNextPlacement={startNextPlacement}
          isTransitioning={isTransitioning}
          onConfirmShot={confirmShotAndSwitchTurn}
        />
      </div>
      <div className="w-full">
        {renderContent()}
      </div>
    </main>
  );
}
