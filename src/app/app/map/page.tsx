
'use client';
import { Header } from "@/components/layout/header";
import { useTripStore } from "@/hooks/use-trip-store";
import dynamic from "next/dynamic";
import { useMemo, useState, useEffect, Suspense } from "react";
import type { Destination, GeoLocation } from "@/lib/location";
import { useSearchParams } from "next/navigation";
import type { Trip } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import { useBusinessStore } from "@/hooks/use-business-store";

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


function MapPageContent() {
  const { user } = useAuth();
  const { trips, fetchTrips, getTripById } = useTripStore();
  const { businesses, fetchBusinesses } = useBusinessStore();
  const [liveUserLocation, setLiveUserLocation] = useState<GeoLocation | null>(null);
  const notifiedPlaces = useMemo(() => new Set<string>(), []);
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');
  const [focusedTrip, setFocusedTrip] = useState<Trip | null>(null);
  const [emergencyContact, setEmergencyContact] = useState<string | null>(null);

  useEffect(() => {
    const contact = localStorage.getItem('emergencyContact');
    if (contact) {
      setEmergencyContact(contact);
    }
  }, []);

  useEffect(() => {
    if (user) {
        if(trips.length === 0) fetchTrips(user.uid);
        if(businesses.length === 0) fetchBusinesses();
    }
  }, [user, trips.length, fetchTrips, businesses.length, fetchBusinesses]);

  useEffect(() => {
    if (tripId) {
      const foundTrip = getTripById(tripId);
      if (foundTrip) {
        setFocusedTrip(foundTrip);
      }
    } else {
      setFocusedTrip(null);
    }
  }, [tripId, getTripById, trips]);


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
    if (focusedTrip && focusedTrip.originCoords && focusedTrip.destinationCoords) {
      return [
        {
          latitude: focusedTrip.originCoords.lat,
          longitude: focusedTrip.originCoords.lon,
          name: focusedTrip.origin,
        },
        {
          latitude: focusedTrip.destinationCoords.lat,
          longitude: focusedTrip.destinationCoords.lon,
          name: focusedTrip.destination,
        }
      ];
    }
    
    const tripDestinations = trips.map(trip => ({
        latitude: trip.destinationCoords?.lat || 0,
        longitude: trip.destinationCoords?.lon || 0,
        name: trip.destination,
        isNicePlace: trip.isNicePlace,
    })).filter(d => d.latitude !== 0 && d.longitude !== 0);

    const businessDestinations = businesses.map(biz => ({
        latitude: biz.coords.lat,
        longitude: biz.coords.lon,
        name: biz.name,
        contactNumber: biz.contactNumber,
        website: biz.website,
        isBusiness: true,
    }));

    return [...tripDestinations, ...businessDestinations];

  }, [trips, businesses, focusedTrip]);

  const mapUserLocation = useMemo(() => {
    if(focusedTrip && focusedTrip.originCoords) {
      return { latitude: focusedTrip.originCoords.lat, longitude: focusedTrip.originCoords.lon };
    }
    return liveUserLocation;
  }, [focusedTrip, liveUserLocation])

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 relative">
        <MapView 
            userLocation={mapUserLocation}
            destinations={destinations}
            showRoute={!!focusedTrip}
        />
        {emergencyContact && (
            <div className="absolute top-5 left-5 z-[1000]">
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="lg" className="rounded-full w-16 h-16 shadow-lg">
                            <Phone className="h-7 w-7" />
                            <span className="sr-only">SOS</span>
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Emergency Call</AlertDialogTitle>
                            <AlertDialogDescription>
                                You are about to call your emergency contact: {emergencyContact}. Do you want to proceed?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <a href={`tel:${emergencyContact}`}>Call Now</a>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        )}
      </main>
    </div>
  );
}


export default function MapPage() {
  return (
    <Suspense fallback={<div>Loading Map...</div>}>
      <MapPageContent />
    </Suspense>
  )
}
