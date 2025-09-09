
'use client';

import { Download, Map, Home, LayoutDashboard, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTripStore } from '@/hooks/use-trip-store';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export function Header() {
  const { trips } = useTripStore();
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

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify(trips, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `TripTracker_Export_${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      document.body.appendChild(linkElement);
      linkElement.click();
      document.body.removeChild(linkElement);
    } catch (error) {
      console.error("Failed to export data:", error);
      alert("An error occurred while exporting data. Please try again.");
    }
  };

  return (
    <header className="bg-card shadow-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 sm:h-8 sm:w-8 text-primary"
            >
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
              TripTracker
            </h1>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <LayoutDashboard className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </Button>
          </Link>
          <Link href="/map">
            <Button variant="ghost" size="icon">
              <Map className="h-5 w-5" />
              <span className="sr-only">Map View</span>
            </Button>
          </Link>
          <Link href="/camera">
            <Button variant="ghost" size="icon">
              <Camera className="h-5 w-5" />
              <span className="sr-only">Camera View</span>
            </Button>
          </Link>

          {installPrompt && !isAppInstalled && (
            <Button onClick={handleInstallClick} variant="outline" size="sm" className="hidden sm:inline-flex bg-primary/10 border-primary/50 text-primary hover:text-primary">
              <Download className="mr-2 h-4 w-4" />
              Install App
            </Button>
          )}

          <Button onClick={handleExport} disabled={trips.length === 0} variant="outline" size="sm" className="hidden sm:inline-flex">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
           <Button onClick={handleExport} disabled={trips.length === 0} variant="outline" size="icon" className="sm:hidden">
            <Download className="h-4 w-4" />
            <span className="sr-only">Export Data</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
