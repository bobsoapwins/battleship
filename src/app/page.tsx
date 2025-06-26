'use client';

import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/use-game';
import { GameBoard } from '@/components/game-board';
import { ShipSelector } from '@/components/ship-selector';
import { GameStatus } from '@/components/game-status';
import { SHIP_TYPES } from '@/lib/game';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { gameState, placeShip, handleFire, resetGame, toggleOrientation, startNextPlacement } = useGame();
  const { phase, players, currentPlayerId, message, placementState, isTransitioning, shotResult } = gameState;
  const [showMyBoard, setShowMyBoard] = useState(false);

  useEffect(() => {
    if (phase === 'battle' && !isTransitioning) {
      setShowMyBoard(false);
    }
    if (phase === 'gameover') {
      setShowMyBoard(true);
    }
  }, [phase, isTransitioning]);

  const currentPlayer = players[currentPlayerId - 1];
  const opponentPlayer = players[currentPlayerId === 1 ? 1 : 0];

  const handleFireAndSwitch = (x: number, y: number) => {
    setShowMyBoard(false);
    handleFire(x, y);
  };

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
      <div className="flex flex-col items-center gap-4 w-full">
        <Button onClick={() => setShowMyBoard(b => !b)} variant="outline" disabled={isTransitioning}>
          {showMyBoard ? `Show ${opponentPlayer.name}'s Board` : `Show ${currentPlayer.name}'s Board`}
        </Button>
        <div className="w-full overflow-hidden max-w-lg mx-auto">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: showMyBoard ? 'translateX(0)' : 'translateX(-100%)' }}
          >
            {/* My Board */}
            <div className="w-full flex-shrink-0">
              <div className={cn("p-4 rounded-xl transition-all duration-500 opacity-80")}>
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
            </div>

            {/* Opponent's Board */}
            <div className="w-full flex-shrink-0">
               <div className={cn("p-4 rounded-xl transition-all duration-500", phase === 'battle' && !isTransitioning ? 'bg-primary/10 ring-2 ring-accent' : 'opacity-80')}>
                <h2 className="text-2xl font-headline mb-4 text-center">{`${opponentPlayer.name}'s Fleet (Opponent)`}</h2>
                <GameBoard
                  boardData={opponentPlayer.board}
                  ships={opponentPlayer.ships}
                  onCellClick={handleFireAndSwitch}
                  isPlayerBoard={false}
                  disabled={phase !== 'battle' || isTransitioning}
                  lastShot={shotResult}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

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
