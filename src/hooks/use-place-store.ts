
'use client';
import { create } from 'zustand';
import type { Place } from '@/lib/types';
import {
    addPlaceToFirestore,
    getPlacesFromFirestore,
} from '@/lib/firestore';

interface PlaceState {
  places: Place[];
  isLoading: boolean;
  fetchPlaces: (userId: string) => Promise<void>;
  addPlace: (place: Omit<Place, 'id'>) => Promise<void>;
}

export const usePlaceStore = create<PlaceState>()((set, get) => ({
    places: [],
    isLoading: true,
    fetchPlaces: async (userId) => {
        if (get().places.length > 0 && !get().isLoading) {
            return;
        }
        set({ isLoading: true });
        try {
            const places = await getPlacesFromFirestore(userId);
            set({ places, isLoading: false });
        } catch (error) {
            console.error("Error fetching places:", error);
            set({ isLoading: false });
        }
    },
    addPlace: async (place) => {
        const newPlaceId = await addPlaceToFirestore(place);
        const newPlace = { ...place, id: newPlaceId };
        set((state) => ({
            places: [newPlace, ...state.places],
        }));
    },
}));
