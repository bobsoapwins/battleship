'use server';
/**
 * @fileOverview An AI agent that plays Battleship.
 *
 * - getAIOpponentMove - A function that determines the AI's next move.
 * - AIOpponentInput - The input type for the getAIOpponentMove function.
 * - AIOpponentOutput - The return type for the getAIOpponentMove function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { Board } from '@/lib/game';
import { GRID_SIZE } from '@/lib/game';

const BoardStateSchema = z.array(z.array(z.string())).describe("The current state of the opponent's board from the AI's perspective, represented as a 10x10 grid. 'E' for empty, 'H' for hit, 'M' for miss.");

const AIOpponentInputSchema = z.object({
  boardState: BoardStateSchema,
  lastHit: z.object({ x: z.number(), y: z.number() }).nullable().describe("The coordinate of the last successful hit to help with hunting. Null if the last shot was a miss or this is the first shot."),
});
export type AIOpponentInput = z.infer<typeof AIOpponentInputSchema>;

const AIOpponentOutputSchema = z.object({
  x: z.number().describe('The x-coordinate of the target cell (0-9).'),
  y: z.number().describe('The y-coordinate of the target cell (0-9).'),
});
export type AIOpponentOutput = z.infer<typeof AIOpponentOutputSchema>;

export async function getAIOpponentMove(input: AIOpponentInput): Promise<AIOpponentOutput> {
  return aiOpponentFlow(input);
}

const formatBoardForPrompt = (board: Board): string => {
    return board.map(row => 
        row.map(cell => {
            if (cell === 'hit') return 'H';
            if (cell === 'miss') return 'M';
            return 'E'; // Empty/unknown
        }).join(' ')
    ).join('\n');
}

const prompt = ai.definePrompt({
  name: 'aiOpponentPrompt',
  input: { schema: AIOpponentInputSchema },
  output: { schema: AIOpponentOutputSchema },
  prompt: `You are a Battleship AI commander. Your goal is to sink the enemy fleet efficiently.
You must choose a single valid coordinate (x, y) to fire upon.
A valid coordinate is one marked 'E' (empty) on the board. Do not fire on 'H' (hit) or 'M' (miss).

This is the current state of the enemy grid:
{{#with {board: boardState} }}
{{#each board as |row|}}
  {{#each row as |cell|}}{{#if (eq cell "hit")}}H{{else if (eq cell "miss")}}M{{else}}E{{/if}}{{/each}}
{{/each}}
{{/with}}

Your strategy:
1.  **Hunt Mode**: If your last shot was a hit (provided as lastHit), you should fire at an adjacent, untargeted ('E') cell. Prioritize vertical or horizontal lines if a pattern of two hits is established.
2.  **Search Mode**: If you are not in Hunt Mode, fire at a random, untargeted ('E') cell. A checkerboard pattern (firing on every other square) is an efficient search strategy.

{{#if lastHit}}
You are in **Hunt Mode**. Your last hit was at (x: {{lastHit.x}}, y: {{lastHit.y}}). Choose a valid, adjacent square to fire on.
{{else}}
You are in **Search Mode**. Choose a valid square to fire on, preferably following a checkerboard pattern.
{{/if}}

Based on this information and strategy, provide the x and y coordinates for your next shot.`,
});


const aiOpponentFlow = ai.defineFlow(
  {
    name: 'aiOpponentFlow',
    inputSchema: AIOpponentInputSchema,
    outputSchema: AIOpponentOutputSchema,
  },
  async (input) => {
    // Fallback logic in case the AI fails
    const findValidRandomShot = (): AIOpponentOutput => {
        const availableCells = [];
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                if (input.boardState[y][x] === 'empty' || input.boardState[y][x] === 'ship' ) {
                    availableCells.push({ x, y });
                }
            }
        }
        if (availableCells.length === 0) return { x: 0, y: 0 }; // Should not happen
        return availableCells[Math.floor(Math.random() * availableCells.length)];
    }

    try {
        const { output } = await prompt(input);
        if (output && input.boardState[output.y][output.x] !== 'hit' && input.boardState[output.y][output.x] !== 'miss') {
          return output;
        }
        // If AI returns an invalid coordinate, use fallback
        return findValidRandomShot();
    } catch (error) {
        console.error("AI opponent flow failed, using fallback logic.", error);
        return findValidRandomShot();
    }
  }
);
