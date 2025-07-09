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
import { ReadyUpScreen } from '@/components/ready-up-screen';
import { Terminal } from '@/components/terminal';
import type { GameAnalysisInput, GameAnalysisOutput } from '@/ai/flows/game-analysis-flow';
import { getGameAnalysis } from '@/ai/flows/game-analysis-flow';
import { AIInsights } from '@/components/ai-insights';
import { IntroScreen } from '@/components/intro-screen';


const GameBoard = dynamic(() => import('@/components/game-board').then(mod => mod.GameBoard), {
  ssr: false,
  loading: () => <div className="aspect-square w-full max-w-sm mx-auto md:max-w-md lg:max-w-lg bg-primary/10 rounded-lg animate-pulse" />
});


export default function Home() {
  const { gameState, setPlayerNames, placeShip, handleFire, resetGame, toggleOrientation, startNextPlacement, confirmShotAndSwitchTurn, togglePlayerReady, startBattle, forceWin } = useGame();
  const { phase, players, currentPlayerId, message, placementState, isTransitioning, shotResult, readyStates, winner } = gameState;
  const [isClient, setIsClient] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'booting' | 'intro' | 'game'>('booting');
  const [revealOpponent, setRevealOpponent] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [insights, setInsights] = useState<GameAnalysisOutput | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [gameVisible, setGameVisible] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (currentScreen === 'game') {
      const timer = setTimeout(() => setGameVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (phase === 'gameover' && winner && !insights && !isLoadingInsights) {
        const fetchInsights = async () => {
            setIsLoadingInsights(true);
            try {
                const input: GameAnalysisInput = {
                    player1: { name: players[0].name, ...players[0].stats },
                    player2: { name: players[1].name, ...players[1].stats },
                    winnerName: winner.name,
                };
                const result = await getGameAnalysis(input);
                setInsights(result);
            } catch (error) {
                console.error("Failed to get AI insights:", error);
                // Optionally set some error state to display to the user
            } finally {
                setIsLoadingInsights(false);
            }
        };
        fetchInsights();
    }
    if (phase !== 'gameover') {
        setInsights(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, winner]);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'Tab') {
        if (currentScreen === 'booting' || currentScreen === 'intro') {
            e.preventDefault();
            setCurrentScreen('game');
        }
      }

      if (e.ctrlKey && e.shiftKey && e.key === 'Tab') {
        e.preventDefault();
        setRevealOpponent(prev => !prev);
      }
      
      if (e.key === '/') {
        if (!isTerminalOpen && (e.target as HTMLElement).tagName !== 'INPUT') {
            e.preventDefault();
            setIsTerminalOpen(true);
        }
      }

      if (e.key === 'Escape') {
          if (isTerminalOpen) {
              setIsTerminalOpen(false);
          }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isTerminalOpen, currentScreen]);

  const handleTerminalCommand = (command: string) => {
    if (command.toLowerCase() === '/cheat') {
      setRevealOpponent(prev => !prev);
    }
    if (command.toLowerCase() === '/end') {
        forceWin(1);
    }
    setIsTerminalOpen(false);
  };

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
        <div className={cn(
          "w-full lg:w-1/2 p-4 rounded-xl transition-opacity duration-500",
          isTransitioning ? "opacity-0" : "opacity-50"
        )}>
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
            revealShips={revealOpponent}
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
         return (
          <AIInsights
            players={players}
            insights={insights}
            isLoading={isLoadingInsights}
          />
        );
      case 'intermission':
        return null; // Handled by GameStatus
      case 'pre-battle':
        return (
          <ReadyUpScreen
            players={players}
            readyStates={readyStates}
            onToggleReady={togglePlayerReady}
            onStartBattle={startBattle}
          />
        );
      default:
        return null;
    }
  };
  
  if (currentScreen === 'booting') {
    return <BootupScreen onComplete={() => setCurrentScreen('intro')} />;
  }

  if (currentScreen === 'intro') {
    return <IntroScreen onComplete={() => setCurrentScreen('game')} />;
  }

  const mainContentClass = cn(
    "container mx-auto p-4 md:p-8 min-h-screen flex flex-col items-center",
    "transition-opacity duration-1000",
    gameVisible ? "opacity-100" : "opacity-0"
  );
  
  if (phase === 'setup') {
    return (
      <main className={cn(mainContentClass, "justify-center")}>
        <SetupScreen onGameStart={setPlayerNames} />
      </main>
    );
  }

  return (
    <main className={mainContentClass}>
      <div className="w-full mb-8">
        <GameStatus
          phase={phase}
          message={message}
          onReset={resetGame}
          onStartNextPlacement={startNextPlacement}
          isTransitioning={isTransitioning}
          onConfirmShot={confirmShotAndSwitchTurn}
          players={players}
          winner={winner}
        />
      </div>
      <div className="w-full">
        {renderContent()}
      </div>
       {isTerminalOpen && (
        <Terminal
          onCommand={handleTerminalCommand}
          onClose={() => setIsTerminalOpen(false)}
        />
      )}
    </main>
  );
}
