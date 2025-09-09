'use client';

import { useState } from 'react';
import type { Trip } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { TripForm } from '@/components/trip/trip-form';
import { TripList } from '@/components/trip/trip-list';
import { ConsentModal } from '@/components/consent-modal';

const initialTrips: Trip[] = [
  {
    id: '1',
    origin: 'NATPAC, Akkulam',
    destination: 'Technopark',
    startTime: new Date(new Date().setDate(new Date().getDate() - 1)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 1)).setHours(new Date().getHours() + 1)),
    mode: 'car',
    companions: 1,
  },
  {
    id: '2',
    origin: 'Home',
    destination: 'Office',
    startTime: new Date(new Date().setDate(new Date().getDate() - 2)),
    endTime: new Date(new Date(new Date().setDate(new Date().getDate() - 2)).setHours(new Date().getHours() + 1)),
    mode: 'bus',
    companions: 0,
  },
];

export default function Home() {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);

  const addTrip = (trip: Omit<Trip, 'id'>) => {
    const newTrip = { ...trip, id: crypto.randomUUID() };
    setTrips((prevTrips) => [newTrip, ...prevTrips]);
  };

  return (
    <>
      <ConsentModal />
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header trips={trips} />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
          <div className="grid gap-12 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="sticky top-24">
                <h2 className="text-2xl font-bold mb-4 font-headline text-foreground">Record a New Trip</h2>
                <TripForm onAddTrip={addTrip} />
              </div>
            </div>
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-2xl font-bold font-headline text-foreground">My Trip Chain</h2>
              </div>
              <TripList trips={trips} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
