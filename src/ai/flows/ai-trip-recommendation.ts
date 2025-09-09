'use server';
/**
 * @fileOverview An AI flow to provide trip recommendations.
 *
 * - getAITripRecommendation - A function that provides a trip recommendation.
 */

import { ai } from '@/ai/genkit';
import { AITripRecommendationInputSchema, type AITripRecommendationInput, AITripRecommendationOutputSchema, type AITripRecommendationOutput } from '@/ai/schemas';


export async function getAITripRecommendation(
  input: AITripRecommendationInput
): Promise<AITripRecommendationOutput> {
  return getAITripRecommendationFlow(input);
}


const recommendationPrompt = ai.definePrompt({
    name: 'recommendationPrompt',
    input: { schema: AITripRecommendationInputSchema },
    output: { schema: AITripRecommendationOutputSchema },
    prompt: `You are a smart travel assistant. Your goal is to recommend the best mode of transportation for a trip.

Analyze the user's trip details:
- Origin: {{{origin}}}
- Destination: {{{destination}}}
- Purpose: {{{purpose}}}
- Preferred Mode: {{{preferredMode}}}

And consider the real-time conditions:
- Current Traffic: {{{trafficConditions}}}
- Current Weather: {{{weatherConditions}}}

Based on all this information, recommend the best mode of transportation. The recommendation should be one of 'walk', 'bike', 'car', 'bus', or 'train'.

Provide a concise reason for your recommendation, explaining why it's the best choice given the context. For example, if the weather is bad, you might suggest avoiding walking or biking. If traffic is heavy, public transport might be better than a car. If the purpose is leisure, a scenic route might be nice.

If the user's preferred mode is already the best option, affirm their choice and explain why it's a good one.
`,
});


const getAITripRecommendationFlow = ai.defineFlow(
  {
    name: 'getAITripRecommendationFlow',
    inputSchema: AITripRecommendationInputSchema,
    outputSchema: AITripRecommendationOutputSchema,
  },
  async (input) => {
    // In a real app, you would fetch real-time traffic and weather data here.
    // For this demo, we'll use mock data.
    const mockTraffic = 'moderate';
    const mockWeather = 'clear and sunny';

    const { output } = await recommendationPrompt({
        ...input,
        trafficConditions: mockTraffic,
        weatherConditions: mockWeather,
    });

    return output!;
  }
);

