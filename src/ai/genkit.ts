import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This is a workaround for Next.js hot-reloading in development.
// It ensures that the Genkit AI instance is only created once.
const AI_INSTANCE = Symbol.for('ai.instance');

function getAI() {
  if (!(global as any)[AI_INSTANCE]) {
    (global as any)[AI_INSTANCE] = genkit({
      plugins: [googleAI({apiVersion: 'v1beta'})],
      model: 'googleai/gemini-2.0-flash',
    });
  }
  return (global as any)[AI_INSTANCE];
}

export const ai = getAI();
