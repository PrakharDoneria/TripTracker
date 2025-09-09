'use client';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Trip } from '@/lib/types';

const initialTrips: Trip[] = [];

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
