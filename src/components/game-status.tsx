
'use client';

import type { FC } from 'react';
import { PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GamePhase, Player } from '@/lib/game';

interface GameStatusProps {
  phase: GamePhase;
  message: string;
  onReset: () => void;
  onStartNextPlacement?: () => void;
  isTransitioning?: boolean;
  onConfirmShot?: () => void;
  winner: Player | null;
  isAIGame?: boolean;
}

export const GameStatus: FC<GameStatusProps> = ({ phase, message, onReset, onStartNextPlacement, isTransitioning, onConfirmShot, winner, isAIGame }) => {
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

  const getTransitionMessage = () => {
    if (isAIGame) {
      if (winner && winner.id === 2) return `The AI has processed its turn. It's your turn.`
      return "The AI has processed its turn. Press Continue."
    }
    return 'Pass the device to your opponent and press Continue.';
  }

  return (
    <Card className="text-center w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          {renderTitle()}
        </CardTitle>
        <CardDescription>
          {isTransitioning && phase === 'battle' 
            ? getTransitionMessage()
            : message}
        </CardDescription>
      </CardHeader>
      {phase === 'gameover' && (
        <CardContent className="flex flex-col items-center gap-4">
          <PartyPopper className="w-16 h-16 text-primary" />
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
