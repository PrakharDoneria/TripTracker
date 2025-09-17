
'use client';
import { create } from 'zustand';
import type { Business } from '@/lib/types';
import {
    addBusinessToFirestore,
    getBusinessesFromFirestore,
} from '@/lib/firestore';

interface BusinessState {
  businesses: Business[];
  isLoading: boolean;
  fetchBusinesses: () => Promise<void>;
  addBusiness: (business: Omit<Business, 'id'>) => Promise<void>;
}

export const useBusinessStore = create<BusinessState>()((set, get) => ({
    businesses: [],
    isLoading: true,
    fetchBusinesses: async () => {
        if (get().businesses.length > 0 && !get().isLoading) {
            return;
        }
        set({ isLoading: true });
        try {
            const businesses = await getBusinessesFromFirestore();
            set({ businesses: businesses as Business[], isLoading: false });
        } catch (error) {
            console.error("Error fetching businesses:", error);
            set({ isLoading: false });
        }
    },
    addBusiness: async (business) => {
        const newBusinessId = await addBusinessToFirestore(business);
        const newBusiness = { ...business, id: newBusinessId };
        set((state) => ({
            businesses: [newBusiness, ...state.businesses],
        }));
    },
}));
