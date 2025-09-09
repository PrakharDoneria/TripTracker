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
    purpose: 'work',
    notes: 'Meeting with the client',
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
    purpose: 'work',
    companions: 0,
    originCoords: { lat: 8.5241, lon: 76.9366 },
    destinationCoords: { lat: 8.556, lon: 76.882 },
  },
];

interface TripState {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (id: string, updatedTrip: Omit<Trip, 'id'>) => void;
  deleteTrip: (id: string) => void;
  getTripById: (id: string) => Trip | undefined;
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: initialTrips,
      addTrip: (trip) =>
        set((state) => ({
          trips: [{ ...trip, id: crypto.randomUUID() }, ...state.trips],
        })),
      updateTrip: (id, updatedTrip) =>
        set((state) => ({
            trips: state.trips.map((trip) =>
                trip.id === id ? { ...trip, ...updatedTrip, id } : trip
            ),
        })),
      deleteTrip: (id) =>
        set((state) => ({
            trips: state.trips.filter((trip) => trip.id !== id),
        })),
      getTripById: (id) => get().trips.find((trip) => trip.id === id),
    }),
    {
      name: 'trip-storage', 
      storage: createJSONStorage(() => localStorage, {
        reviver: (key, value) => {
          if (key === 'startTime' || key === 'endTime') {
            return new Date(value as string);
          }
          return value;
        },
      }),
    }
  )
)
