
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
    prompt: `You are an intelligent travel assistant that predicts a user's next move. Your goal is to analyze their recent travel history and suggest their next trip in a way that feels personal and predictive.

Analyze the user's last 5 trips to identify patterns. Look for:
- Recurring destinations (e.g., always goes to 'Office' on weekday mornings).
- Common trip purposes (e.g., frequent 'errands' on weekends).
- Sequences of trips (e.g., 'Gym' then 'Cafe').
- Time-based habits (e.g., 'Park' on Sunday afternoons).

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

Based on these patterns, suggest the most likely next trip. Your suggestion should include a destination, a purpose, and a short, friendly reason that shows you understand their habits.

Example Reasoning:
- "Since it's a weekday morning, I'm guessing you're heading to the Office for work."
- "You've been to the Gym a lot lately. Time for another session?"
- "After your morning errands, how about a relaxing stop at the 'City Cafe' like you sometimes do?"

Generate a single, highly relevant suggestion. If there isn't a strong pattern, you can make a more general suggestion based on the most frequent activity.
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
