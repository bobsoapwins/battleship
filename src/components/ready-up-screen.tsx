
'use client';

import type { Player, ReadyStates } from '@/lib/game';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

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
      <div className="flex flex-col items-start">
        <span className="font-medium text-lg">{player.name}</span>
        {isReady ? (
            <span className="text-sm font-bold text-green-600">READY</span>
        ) : (
            <span className="text-sm font-bold text-red-600">UNREADY</span>
        )}
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
            <p className="text-sm text-muted-foreground">{players[0].name} may start the battle.</p>
            <Button onClick={onStartBattle} size="lg">
              Start Battle
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
