import { Car, Bus, Bike, Walk, Train, type LucideProps } from 'lucide-react';
import type { TransportationMode } from '@/lib/types';

export const transportationIcons: Record<TransportationMode, React.ComponentType<LucideProps>> = {
  car: Car,
  bus: Bus,
  bike: Bike,
  walk: Walk,
  train: Train,
};
