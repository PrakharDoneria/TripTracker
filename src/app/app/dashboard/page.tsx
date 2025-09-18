

'use client';

import { useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { useTripStore } from "@/hooks/use-trip-store";
import { ModeChart } from "@/components/dashboard/mode-chart";
import { FrequentDestinations } from "@/components/dashboard/frequent-destinations";
import { TripSuggestion } from "@/components/dashboard/trip-suggestion";
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileToolbar } from '@/components/layout/mobile-toolbar';

export default function DashboardPage() {
    const { user } = useAuth();
    const { trips, isLoading, fetchTrips } = useTripStore();
    
    useEffect(() => {
        if (user) {
            fetchTrips(user.uid);
        }
    }, [user, fetchTrips]);

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 mb-20 md:mb-0">
                <h2 className="text-3xl font-bold font-headline text-foreground mb-8 text-center">Your Travel Insights</h2>

                {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-64 lg:col-span-3" />
                        <Skeleton className="h-64" />
                        <Skeleton className="h-64" />
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                       <TripSuggestion trips={trips} />
                       <FrequentDestinations trips={trips} />
                       <ModeChart trips={trips} />
                    </div>
                )}
            </main>
            <MobileToolbar />
        </div>
    )
}
