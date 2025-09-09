'use server';
/**
 * @fileOverview A flow to generate travel nudges when trip details are missing.
 *
 * - nudgeForMissingData - A function that generates a travel nudge.
 * - NudgeForMissingDataInput - The input type for the nudgeForMissingData function.
 * - NudgeForMissingDataOutput - The return type for the nudgeForMissingData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NudgeForMissingDataInputSchema = z.object({
  currentLocation: z
    .string()
    .describe('The current location of the user.'),
  possibleDestinations: z
    .array(z.string())
    .describe('A list of possible destinations based on recent activity.'),
  missingInformation: z
    .string()
    .describe(
      'A description of the trip details that are missing (e.g., destination, mode of transport).'
    ),
});
export type NudgeForMissingDataInput = z.infer<
  typeof NudgeForMissingDataInputSchema
>;

const NudgeForMissingDataOutputSchema = z.object({
  nudgeMessage: z
    .string()
    .describe(
      'A gentle, location-based question to help the user complete the missing trip information.'
    ),
});
export type NudgeForMissingDataOutput = z.infer<
  typeof NudgeForMissingDataOutputSchema
>;

export async function nudgeForMissingData(
  input: NudgeForMissingDataInput
): Promise<NudgeForMissingDataOutput> {
  return nudgeForMissingDataFlow(input);
}

const nudgePrompt = ai.definePrompt({
  name: 'nudgePrompt',
  input: {schema: NudgeForMissingDataInputSchema},
  output: {schema: NudgeForMissingDataOutputSchema},
  prompt: `You are a helpful travel assistant. The user is currently at {{{currentLocation}}}. You are missing {{{missingInformation}}}. Based on their recent activity, possible destinations include: {{#each possibleDestinations}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}. Please generate a gentle, location-based nudge to help the user complete the missing trip information. The nudge should be phrased as a question.
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
