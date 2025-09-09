'use client';

import { useState } from 'react';
import type { Trip } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { TripList } from '@/components/trip/trip-list';
import { ConsentModal } from '@/components/consent-modal';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTripStore } from '@/hooks/use-trip-store';

export default function Home() {
  const { trips, addTrip } = useTripStore();

  return (
    <>
      <ConsentModal />
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold font-headline text-foreground">My Trip Chain</h2>
            <Link href="/trips/new">
              <Button>
                <Plus className="mr-2" />
                Add Trip
              </Button>
            </Link>
          </div>
          <TripList trips={trips} />
        </main>
      </div>
    </>
  );
}
