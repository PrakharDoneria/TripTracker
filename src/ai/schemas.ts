/**
 * @fileOverview Shared Zod schemas for AI flows.
 */
import {z} from 'zod';

// Schemas for co2-estimation.ts
const LatLongSchema = z.object({
    latitude: z.number(),
    longitude: z.number(),
});

export const CO2EstimationInputSchema = z.object({
  origin: LatLongSchema,
  destination: LatLongSchema,
  mode: z.enum(['walk', 'bike', 'car', 'bus', 'train']),
});
export type CO2EstimationInput = z.infer<typeof CO2EstimationInputSchema>;

export const CO2EstimationOutputSchema = z.object({
  distanceKm: z.number().describe('The calculated distance in kilometers.'),
  co2Grams: z.number().describe('The estimated CO2 emissions in grams.'),
});
export type CO2EstimationOutput = z.infer<typeof CO2EstimationOutputSchema>;


// Schemas for nudge-for-missing-data.ts
const RecentTripSchema = z.object({
  origin: z.string(),
  destination: z.string(),
  purpose: z.string(),
  time: z.string().describe('ISO 8601 timestamp'),
});

export const NudgeForMissingDataInputSchema = z.object({
  currentLocation: z
    .string()
    .describe('The current location of the user.'),
  possibleDestinations: z
    .array(z.string())
    .describe('A list of possible destinations based on recent activity.'),
  missingInformation: z
    .string()
    .describe('A description of the trip details that are missing (e.g., destination, mode of transport).'),
  recentTripsForContext: z.array(RecentTripSchema).optional().describe('A list of recent trips to provide context for the nudge.'),
});
export type NudgeForMissingDataInput = z.infer<
  typeof NudgeForMissingDataInputSchema
>;

export const NudgeForMissingDataOutputSchema = z.object({
  nudgeMessage: z
    .string()
    .describe('A gentle, location-based question to help the user complete the missing trip information.'),
});
export type NudgeForMissingDataOutput = z.infer<
  typeof NudgeForMissingDataOutputSchema
>;

// Schemas for smart-trip-detection.ts
export const SmartTripDetectionInputSchema = z.object({
  sensorData: z
    .string()
    .describe('Sensor data from the device, including accelerometer and gyroscope data.'),
  locationData: z
    .string()
    .describe('Location data from the device, including latitude, longitude, and accuracy.'),
  time: z.string().describe('The current time.'),
});
export type SmartTripDetectionInput = z.infer<typeof SmartTripDetectionInputSchema>;

export const SmartTripDetectionOutputSchema = z.object({
  modeOfTransportation: z
    .string()
    .describe('The detected mode of transportation (e.g., walking, cycling, driving, public transport).'),
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

// Schemas for ai-trip-recommendation.ts
export const AITripRecommendationInputSchema = z.object({
    origin: z.string().describe("The starting point of the trip."),
    destination: z.string().describe("The destination of the trip."),
    purpose: z.enum(['work', 'leisure', 'errands', 'other']).describe("The purpose of the trip."),
    preferredMode: z.enum(['walk', 'bike', 'car', 'bus', 'train']).describe("The user's preferred mode of transport."),
    trafficConditions: z.string().describe("Current traffic conditions (e.g., light, moderate, heavy)."),
    weatherConditions: z.string().describe("Current weather conditions (e.g., sunny, raining)."),
});
export type AITripRecommendationInput = z.infer<typeof AITripRecommendationInputSchema>;

export const AITripRecommendationOutputSchema = z.object({
    recommendedMode: z.enum(['walk', 'bike', 'car', 'bus', 'train']).describe("The recommended mode of transportation."),
    reason: z.string().describe("The reason for the recommendation."),
});
export type AITripRecommendationOutput = z.infer<typeof AITripRecommendationOutputSchema>;


// Schemas for suggest-hidden-gem.ts
export const SuggestHiddenGemInputSchema = z.object({
    destinationName: z.string().describe("The name of the destination city or area."),
    destinationCoords: LatLongSchema.describe("The geographic coordinates of the destination."),
    tripPurpose: z.enum(['work', 'leisure', 'errands', 'other']).describe("The purpose of the trip to provide context."),
});
export type SuggestHiddenGemInput = z.infer<typeof SuggestHiddenGemInputSchema>;

export const SuggestHiddenGemOutputSchema = z.object({
    name: z.string().describe("The name of the suggested hidden gem."),
    category: z.string().describe("The category of the place (e.g., Café, Park, Museum, Viewpoint)."),
    reason: z.string().describe("A short, compelling reason why the user should visit this place, tailored to their trip context."),
});
export type SuggestHiddenGemOutput = z.infer<typeof SuggestHiddenGemOutputSchema>;

// Schemas for suggest-next-trip.ts
export const SuggestNextTripInputSchema = z.object({
  recentTrips: z.array(RecentTripSchema).describe('A list of the last 5 trips to provide context for the suggestion.'),
  currentLocation: z.string().optional().describe('The user\'s current location, if available.'),
});
export type SuggestNextTripInput = z.infer<typeof SuggestNextTripInputSchema>;

export const SuggestNextTripOutputSchema = z.object({
  suggestedDestination: z.string().describe("The suggested destination for the next trip."),
  suggestedPurpose: z.string().describe("The suggested purpose for the next trip (e.g., work, leisure, errands)."),
  reason: z.string().describe("A short, compelling reason for the suggestion based on the user's travel patterns."),
});
export type SuggestNextTripOutput = z.infer<typeof SuggestNextTripOutputSchema>;
