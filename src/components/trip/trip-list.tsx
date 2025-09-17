import type { Trip } from '@/lib/types';
import { TripCard } from './trip-card';
import { FileArchive } from 'lucide-react';

interface TripListProps {
  trips: Trip[];
}

export function TripList({ trips }: TripListProps) {
  if (trips.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 h-full min-h-[300px] p-12 text-center">
        <FileArchive className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-xl font-semibold font-headline">No Trips Recorded Yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the form to add your first trip or use the assisted capture.
        </p>
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
