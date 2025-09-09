import { Car, Bus, Bike, Footprints, Train, type LucideProps } from 'lucide-react';
import type { TransportationMode } from '@/lib/types';

export const transportationIcons: Record<TransportationMode, React.ComponentType<LucideProps>> = {
  car: Car,
  bus: Bus,
  bike: Bike,
  walk: Footprints,
  train: Train,
};
