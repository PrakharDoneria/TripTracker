'use client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { Trip } from '@/lib/types';
import L from 'leaflet';
import 'leaflet-routing-machine';

// Fix for default icon paths in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const Routing = ({ trip }: { trip: Trip }) => {
  const map = useMap();

  if (trip.originCoords && trip.destinationCoords) {
    L.Routing.control({
      waypoints: [
        L.latLng(trip.originCoords.lat, trip.originCoords.lon),
        L.latLng(trip.destinationCoords.lat, trip.destinationCoords.lon)
      ],
      routeWhileDragging: true,
      lineOptions: {
        styles: [{ color: '#1e40af', opacity: 0.8, weight: 6 }]
      },
      show: false, // Hide the default instructions panel
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
    }).addTo(map);
  }

  return null;
}


interface MapProps {
  trips: Trip[];
}

const Map = ({ trips }: MapProps) => {
  const position: [number, number] = [51.505, -0.09]; // Default position (London)

  return (
    <MapContainer center={position} zoom={13} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {trips.map(trip => (
        trip.originCoords && trip.destinationCoords &&
        <Routing key={trip.id} trip={trip} />
      ))}
      {trips.map(trip => (
        trip.originCoords && (
          <Marker key={`${trip.id}-origin`} position={[trip.originCoords.lat, trip.originCoords.lon]}>
            <Popup>{trip.origin}</Popup>
          </Marker>
        )
      ))}
       {trips.map(trip => (
        trip.destinationCoords && (
          <Marker key={`${trip.id}-destination`} position={[trip.destinationCoords.lat, trip.destinationCoords.lon]}>
            <Popup>{trip.destination}</Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
};

export default Map;
