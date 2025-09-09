'use server';
/**
 * @fileOverview An AI flow to suggest a "hidden gem" near a destination.
 *
 * - suggestHiddenGem - A function that provides a hidden gem recommendation.
 */

import { ai } from '@/ai/genkit';
import { SuggestHiddenGemInputSchema, type SuggestHiddenGemInput, SuggestHiddenGemOutputSchema, type SuggestHiddenGemOutput } from '@/ai/schemas';


export async function suggestHiddenGem(
  input: SuggestHiddenGemInput
): Promise<SuggestHiddenGemOutput> {
  return suggestHiddenGemFlow(input);
}


const hiddenGemPrompt = ai.definePrompt({
    name: 'hiddenGemPrompt',
    input: { schema: SuggestHiddenGemInputSchema },
    output: { schema: SuggestHiddenGemOutputSchema },
    prompt: `You are a savvy travel guide who specializes in finding authentic, off-the-beaten-path local gems. Your goal is to help travelers discover unique places instead of just the usual tourist traps.

The user is traveling to: {{{destinationName}}}.
The purpose of their trip is: {{{tripPurpose}}}.

Based on this information, suggest one "hidden gem" nearby. This could be a small café, a quiet park with a great view, a unique local shop, a lesser-known museum, or an interesting piece of street art.

Prioritize places that offer an authentic local experience. Avoid major tourist attractions.

Provide the name of the place, its category (e.g., Café, Park, Museum, Viewpoint), and a short, compelling reason why the user should visit, tailored to their trip purpose. For example, if they are on a work trip, suggest a quiet place to unwind. If it's a leisure trip, suggest something more adventurous or unique.
`,
});


const suggestHiddenGemFlow = ai.defineFlow(
  {
    name: 'suggestHiddenGemFlow',
    inputSchema: SuggestHiddenGemInputSchema,
    outputSchema: SuggestHiddenGemOutputSchema,
  },
  async (input) => {
    const { output } = await hiddenGemPrompt(input);
    return output!;
  }
);
