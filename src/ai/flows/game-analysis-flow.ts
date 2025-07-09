'use server';
/**
 * @fileOverview An AI agent that analyzes battleship game statistics.
 *
 * - getGameAnalysis - A function that handles the game analysis process.
 * - GameAnalysisInput - The input type for the getGameAnalysis function.
 * - GameAnalysisOutput - The return type for the getGameAnalysis function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const PlayerStatsSchema = z.object({
  name: z.string().describe('The name of the player.'),
  shotsFired: z.number().describe('The total number of shots the player took.'),
  hits: z.number().describe('The number of shots that hit an opponent ship.'),
  misses: z.number().describe('The number of shots that missed.'),
});

const GameAnalysisInputSchema = z.object({
  player1: PlayerStatsSchema,
  player2: PlayerStatsSchema,
  winnerName: z.string().describe("The name of the player who won the game."),
});
export type GameAnalysisInput = z.infer<typeof GameAnalysisInputSchema>;

const GameAnalysisOutputSchema = z.object({
  player1Insight: z
    .string()
    .describe("The AI-generated analysis for Player 1."),
  player2Insight: z
    .string()
    .describe("The AI-generated analysis for Player 2."),
});
export type GameAnalysisOutput = z.infer<typeof GameAnalysisOutputSchema>;

export async function getGameAnalysis(input: GameAnalysisInput): Promise<GameAnalysisOutput> {
  return gameAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'gameAnalysisPrompt',
  input: { schema: GameAnalysisInputSchema },
  output: { schema: GameAnalysisOutputSchema },
  prompt: `You are a seasoned, slightly sarcastic naval commander providing a post-action report for a game of Battleship.

The winner is {{winnerName}}.

Analyze the performance of each player based on their stats. Provide a tactical analysis and a fun, snarky comment for each. Keep the insights concise (2-3 sentences).

Player 1: {{player1.name}}
- Shots Fired: {{player1.shotsFired}}
- Hits: {{player1.hits}}
- Misses: {{player1.misses}}

Player 2: {{player2.name}}
- Shots Fired: {{player2.shotsFired}}
- Hits: {{player2.hits}}
- Misses: {{player2.misses}}

Generate a unique insight for each player based on these stats.`,
});

const gameAnalysisFlow = ai.defineFlow(
  {
    name: 'gameAnalysisFlow',
    inputSchema: GameAnalysisInputSchema,
    outputSchema: GameAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
