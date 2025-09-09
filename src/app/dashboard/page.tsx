'use client';

import { Header } from "@/components/layout/header";
import { useTripStore } from "@/hooks/use-trip-store";
import { ModeChart } from "@/components/dashboard/mode-chart";
import { FrequentDestinations } from "@/components/dashboard/frequent-destinations";
import { TripSuggestion } from "@/components/dashboard/trip-suggestion";

export default function DashboardPage() {
    const { trips } = useTripStore();
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                <h2 className="text-2xl font-bold font-headline text-foreground mb-6">My Travel Dashboard</h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <TripSuggestion trips={trips} />
                    <ModeChart trips={trips} />
                    <FrequentDestinations trips={trips} />
                </div>
            </main>
        </div>
    )
}
