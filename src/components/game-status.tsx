'use client';

import type { FC } from 'react';
import { PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GamePhase, Player } from '@/lib/game';
import { GameStats } from './game-stats';

interface GameStatusProps {
  phase: GamePhase;
  message: string;
  onReset: () => void;
  onStartNextPlacement?: () => void;
  isTransitioning?: boolean;
  onConfirmShot?: () => void;
  players?: [Player, Player];
  winner: Player | null;
}

export const GameStatus: FC<GameStatusProps> = ({ phase, message, onReset, onStartNextPlacement, isTransitioning, onConfirmShot, players, winner }) => {
  const renderTitle = () => {
    if (phase === 'gameover' && winner) return `${winner.name} Wins!`;
    if (phase === 'gameover') return 'Game Over';
    if (isTransitioning && phase === 'battle') {
        if (message.toLowerCase().includes('hit') || message.toLowerCase().includes('sunk')) {
            return "Hit";
        }
        if (message.toLowerCase().includes('miss')) {
            return "Miss";
        }
    }
    return 'Battleship';
  }

  return (
    <Card className="text-center w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          {renderTitle()}
        </CardTitle>
        <CardDescription>
          {isTransitioning && phase === 'battle' 
            ? 'Pass the device to your opponent and press Continue.' 
            : message}
        </CardDescription>
      </CardHeader>
      {phase === 'gameover' && players && winner && (
        <CardContent className="flex flex-col items-center gap-4">
          <PartyPopper className="w-16 h-16 text-primary" />
          <GameStats players={players} />
          <Button onClick={onReset}>Play Again</Button>
        </CardContent>
      )}
      {phase === 'intermission' && onStartNextPlacement && (
        <CardContent>
            <Button onClick={onStartNextPlacement}>Ready Player 2</Button>
        </CardContent>
      )}
      {isTransitioning && phase === 'battle' && onConfirmShot && (
        <CardContent>
            <Button onClick={onConfirmShot}>Continue</Button>
        </CardContent>
      )}
    </Card>
  );
};
