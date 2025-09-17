
'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { TripForm } from "@/components/trip/trip-form";
import { useTripStore } from "@/hooks/use-trip-store";
import type { Trip } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

export default function EditTripPage() {
    const router = useRouter();
    const params = useParams();
    const { getTripById, fetchTrips, trips } = useTripStore();
    const { user } = useAuth();
    const [trip, setTrip] = useState<Trip | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        const loadTrip = async () => {
            if (user && trips.length === 0) {
                await fetchTrips(user.uid);
            }
        }
        loadTrip();
    }, [user, fetchTrips, trips.length]);

    useEffect(() => {
        if (id && trips.length > 0) {
            const foundTrip = getTripById(id);
            if (foundTrip) {
                setTrip(foundTrip);
            } else {
                // Handle case where trip is not found
                console.warn(`Trip with id ${id} not found, redirecting.`);
                router.push('/app');
            }
             setLoading(false);
        } else if (trips.length > 0) {
             setLoading(false);
        }
    }, [id, getTripById, router, trips]);

    if (loading) {
        return (
             <div className="flex min-h-screen w-full flex-col bg-background">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                    <p>Loading trip details...</p>
                </main>
            </div>
        )
    }

    if (!trip) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-background">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                    <p>Trip not found. You may not have access or it may have been deleted.</p>
                </main>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold mb-4 font-headline text-foreground">Edit Trip</h2>
                    <TripForm trip={trip} />
                </div>
            </main>
        </div>
    )
}
