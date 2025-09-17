
'use client';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { TripForm } from "@/components/trip/trip-form";
import { useTripStore } from "@/hooks/use-trip-store";
import type { Trip } from "@/lib/types";

export default function EditTripPage() {
    const router = useRouter();
    const params = useParams();
    const { getTripById } = useTripStore();
    const [trip, setTrip] = useState<Trip | undefined>(undefined);
    const [loading, setLoading] = useState(true);

    const id = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        if (id) {
            const foundTrip = getTripById(id);
            if (foundTrip) {
                setTrip(foundTrip);
            } else {
                // Handle case where trip is not found, maybe redirect
                router.push('/app');
            }
        }
        setLoading(false);
    }, [id, getTripById, router]);

    if (loading) {
        return (
             <div className="flex min-h-screen w-full flex-col bg-background">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                    <p>Loading...</p>
                </main>
            </div>
        )
    }

    if (!trip) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-background">
                <Header />
                <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                    <p>Trip not found.</p>
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
