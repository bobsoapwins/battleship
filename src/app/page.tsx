'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGame } from '@/hooks/use-game';
import { ShipSelector } from '@/components/ship-selector';
import { GameStatus } from '@/components/game-status';
import { SHIP_TYPES } from '@/lib/game';
import { cn } from '@/lib/utils';
import { SetupScreen } from '@/components/setup-screen';
import { BootupScreen } from '@/components/bootup-screen';

const GameBoard = dynamic(() => import('@/components/game-board').then(mod => mod.GameBoard), {
  ssr: false,
  loading: () => <div className="aspect-square w-full max-w-sm mx-auto md:max-w-md lg:max-w-lg bg-primary/10 rounded-lg animate-pulse" />
});


export default function Home() {
  const { gameState, setPlayerNames, placeShip, handleFire, resetGame, toggleOrientation, startNextPlacement, confirmShotAndSwitchTurn } = useGame();
  const { phase, players, currentPlayerId, message, placementState, isTransitioning, shotResult } = gameState;
  const [isClient, setIsClient] = useState(false);
  const [isBootingUp, setIsBootingUp] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
    if (!isClient) {
      return null;
    }
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
  
  if (isBootingUp) {
    return <BootupScreen onComplete={() => setIsBootingUp(false)} />;
  }

  if (phase === 'setup') {
    return (
      <main className="container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center justify-center">
        <SetupScreen onGameStart={setPlayerNames} />
      </main>
    );
  }

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
