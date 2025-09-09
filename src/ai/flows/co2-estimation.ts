'use server';
/**
 * @fileOverview A flow to estimate CO2 emissions for a trip.
 *
 * - estimateCO2 - A function that calculates the CO2 emissions.
 */

import { ai } from '@/ai/genkit';
import { CO2EstimationInputSchema, type CO2EstimationInput, CO2EstimationOutputSchema, type CO2EstimationOutput } from '@/ai/schemas';

// Based on various sources, simplified for demonstration. Units: gCO2e/km
const EMISSION_FACTORS_G_PER_KM = {
    walk: 0,
    bike: 0,
    car: 171, // Average for a medium petrol car
    bus: 105, // Average occupancy
    train: 41, // National rail average
};

// Haversine formula to calculate distance between two lat/lon points
function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}


export async function estimateCO2(
  input: CO2EstimationInput
): Promise<CO2EstimationOutput> {
  return estimateCO2Flow(input);
}

const estimateCO2Flow = ai.defineFlow(
  {
    name: 'estimateCO2Flow',
    inputSchema: CO2EstimationInputSchema,
    outputSchema: CO2EstimationOutputSchema,
  },
  async (input) => {
    const distanceKm = getDistanceInKm(
        input.origin.latitude,
        input.origin.longitude,
        input.destination.latitude,
        input.destination.longitude
    );

    const emissionFactor = EMISSION_FACTORS_G_PER_KM[input.mode];
    const co2Grams = distanceKm * emissionFactor;

    return {
      distanceKm,
      co2Grams,
    };
  }
);
