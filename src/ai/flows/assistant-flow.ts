'use server';
/**
 * @fileOverview A conversational AI assistant for the Battleship game.
 *
 * - chatWithAssistant - A function that handles the conversation.
 * - AssistantInput - The input type for the chatWithAssistant function.
 * - AssistantOutput - The return type for the chatWithAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { GameState, Player } from '@/lib/game';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const AssistantInputSchema = z.object({
  gameState: z.any().describe("The entire current game state object. This provides the context for the assistant's response."),
  history: z.array(MessageSchema).describe("The history of the conversation so far."),
});
export type AssistantInput = z.infer<typeof AssistantInputSchema>;

export type AssistantOutput = string;

export async function chatWithAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}

const formatPlayerForPrompt = (player: Player) => {
    return `Player ${player.id} (${player.name}):
- Ships: ${player.ships.length} total, ${player.ships.filter(s => !s.sunk).length} remaining.
- Stats: ${player.stats.hits} hits, ${player.stats.misses} misses.
- Abilities: Sonar (${player.abilities.sonar.uses} left), Tomahawk (${player.abilities.tomahawk.uses} left), Mines (${player.abilities.mine.uses} left).`;
}

const prompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: { schema: AssistantInputSchema },
  output: { format: 'text' },
  prompt: `You are Neo, a friendly and helpful AI assistant for a game of Battleship.
Your goal is to answer the user's questions and provide helpful, concise advice.
NEVER reveal the locations of the opponent's ships. You can see the whole game state, but you must not cheat for the user.
You can give strategic advice, like suggesting areas to search or commenting on their accuracy.

Current Game State:
- Phase: {{gameState.phase}}
- Current Turn: {{gameState.players.[(subtract gameState.currentPlayerId 1)].name}}
- Message: "{{gameState.message}}"
- Game Mode: {{gameState.gameMode}}

Player Details:
{{#each gameState.players as |player|}}
- {{{formatPlayerForPrompt player}}}
{{/each}}

Conversation History:
{{#each history}}
{{role}}: {{content}}
{{/each}}

Based on the game state and conversation history, provide a helpful and friendly response to the latest user message.`,
  
  helpers: {
    subtract: (a: number, b: number) => a - b,
    formatPlayerForPrompt: formatPlayerForPrompt
  }
});

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: AssistantInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    // Add a check to prevent responding to an empty prompt
    if (input.history.length === 0 || input.history[input.history.length - 1].role !== 'user') {
      return "Hello! How can I help you with the game?";
    }
    
    const { output } = await prompt(input);
    return output || "I'm not sure how to respond to that. Try asking about game strategy or your stats!";
  }
);
