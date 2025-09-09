'use client';
import { Header } from "@/components/layout/header";
import { useTripStore } from "@/hooks/use-trip-store";
import dynamic from "next/dynamic";
import { useMemo } from "react";
import type { Trip } from "@/lib/types";
import type { Destination } from "@/lib/location";

const MapView = dynamic(() => import('@/components/map/map'), {
  loading: () => <p>A map is loading...</p>,
  ssr: false
});

export default function MapPage() {
  const { trips } = useTripStore();

  const destinations: Destination[] = useMemo(() => {
    return trips.map(trip => ({
        latitude: trip.destinationCoords?.lat || 0,
        longitude: trip.destinationCoords?.lon || 0,
        name: trip.destination
    })).filter(d => d.latitude !== 0);
  }, [trips]);

  const userLocation = useMemo(() => {
    if (trips.length > 0 && trips[0].originCoords) {
        return {
            latitude: trips[0].originCoords.lat,
            longitude: trips[0].originCoords.lon
        }
    }
    return null;
  }, [trips])

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <MapView 
            userLocation={userLocation}
            destinations={destinations}
        />
      </main>
    </div>
  );
}
