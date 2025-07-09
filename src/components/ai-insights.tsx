'use client';

import type { GameAnalysisOutput } from '@/ai/flows/game-analysis-flow';
import type { Player } from '@/lib/game';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bot } from 'lucide-react';

interface AIInsightsProps {
  players: [Player, Player];
  insights: GameAnalysisOutput | null;
  isLoading: boolean;
}

const InsightCard = ({
  playerName,
  insight,
  isLoading,
}: {
  playerName: string;
  insight: string | null;
  isLoading: boolean;
}) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg font-medium">{playerName}'s Report</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>
      ) : (
        <p className="text-sm">{insight || 'No analysis available.'}</p>
      )}
    </CardContent>
  </Card>
);

export const AIInsights = ({
  players,
  insights,
  isLoading,
}: AIInsightsProps) => {
  return (
    <div className="w-full my-4">
      <h3 className="text-xl font-headline mb-4 flex items-center gap-2">
        <Bot className="w-6 h-6" />
        Commander's Insights
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InsightCard
          playerName={players[0].name}
          insight={insights?.player1Insight ?? null}
          isLoading={isLoading}
        />
        <InsightCard
          playerName={players[1].name}
          insight={insights?.player2Insight ?? null}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};
