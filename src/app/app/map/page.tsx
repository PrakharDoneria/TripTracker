
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

// Haversine formula to calculate distance between two lat/lon points in meters
function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius of the Earth in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in meters
}

export default function MapPage() {
  const { trips } = useTripStore();
  const [liveUserLocation, setLiveUserLocation] = useState<GeoLocation | null>(null);
  const notifiedPlaces = useMemo(() => new Set<string>(), []);

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const newLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLiveUserLocation(newLocation);
          
          // Check for nearby "nice places"
          const nicePlaceDests = trips.filter(trip => trip.isNicePlace);
          nicePlaceDests.forEach(trip => {
            if (trip.destinationCoords && !notifiedPlaces.has(trip.id)) {
              const distance = getDistanceInMeters(
                newLocation.latitude,
                newLocation.longitude,
                trip.destinationCoords.lat,
                trip.destinationCoords.lon
              );

              // Vibrate if user is within 200 meters and hasn't been notified yet
              if (distance < 200) {
                if ('vibrate' in navigator) {
                  navigator.vibrate([200, 100, 200]); // Vibrate pattern
                }
                notifiedPlaces.add(trip.id); // Mark as notified
              }
            }
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
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
  }, [trips, notifiedPlaces]);

  const destinations: Destination[] = useMemo(() => {
    return trips.map(trip => ({
        latitude: trip.destinationCoords?.lat || 0,
        longitude: trip.destinationCoords?.lon || 0,
        name: trip.destination,
        isNicePlace: trip.isNicePlace,
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
