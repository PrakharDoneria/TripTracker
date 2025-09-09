'use server';

/**
 * @fileOverview Smart trip detection flow using sensor data and location to infer mode of transportation.
 *
 * - smartTripDetection - A function that intelligently detects the mode of transportation.
 * - SmartTripDetectionInput - The input type for the smartTripDetection function.
 * - SmartTripDetectionOutput - The return type for the smartTripDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartTripDetectionInputSchema = z.object({
  sensorData: z
    .string()
    .describe('Sensor data from the device, including accelerometer and gyroscope data.'),
  locationData: z
    .string()
    .describe('Location data from the device, including latitude, longitude, and accuracy.'),
  time: z.string().describe('The current time.'),
});
export type SmartTripDetectionInput = z.infer<typeof SmartTripDetectionInputSchema>;

const SmartTripDetectionOutputSchema = z.object({
  modeOfTransportation: z
    .string()
    .describe(
      'The detected mode of transportation (e.g., walking, cycling, driving, public transport).' 
    ),
  confidence: z
    .number()
    .describe('The confidence level of the detected mode of transportation (0-1).'),
  needUserConfirmation: z
    .boolean()
    .describe('Whether user confirmation is needed due to low confidence.'),
  suggestedNudge: z
    .string()
    .optional()
    .describe('A location-based travel nudge when the trip can\'t be determined confidently.'),
});
export type SmartTripDetectionOutput = z.infer<typeof SmartTripDetectionOutputSchema>;

export async function smartTripDetection(input: SmartTripDetectionInput): Promise<SmartTripDetectionOutput> {
  return smartTripDetectionFlow(input);
}

const smartTripDetectionPrompt = ai.definePrompt({
  name: 'smartTripDetectionPrompt',
  input: {schema: SmartTripDetectionInputSchema},
  output: {schema: SmartTripDetectionOutputSchema},
  prompt: `You are an AI assistant specialized in detecting the mode of transportation using sensor and location data.

  Analyze the provided sensor data, location data, and time to determine the most likely mode of transportation.

  Sensor Data: {{{sensorData}}}
  Location Data: {{{locationData}}}
  Time: {{{time}}}

  Consider the accuracy of the location data and the patterns in the sensor data to estimate the mode of transportation and the confidence level.

  If the confidence level is low (below 0.7), set needUserConfirmation to true and provide a location-based travel nudge to help the user confirm their trip details.
  Otherwise, set needUserConfirmation to false and leave suggestedNudge blank.

  Example Nudges:
  - "Are you currently on the bus towards downtown?"
  - "Are you driving on the highway?"
  - "Are you walking in a park?"

  Ensure the modeOfTransportation aligns with common transportation methods and the confidence level reflects the certainty of your assessment.
  If you are unsure, suggest 'unknown'. Return a JSON response.
  `,
});

const smartTripDetectionFlow = ai.defineFlow(
  {
    name: 'smartTripDetectionFlow',
    inputSchema: SmartTripDetectionInputSchema,
    outputSchema: SmartTripDetectionOutputSchema,
  },
  async input => {
    const {output} = await smartTripDetectionPrompt(input);
    return output!;
  }
);
