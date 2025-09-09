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
    prompt: `You are a smart, eco-conscious travel assistant. Your primary goal is to recommend the most sustainable and efficient mode of transportation for a trip, making sustainability the default choice.

Analyze the user's trip details:
- Origin: {{{origin}}}
- Destination: {{{destination}}}
- Purpose: {{{purpose}}}
- User's Preferred Mode (for context): {{{preferredMode}}}

And consider the real-time conditions:
- Current Traffic: {{{trafficConditions}}}
- Current Weather: {{{weatherConditions}}}

Based on all this information, recommend the best mode of transportation. Prioritize walking, biking, and public transport (bus, train) over driving a car, unless driving is significantly more practical or necessary given the distance, purpose, or weather. The recommendation should be one of 'walk', 'bike', 'car', 'bus', or 'train'.

Provide a concise reason for your recommendation, explaining why it's the best choice from both an efficiency and sustainability perspective. For example, if the weather is good and the distance is short, strongly recommend walking or biking and mention the environmental benefits. If traffic is heavy, highlight how public transport saves time and reduces emissions.

If the user's preferred mode is already the most sustainable and practical option, affirm their choice and explain why it's a great one.
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
