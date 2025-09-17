export type TransportationMode = 'walk' | 'bike' | 'car' | 'bus' | 'train';
export type TripPurpose = 'work' | 'leisure' | 'errands' | 'other';

export interface UserProfile {
  uid: string;
  email: string;
}

export interface TripParticipant {
  uid: string;
  email: string;
}

export interface Trip {
  id: string;
  creatorId: string;
  participants: string[]; // array of user UIDs
  sharedWith: TripParticipant[]; // array of friend objects
  origin: string;
  destination: string;
  startTime: Date;
  endTime: Date;
  mode: TransportationMode;
  companions: number;
  purpose: TripPurpose;
  notes?: string;
  expenses?: number;
  originCoords?: { lat: number, lon: number };
  destinationCoords?: { lat: number, lon: number };
  destinationImageUrl?: string;
  destinationImageCoords?: { lat: number, lon: number };
  isNicePlace?: boolean;
}
