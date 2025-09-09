'use client';
import { Header } from "@/components/layout/header";
import { useTripStore } from "@/hooks/use-trip-store";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect } from "react";
import type { Destination, GeoLocation } from "@/lib/location";

const MapView = dynamic(() => import('@/components/map/map'), {
  loading: () => <p>A map is loading...</p>,
  ssr: false
});

export default function MapPage() {
  const { trips } = useTripStore();
  const [liveUserLocation, setLiveUserLocation] = useState<GeoLocation | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setLiveUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Fallback or default location if permission is denied
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }
  }, []);

  const destinations: Destination[] = useMemo(() => {
    return trips.map(trip => ({
        latitude: trip.destinationCoords?.lat || 0,
        longitude: trip.destinationCoords?.lon || 0,
        name: trip.destination
    })).filter(d => d.latitude !== 0 && d.longitude !== 0);
  }, [trips]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <MapView 
            userLocation={liveUserLocation}
            destinations={destinations}
        />
      </main>
    </div>
  );
}
