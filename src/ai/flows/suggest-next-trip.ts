
'use server';
/**
 * @fileOverview An AI flow to suggest the user's next trip based on their history.
 *
 * - suggestNextTrip - A function that provides a trip suggestion.
 */

import { ai } from '@/ai/genkit';
import { SuggestNextTripInputSchema, type SuggestNextTripInput, SuggestNextTripOutputSchema, type SuggestNextTripOutput } from '@/ai/schemas';

export async function suggestNextTrip(
  input: SuggestNextTripInput
): Promise<SuggestNextTripOutput> {
  return suggestNextTripFlow(input);
}


const nextTripPrompt = ai.definePrompt({
    name: 'nextTripPrompt',
    input: { schema: SuggestNextTripInputSchema },
    output: { schema: SuggestNextTripOutputSchema },
    prompt: `You are an intelligent travel assistant that predicts a user's next move. Your goal is to analyze their recent travel history to suggest a new, interesting, and relevant trip, encouraging them to discover new places.

Analyze the user's last 5 trips to identify patterns, but prioritize suggesting something new. Look for:
- Recurring destinations to understand habits (e.g., 'Office' on weekdays).
- Common trip purposes (e.g., 'leisure' on weekends).
- Types of places they visit (e.g., parks, cafes, museums).

User's last 5 trips:
{{#if recentTrips}}
{{#each recentTrips}}
- From {{{this.origin}}} to {{{this.destination}}} for "{{{this.purpose}}}" at {{{this.time}}}.
{{/each}}
{{else}}
No recent trip data available.
{{/if}}

{{#if currentLocation}}
The user is currently at: {{{currentLocation}}}
{{/if}}

Based on these patterns, suggest a *new destination* that the user has not visited recently but might enjoy. For example, if they often visit 'City Park', suggest a different park like 'Riverside Gardens'. If they frequent cafes, suggest a new, highly-rated cafe in a different neighborhood.

Your suggestion should include a new destination, a likely purpose, and a short, friendly reason that shows you understand their habits while encouraging exploration.

Example Reasoning:
- "You visit parks a lot on weekends. How about exploring the beautiful 'Hillside Nature Reserve' this Saturday?"
- "I see you enjoy trying different coffee shops. I'd recommend 'The Corner Grind', a popular local spot you haven't been to yet."
- "Since you often run errands in the city center, maybe check out the 'Artisan Market' nearby for a change of pace."

Generate a single, highly relevant suggestion for a new experience. Avoid suggesting a trip they have taken in their last 5 trips.
`,
});


const suggestNextTripFlow = ai.defineFlow(
  {
    name: 'suggestNextTripFlow',
    inputSchema: SuggestNextTripInputSchema,
    outputSchema: SuggestNextTripOutputSchema,
  },
  async (input) => {
    const { output } = await nextTripPrompt(input);
    return output!;
  }
);
