

'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { TripList } from '@/components/trip/trip-list';
import { ConsentModal } from '@/components/consent-modal';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useTripStore } from '@/hooks/use-trip-store';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { MobileToolbar } from '@/components/layout/mobile-toolbar';

export default function Home() {
  const { user } = useAuth();
  const { trips, isLoading, fetchTrips } = useTripStore();

  useEffect(() => {
    if (user) {
      fetchTrips(user.uid);
    }
  }, [user, fetchTrips]);

  return (
    <>
      <ConsentModal />
      <div className="flex min-h-screen w-full flex-col bg-transparent">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 mb-20 md:mb-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold font-headline text-foreground">My Trip Chain</h2>
          </div>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : (
            <TripList trips={trips} />
          )}
        </main>
        <MobileToolbar />
      </div>
    </>
  );
}
