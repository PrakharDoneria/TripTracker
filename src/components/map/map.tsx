'use client';
import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { GeoLocation, Destination } from '@/lib/location';
import 'leaflet/dist/leaflet.css';

interface MapViewProps {
  userLocation: GeoLocation | null;
  destinations: Destination[];
  onMapClick?: (location: GeoLocation) => void;
  className?: string;
}

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

const MapView = ({ userLocation, destinations, onMapClick, className = 'h-full w-full' }: MapViewProps) => {
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
        
                const destinationIcon = L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                const marker = L.marker(destLatLng, { icon: destinationIcon })
                    .addTo(map)
                    .bindPopup(destination.name);
                destinationMarkersRef.current.push(marker);

                // Draw route if user location is available
                if (userLocation) {
                    updateRoute(userLocation, destination);
                }
             }
        });
    }

    // Fit map to bounds
    if(userLocation && destinations.length > 0) {
        const validDestinations = destinations.filter(d => d.latitude && d.longitude);
        if (validDestinations.length > 0) {
            const points = [
                L.latLng(userLocation.latitude, userLocation.longitude),
                ...validDestinations.map(d => L.latLng(d.latitude, d.longitude))
            ];
            const bounds = L.latLngBounds(points);
            if(bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    } else if (destinations.length > 0) {
        const validDestinations = destinations.filter(d => d.latitude && d.longitude);
        if (validDestinations.length > 0) {
            const points = validDestinations.map(d => L.latLng(d.latitude, d.longitude));
            const bounds = L.latLngBounds(points);
            if(bounds.isValid()) {
                map.fitBounds(bounds, { padding: [50, 50] });
            }
        }
    } else if (userLocation) {
        map.setView([userLocation.latitude, userLocation.longitude], 13);
    }


  }, [destinations, userLocation]);

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
            
            const routeLayer = L.polyline(latLngs, { color: "#1e40af", weight: 5, opacity: 0.7 }).addTo(map);
            routeLayersRef.current.push(routeLayer);
        }
    } catch(e) {
        console.error("Error fetching route: ", e);
    }
  };

  return (
    <div ref={mapContainerRef} className={className} style={{ height: 'calc(100vh - 4rem)' }}></div>
  );
};

export default MapView;

    