'use client';

import { useState, useMemo, useEffect } from 'react';
import { Header } from "@/components/layout/header";
import { TripForm } from "@/components/trip/trip-form";
import dynamic from "next/dynamic";
import type { Destination, GeoLocation } from '@/lib/location';
import type { Place } from '@/components/trip/place-search';

const MapView = dynamic(() => import('@/components/map/map'), {
  loading: () => <div className="h-[400px] bg-muted rounded-lg animate-pulse" />,
  ssr: false
});

export default function NewTripPage() {
  const [origin, setOrigin] = useState<Destination | null>(null);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [initialOrigin, setInitialOrigin] = useState<Place | null>(null);


  useEffect(() => {
    // Get user's live location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const location = { latitude, longitude };
          setUserLocation(location);

          // Reverse geocode to get the address for the form
          try {
            const response = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&apiKey=${process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY}`);
            const data = await response.json();
            if (data.features && data.features.length > 0) {
                const properties = data.features[0].properties;
                const place: Place = {
                    label: properties.formatted,
                    value: properties.place_id,
                    lat: properties.lat,
                    lon: properties.lon
                };
                setInitialOrigin(place);
                setOrigin({ latitude: place.lat, longitude: place.lon, name: place.label });
            }
          } catch(e) {
            console.error("Error reverse geocoding:", e);
          }
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  const destinations = useMemo(() => {
    return [origin, destination].filter(d => d && d.latitude && d.longitude) as Destination[];
  }, [origin, destination]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-2">
            <div>
                <h2 className="text-2xl font-bold mb-4 font-headline text-foreground">Record a New Trip</h2>
                <div className="lg:sticky lg:top-20">
                    <TripForm 
                        onOriginChange={setOrigin}
                        onDestinationChange={setDestination}
                        initialOrigin={initialOrigin}
                    />
                </div>
            </div>
            <div className="rounded-lg overflow-hidden h-[400px] lg:h-auto lg:max-h-[calc(100vh-8rem)] lg:sticky lg:top-20">
                <MapView 
                    destinations={destinations}
                    userLocation={userLocation}
                />
            </div>
        </div>
      </main>
    </div>
  )
}
