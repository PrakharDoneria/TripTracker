'use client';

import { Download, Map, Home, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTripStore } from '@/hooks/use-trip-store';
import Link from 'next/link';

export function Header() {
  const { trips } = useTripStore();

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
        <Link href="/" className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-primary"
            >
              <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <h1 className="text-2xl font-bold font-headline text-foreground">
              TripTracker
            </h1>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <Home />
              <span className="sr-only">Home</span>
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" size="icon">
              <LayoutDashboard />
              <span className="sr-only">Dashboard</span>
            </Button>
          </Link>
          <Link href="/map">
            <Button variant="ghost" size="icon">
              <Map />
              <span className="sr-only">Map View</span>
            </Button>
          </Link>
          <Button onClick={handleExport} disabled={trips.length === 0} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>
    </header>
  );
}
