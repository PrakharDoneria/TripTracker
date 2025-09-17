
'use client';
import { create } from 'zustand';
import type { Trip, TripParticipant } from '@/lib/types';
import {
    addTripToFirestore,
    updateTripInFirestore,
    deleteTripFromFirestore,
    getTripsFromFirestore,
} from '@/lib/firestore';

interface TripState {
  trips: Trip[];
  isLoading: boolean;
  fetchTrips: (userId: string) => Promise<void>;
  addTrip: (trip: Omit<Trip, 'id'>) => Promise<void>;
  updateTrip: (id: string, updatedTrip: Partial<Omit<Trip, 'id'>>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  getTripById: (id: string) => Trip | undefined;
  clearTrips: () => void;
}

export const useTripStore = create<TripState>()((set, get) => ({
    trips: [],
    isLoading: true,
    fetchTrips: async (userId) => {
        set({ isLoading: true });
        try {
            const trips = await getTripsFromFirestore(userId);
            set({ trips: trips as Trip[], isLoading: false });
        } catch (error) {
            console.error("Error fetching trips:", error);
            set({ isLoading: false });
        }
    },
    addTrip: async (trip) => {
        const newTripId = await addTripToFirestore(trip);
        const newTrip = { ...trip, id: newTripId };
        set((state) => ({
            trips: [newTrip, ...state.trips].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
        }));
    },
    updateTrip: async (id, updatedTripData) => {
        await updateTripInFirestore(id, updatedTripData);
        set((state) => ({
            trips: state.trips.map((trip) =>
                trip.id === id ? { ...trip, ...updatedTripData, id } : trip
            ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()),
        }));
    },
    deleteTrip: async (id) => {
        // Note: For shared trips, you might want different logic,
        // e.g., only the creator can delete, or a user can "leave" a trip.
        // For now, we'll implement a hard delete.
        await deleteTripFromFirestore(id);
        set((state) => ({
            trips: state.trips.filter((trip) => trip.id !== id),
        }));
    },
    getTripById: (id) => get().trips.find((trip) => trip.id === id),
    clearTrips: () => set({ trips: [], isLoading: true }),
}));
