
import type { Trip } from '@/lib/types';
import { TripCard } from './trip-card';
import { FileArchive } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';

interface TripListProps {
  trips: Trip[];
}

export function TripList({ trips }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card h-full min-h-[300px] p-12 text-center text-foreground">
        <FileArchive className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold font-headline">No Trips Recorded Yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the "Add Trip" button to log your first journey.
        </p>
         <Link href="/app/trips/new" className="mt-6">
            <Button>
                Log Your First Trip
            </Button>
        </Link>
      </div>
    );
  }

  const sortedTrips = trips.slice().sort((a, b) => b.startTime.getTime() - a.startTime.getTime());

  return (
    <div className="space-y-4">
      {sortedTrips.map((trip, index) => (
          <TripCard key={trip.id} trip={trip} isMostRecent={index === 0} />
      ))}
    </div>
  );
}
