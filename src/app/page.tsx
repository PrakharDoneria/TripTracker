
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
      // Prevent the browser from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      // Update the UI to show the install button
      setIsAppInstalled(false); 
    };

    // Check if the app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Listen for the appinstalled event
    const handleAppInstalled = () => {
        setIsAppInstalled(true);
        setInstallPrompt(null);
    };
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
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
           <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t p-4 shadow-lg md:hidden">
              <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-center sm:text-left text-card-foreground">
                      Get the full app experience!
                  </p>
                  <Button onClick={handleInstallClick} size="lg" className="w-full sm:w-auto">
                      <Download className="mr-2" />
                      Install App
                  </Button>
              </div>
          </div>
        )}
      </div>
    </>
  );
}
