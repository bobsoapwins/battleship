'use client';

import type { FC } from 'react';
import { PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { GamePhase } from '@/lib/game';

interface GameStatusProps {
  phase: GamePhase;
  message: string;
  onReset: () => void;
  onStartNextPlacement?: () => void;
}

export const GameStatus: FC<GameStatusProps> = ({ phase, message, onReset, onStartNextPlacement }) => {
  return (
    <Card className="text-center w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">
          {phase === 'gameover' ? 'Game Over!' : 'Battleship'}
        </CardTitle>
        <CardDescription>{message}</CardDescription>
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
    </Card>
  );
};
