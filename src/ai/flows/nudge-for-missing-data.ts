'use server';
/**
 * @fileOverview A flow to generate travel nudges when trip details are missing.
 *
 * - nudgeForMissingData - A function that generates a travel nudge.
 */

import {ai} from '@/ai/genkit';
import { NudgeForMissingDataInputSchema, type NudgeForMissingDataInput, NudgeForMissingDataOutputSchema, type NudgeForMissingDataOutput } from '@/ai/schemas';

export async function nudgeForMissingData(
  input: NudgeForMissingDataInput
): Promise<NudgeForMissingDataOutput> {
  return nudgeForMissingDataFlow(input);
}

const nudgePrompt = ai.definePrompt({
  name: 'nudgePrompt',
  input: {schema: NudgeForMissingDataInputSchema},
  output: {schema: NudgeForMissingDataOutputSchema},
  prompt: `You are a helpful and intuitive travel assistant. Your goal is to help the user record their trips by providing gentle, contextual nudges.

The user is currently at: {{{currentLocation}}}
You are missing the following trip information: {{{missingInformation}}}

Based on their recent activity, here are some possible destinations:
{{#each possibleDestinations}}
- {{{this}}}
{{/each}}

Here is some context from their recent trips:
{{#if recentTripsForContext}}
{{#each recentTripsForContext}}
- From {{{this.origin}}} to {{{this.destination}}} for "{{{this.purpose}}}" at {{{this.time}}}
{{/each}}
{{else}}
No recent trip data available.
{{/if}}

Please generate a single, gentle, location-based nudge phrased as a question to help the user complete the missing trip information. The nudge should feel personal and intelligent, using the context provided.

Example ideas:
- If it's a weekday morning and they often go to 'Office': "Good morning! Are you heading to the Office for work?"
- If they've recently been to the 'Gym' a few times: "Ready for another workout? Heading to the Gym?"
- A generic but friendly option: "Starting a new journey from {{currentLocation}}? Where are you off to?"

Generate the most relevant and helpful nudge based on all the provided context.
`,
});

const nudgeForMissingDataFlow = ai.defineFlow(
  {
    name: 'nudgeForMissingDataFlow',
    inputSchema: NudgeForMissingDataInputSchema,
    outputSchema: NudgeForMissingDataOutputSchema,
  },
  async input => {
    const {output} = await nudgePrompt(input);
    return output!;
  }
);
