
'use client';

import { useState, useEffect } from 'react';
import type { Trip } from '@/lib/types';
import { Header } from '@/components/layout/header';
import { TripList } from '@/components/trip/trip-list';
import { ConsentModal } from '@/components/consent-modal';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Plus, Download } from 'lucide-react';
import { useTripStore } from '@/hooks/use-trip-store';

export default function Home() {
  const { trips, addTrip } = useTripStore();
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    const checkInstalledStatus = async () => {
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setIsAppInstalled(true);
      }
    };

    checkInstalledStatus();
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => setIsAppInstalled(true));

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', () => setIsAppInstalled(true));
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    (installPrompt as any).prompt();
    const { outcome } = await (installPrompt as any).userChoice;
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
    }
    setInstallPrompt(null);
  };

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
        {installPrompt && !isAppInstalled && (
          <div className="fixed bottom-4 right-4 z-50">
            <Button onClick={handleInstallClick} size="lg" className="rounded-full shadow-lg">
              <Download className="mr-2" />
              Install App
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
