'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import type { Trip } from '@/lib/types';
import L from 'leaflet';
import { useEffect, useRef, useState } from 'react';

const GEOAPIFY_API_KEY = process.env.NEXT_PUBLIC_GEOAPIFY_API_KEY;

// Fix for default icon paths in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const Routing = ({ trip }: { trip: Trip }) => {
  const map = useMap();
  const [route, setRoute] = useState<L.LatLngExpression[] | null>(null);

  useEffect(() => {
    if (!map || !trip.originCoords || !trip.destinationCoords || !GEOAPIFY_API_KEY) {
      return;
    }

    const from = trip.originCoords;
    const to = trip.destinationCoords;

    const url = `https://api.geoapify.com/v1/routing?waypoints=${from.lat},${from.lon}|${to.lat},${to.lon}&mode=${trip.mode}&apiKey=${GEOAPIFY_API_KEY}`;

    fetch(url).then(res => res.json()).then(result => {
        if (result.features && result.features.length) {
            const routeGeometry = result.features[0].geometry.coordinates[0];
            const latLngs = routeGeometry.map((coord: [number, number]) => [coord[1], coord[0]] as L.LatLngExpression);
            setRoute(latLngs);
            const routeBounds = L.latLngBounds(latLngs);
            map.fitBounds(routeBounds, { padding: [50, 50] });
        }
    }).catch(e => console.log(e));

  }, [map, trip]);


  return route ? <Polyline positions={route} color="#1e40af" weight={6} opacity={0.8} /> : null;
}


interface MapProps {
  trips: Trip[];
}

const Map = ({ trips }: MapProps) => {
  const mapRef = useRef<L.Map | null>(null);

  // Default to a central location if no trips are available
  const defaultPosition: [number, number] = [8.5241, 76.9366]; // Trivandrum

  useEffect(() => {
    if (mapRef.current && trips.length > 0) {
      const bounds = new L.LatLngBounds(trips.flatMap(trip => {
        const points = [];
        if (trip.originCoords) points.push([trip.originCoords.lat, trip.originCoords.lon] as L.LatLngExpression);
        if (trip.destinationCoords) points.push([trip.destinationCoords.lat, trip.destinationCoords.lon] as L.LatLngExpression);
        return points;
      }).filter(p => p && p.length > 0));

      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [trips]);
  
  return (
    <MapContainer
      center={defaultPosition}
      zoom={13}
      style={{ height: '100%', width: '100%' }}
      whenCreated={map => mapRef.current = map}
      preferCanvas={true}
    >
      <TileLayer
        url={`https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}.png?apiKey=${GEOAPIFY_API_KEY}`}
        attribution='Powered by <a href="https://www.geoapify.com/" target="_blank">Geoapify</a> | <a href="https://openmaptiles.org/" target="_blank">© OpenMapTiles</a> <a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap</a>'
      />
      {trips.map(trip => (
        trip.originCoords && trip.destinationCoords && <Routing key={trip.id} trip={trip} />
      ))}
      {trips.map(trip => (
        trip.originCoords && (
          <Marker key={`${trip.id}-origin`} position={[trip.originCoords.lat, trip.originCoords.lon]}>
            <Popup>Origin: {trip.origin}</Popup>
          </Marker>
        )
      ))}
       {trips.map(trip => (
        trip.destinationCoords && (
          <Marker key={`${trip.id}-destination`} position={[trip.destinationCoords.lat, trip.destinationCoords.lon]}>
            <Popup>Destination: {trip.destination}</Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default Map;

