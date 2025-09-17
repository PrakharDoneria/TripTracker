

'use client';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoLocation, Destination } from '@/lib/location';
import 'leaflet/dist/leaflet.css';
import { Button } from '../ui/button';
import { Navigation } from 'lucide-react';

interface MapViewProps {
  userLocation: GeoLocation | null;
  destinations: Destination[];
  onMapClick?: (location: GeoLocation) => void;
  className?: string;
  showRoute?: boolean;
}

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

// Custom Business Icon
const businessIcon = L.divIcon({
  html: `<div style="background-color: #6d28d9; border-radius: 50%; width: 24px; height: 24px; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg></div>`,
  className: 'custom-business-icon',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

// Custom Place Icon
const customPlaceIcon = L.divIcon({
    html: `<div style="background-color: #db2777; border-radius: 50%; width: 24px; height: 24px; display: flex; justify-content: center; align-items: center; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.5);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg></div>`,
    className: 'custom-place-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -24],
});


const MapView = ({ userLocation, destinations, onMapClick, className = 'h-full w-full', showRoute = false }: MapViewProps) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const destinationMarkersRef = useRef<L.Marker[]>([]);
  const routeLayersRef = useRef<L.Polyline[]>([]);
  
  // Initialize the map
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) { // Prevent re-initialization
        // Create the map
        const map = L.map(mapContainerRef.current, {
            center: userLocation 
            ? [userLocation.latitude, userLocation.longitude] 
            : [8.5241, 76.9366], // Default to Trivandrum if no location
            zoom: 13,
            zoomControl: true,
        });

        // Add a tile layer
        L.tileLayer(`https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`, {
            attribution: 'Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>',
            maxZoom: 19
        }).addTo(map);

        // Set up the click handler
        if (onMapClick) {
            map.on('click', (e: L.LeafletMouseEvent) => {
            onMapClick({
                latitude: e.latlng.lat,
                longitude: e.latlng.lng
            });
            });
        }

        // Store the map reference
        mapRef.current = map;
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Update user marker when location changes
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;

    const map = mapRef.current;
    const userLatLng = L.latLng(userLocation.latitude, userLocation.longitude);

    // Create a custom icon for user location
    const userIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `<div class="h-4 w-4 rounded-full bg-blue-500 border-2 border-white shadow-md animate-pulse"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    // Update or create the user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(userLatLng);
    } else {
      userMarkerRef.current = L.marker(userLatLng, { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
    }

  }, [userLocation]);

  // Update destination markers and routes
  useEffect(() => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;

    // Clear existing markers and routes
    destinationMarkersRef.current.forEach(marker => map.removeLayer(marker));
    destinationMarkersRef.current = [];
    routeLayersRef.current.forEach(layer => map.removeLayer(layer));
    routeLayersRef.current = [];

    if (destinations.length > 0) {
        destinations.forEach(destination => {
             if (destination.latitude && destination.longitude) {
                const destLatLng = L.latLng(destination.latitude, destination.longitude);
        
                const defaultIcon = L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                let iconToUse = defaultIcon;
                let popupContent = `<b>${destination.name}</b>`;

                if (destination.isBusiness) {
                    iconToUse = businessIcon;
                    popupContent += `<br/>${destination.contactNumber}`;
                    if (destination.website) {
                        popupContent += `<br/><a href="${destination.website}" target="_blank" rel="noopener noreferrer">Website</a>`;
                    }
                } else if (destination.isCustomPlace) {
                    iconToUse = customPlaceIcon;
                    if(destination.description) {
                         popupContent += `<br/><i>${destination.description}</i>`
                    }
                }

                const marker = L.marker(destLatLng, { icon: iconToUse })
                    .addTo(map)
                    .bindPopup(popupContent);
                destinationMarkersRef.current.push(marker);
             }
        });
        
        // Draw route if we have an origin and destination for it
        if (showRoute && userLocation && destinations.length > 0) {
          const origin = userLocation;
          const finalDestination = destinations[destinations.length -1]; // Assume last one is the target
          updateRoute(origin, finalDestination);
        }
    }

    // Fit map to bounds
    const allPoints: L.LatLng[] = [];
    if (userLocation) {
        allPoints.push(L.latLng(userLocation.latitude, userLocation.longitude));
    }
    destinations.forEach(d => {
        if(d.latitude && d.longitude) {
            allPoints.push(L.latLng(d.latitude, d.longitude))
        }
    })

    if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints);
        if(bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }


  }, [destinations, userLocation, showRoute]);

  // Function to update the route between user and destination
  const updateRoute = async (origin: GeoLocation, destination: Destination) => {
    if (!mapRef.current || !GEOAPIFY_API_KEY) return;
    
    const map = mapRef.current;
    
    const from = origin;
    const to = destination;

    const url = `https://api.geoapify.com/v1/routing?waypoints=${from.latitude},${from.longitude}|${to.latitude},${to.longitude}&mode=drive&apiKey=${GEOAPIFY_API_KEY}`;

    try {
        const response = await fetch(url);
        const result = await response.json();
        if (result.features && result.features.length) {
            const routeGeometry = result.features[0].geometry.coordinates[0];
            const latLngs = routeGeometry.map((coord: [number, number]) => [coord[1], coord[0]] as L.LatLngExpression);
            
            if (mapRef.current) {
              const routeLayer = L.polyline(latLngs, { color: "#1e40af", weight: 5, opacity: 0.7 }).addTo(mapRef.current);
              routeLayersRef.current.push(routeLayer);
            }
        }
    } catch(e) {
        console.error("Error fetching route: ", e);
    }
  };

  const handleStartNavigation = () => {
    if (userLocation && destinations.length > 0) {
      const origin = userLocation;
      const destination = destinations[destinations.length - 1]; // Assume final destination
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}`;
      window.open(googleMapsUrl, '_blank');
    }
  };

  return (
    <div className="relative h-full w-full">
        <div ref={mapContainerRef} className={className} style={{ height: 'calc(100vh - 4rem)' }}></div>
        {showRoute && (
            <div className="absolute top-5 right-5 z-[1000]">
                <Button onClick={handleStartNavigation} size="lg">
                    <Navigation className="mr-2 h-5 w-5" />
                    Start Navigation
                </Button>
            </div>
        )}
    </div>
  );
};

export default MapView;

    
