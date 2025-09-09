'use client';

import { useState } from 'react';
import { Header } from "@/components/layout/header";
import { TripForm } from "@/components/trip/trip-form";
import dynamic from "next/dynamic";
import type { Destination } from '@/lib/location';

const MapView = dynamic(() => import('@/components/map/map'), {
  loading: () => <div className="h-[400px] bg-muted rounded-lg animate-pulse" />,
  ssr: false
});

export default function NewTripPage() {
  const [origin, setOrigin] = useState<Destination | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);

  const destinations = [origin, destination].filter(Boolean) as Destination[];

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-2">
            <div>
                <div className="sticky top-20">
                    <h2 className="text-2xl font-bold mb-4 font-headline text-foreground">Record a New Trip</h2>
                    <TripForm 
                        onOriginChange={setOrigin}
                        onDestinationChange={setDestination}
                    />
                </div>
            </div>
            <div className="rounded-lg overflow-hidden h-[400px] lg:h-auto lg:max-h-[calc(100vh-8rem)]">
                <MapView 
                    destinations={destinations}
                    userLocation={null} // We don't need live location here
                />
            </div>
        </div>
      </main>
    </div>
  )
}
