'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Trip } from '@/lib/types';

const initialTrips: Trip[] = [
  {
    id: '1',
    origin: 'NATPAC, Akkulam',
    destination: 'Technopark',
    startTime: new Date(new Date().setDate(new Date().getDate() - 1)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(new Date().getHours() + 1)),
    mode: 'car',
    companions: 1,
    originCoords: { lat: 8.535, lon: 76.906 },
    destinationCoords: { lat: 8.556, lon: 76.882 },
  },
  {
    id: '2',
    origin: 'Home',
    destination: 'Office',
    startTime: new Date(new Date().setDate(new Date().getDate() - 2)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(new Date().getHours() + 1)),
    mode: 'bus',
    companions: 0,
    originCoords: { lat: 8.5241, lon: 76.9366 },
    destinationCoords: { lat: 8.556, lon: 76.882 },
  },
];

interface TripState {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id'>) => void;
}

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({
      trips: initialTrips,
      addTrip: (trip) =>
        set((state) => ({
          trips: [{ ...trip, id: crypto.randomUUID() }, ...state.trips],
        })),
    }),
    {
      name: 'trip-storage', 
      storage: createJSONStorage(() => localStorage, {
        serializer: {
          stringify: (obj) => JSON.stringify(obj, (key, value) => {
            if (value instanceof Date) {
              return value.toISOString();
            }
            return value;
          }),
          parse: (str) => {
            const parsed = JSON.parse(str);
            if (parsed.state && Array.isArray(parsed.state.trips)) {
              parsed.state.trips = parsed.state.trips.map((trip: any) => ({
                ...trip,
                startTime: new Date(trip.startTime),
                endTime: new Date(trip.endTime),
              }));
            }
            return parsed;
          },
        },
      }),
    }
  )
)
