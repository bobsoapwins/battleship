'use client';

import type { Player, ReadyStates } from '@/lib/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface ReadyUpScreenProps {
  players: [Player, Player];
  readyStates: ReadyStates;
  onToggleReady: (playerId: 1 | 2) => void;
  onStartBattle: () => void;
}

export const ReadyUpScreen = ({ players, readyStates, onToggleReady, onStartBattle }: ReadyUpScreenProps) => {
  const allReady = readyStates.player1 && readyStates.player2;

  const PlayerStatus = ({ player, isReady }: { player: Player, isReady: boolean }) => (
    <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
      <div className="flex items-center gap-3">
        {isReady ? (
          <CheckCircle2 className="w-6 h-6 text-green-500" />
        ) : (
          <XCircle className="w-6 h-6 text-red-500" />
        )}
        <span className="font-medium">{player.name}</span>
      </div>
      <Button onClick={() => onToggleReady(player.id)} disabled={isReady}>
        Ready
      </Button>
    </div>
  );

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="font-headline text-3xl">The Fleets Are Set</CardTitle>
        <CardDescription>
          Both players must ready up to begin the battle.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <PlayerStatus player={players[0]} isReady={readyStates.player1} />
        <PlayerStatus player={players[1]} isReady={readyStates.player2} />

        {allReady && (
          <div className="pt-4 flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground">All players are ready!</p>
            <Button onClick={onStartBattle} size="lg">
              Start Battle
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
