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
import type { GameState, Player, Message } from '@/lib/game';


const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

// The input schema for the prompt itself, after data has been processed.
const InternalAssistantInputSchema = z.object({
  gameState: z.any().describe("The entire current game state object."),
  history: z.array(MessageSchema).describe("The history of the conversation so far."),
  formattedPlayers: z.array(z.string()).describe("Pre-formatted strings describing each player's status.")
});

// The input schema for the exported function, which takes the raw game state.
export type AssistantInput = {
  gameState: GameState;
  history: Message[];
};

export type AssistantOutput = string;

export async function chatWithAssistant(input: AssistantInput): Promise<AssistantOutput> {
  return assistantFlow(input);
}

const formatPlayerForPrompt = (player: Player): string => {
    return `Player ${player.id} (${player.name}):
- Ships: ${player.ships.length} total, ${player.ships.filter(s => !s.sunk).length} remaining.
- Stats: ${player.stats.hits} hits, ${player.stats.misses} misses.
- Abilities: Sonar (${player.abilities.sonar.uses} left), Tomahawk (${player.abilities.tomahawk.uses} left), Mines (${player.abilities.mine.uses} left).`;
}

const prompt = ai.definePrompt({
  name: 'assistantPrompt',
  input: { schema: InternalAssistantInputSchema },
  output: { format: 'text' },
  prompt: `You are Neo, a friendly and helpful AI assistant for a game of Battleship.
Your goal is to provide engaging and helpful conversation. You can answer questions about the game rules, comment on the current state of the game, or just chat with the user.
**Crucially, you must NEVER reveal the locations of the opponent's ships.** You have access to the entire game state for context, but you must not use this information to cheat for the user.
You can offer encouragement, comment on impressive hits or unfortunate misses, and discuss the player's stats, but avoid giving direct strategic commands like "fire at C5".

Current Game State:
- Phase: {{gameState.phase}}
- Current Turn: {{gameState.players.[(subtract gameState.currentPlayerId 1)].name}}
- Message: "{{gameState.message}}"
- Game Mode: {{gameState.gameMode}}

Player Details:
{{#each formattedPlayers as |playerString|}}
- {{{playerString}}}
{{/each}}

Conversation History:
{{#each history}}
{{role}}: {{content}}
{{/each}}

Based on the game state and conversation history, provide a helpful and friendly response to the latest user message.`,
  helpers: {
    subtract: (a: number, b: number) => a - b,
  }
});

const assistantFlow = ai.defineFlow(
  {
    name: 'assistantFlow',
    inputSchema: z.any(),
    outputSchema: z.string(),
  },
  async (input: AssistantInput) => {
    if (input.history.length === 0 || input.history[input.history.length - 1].role !== 'user') {
      return "Hello! How can I help you with the game?";
    }
    
    // Pre-process the player data here
    const formattedPlayers = input.gameState.players.map(formatPlayerForPrompt);

    const { output } = await prompt({
        ...input,
        formattedPlayers,
    });
    
    return output || "I'm not sure how to respond to that. Try asking about game strategy or your stats!";
  }
);
