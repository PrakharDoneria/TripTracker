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
    .describe(
      'A description of the trip details that are missing (e.g., destination, mode of transport).'
    ),
  recentTripsForContext: z.array(RecentTripSchema).optional().describe('A list of recent trips to provide context for the nudge.'),
});
export type NudgeForMissingDataInput = z.infer<
  typeof NudgeForMissingDataInputSchema
>;

export const NudgeForMissingDataOutputSchema = z.object({
  nudgeMessage: z
    .string()
    .describe(
      'A gentle, location-based question to help the user complete the missing trip information.'
    ),
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
