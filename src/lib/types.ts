export type TransportationMode = 'walk' | 'bike' | 'car' | 'bus' | 'train';

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  startTime: Date;
  endTime: Date;
  mode: TransportationMode;
  companions: number;
}
