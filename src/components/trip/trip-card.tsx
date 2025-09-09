
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Clock, MapPin, Users } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { transportationIcons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TripCardProps {
  trip: Trip;
}

export function TripCard({ trip }: TripCardProps) {
  const Icon = transportationIcons[trip.mode];
  const [formattedTime, setFormattedTime] = useState('');

  useEffect(() => {
    // Format the time on the client to avoid hydration mismatch
    setFormattedTime(
      `${format(trip.startTime, 'MMM d, yyyy, h:mm a')} - ${format(
        trip.endTime,
        'h:mm a'
      )}`
    );
  }, [trip.startTime, trip.endTime]);
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-lg flex-wrap">
            <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
            <span className="font-semibold truncate max-w-[150px] sm:max-w-xs" title={trip.origin}>{trip.origin}</span>
            <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
            <span className="font-semibold truncate max-w-[150px] sm:max-w-xs" title={trip.destination}>{trip.destination}</span>
          </div>
          <Badge variant="secondary" className="flex items-center gap-2 self-start sm:self-center">
            <Icon className="h-4 w-4" />
            <span className="font-normal">{trip.mode.charAt(0).toUpperCase() + trip.mode.slice(1)}</span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>
            {formattedTime || 'Loading...'}
          </span>
        </div>
        {trip.companions > 0 && (
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>{trip.companions} companion{trip.companions > 1 ? 's' : ''}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
