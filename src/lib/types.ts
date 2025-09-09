export type TransportationMode = 'walk' | 'bike' | 'car' | 'bus' | 'train';
export type TripPurpose = 'work' | 'leisure' | 'errands' | 'other';

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  startTime: Date;
  endTime: Date;
  mode: TransportationMode;
  companions: number;
  purpose: TripPurpose;
  notes?: string;
  originCoords?: { lat: number, lon: number };
  destinationCoords?: { lat: number, lon: number };
  destinationImageUrl?: string;
  isNicePlace?: boolean;
}
