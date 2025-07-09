'use client';

import type { Player } from '@/lib/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GameStatsProps {
    players: [Player, Player];
}

const PlayerStatsCard = ({ player }: { player: Player }) => {
    const { stats } = player;
    const accuracy = stats.shotsFired > 0 ? ((stats.hits / stats.shotsFired) * 100).toFixed(0) : 0;

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="text-lg font-medium">{player.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-left space-y-2">
                <p><strong>Total Shots:</strong> {stats.shotsFired}</p>
                <p><strong>Hits:</strong> {stats.hits}</p>
                <p><strong>Misses:</strong> {stats.misses}</p>
                <p><strong>Accuracy:</strong> {accuracy}%</p>
            </CardContent>
        </Card>
    )
}

export const GameStats = ({ players }: GameStatsProps) => {
    return (
        <div className="w-full my-4">
            <h3 className="text-xl font-headline mb-4">Post-Game Report</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PlayerStatsCard player={players[0]} />
                <PlayerStatsCard player={players[1]} />
            </div>
        </div>
    )
}
