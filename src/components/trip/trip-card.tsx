

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Clock, MapPin, Users, Edit, Trash2, Leaf, StickyNote, Briefcase, ShoppingCart, FerrisWheel, Star, DollarSign, Gem } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { transportationIcons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '../ui/button';
import Link from 'next/link';
import { useTripStore } from '@/hooks/use-trip-store';
import { useToast } from '@/hooks/use-toast';
import { estimateCO2 } from '@/ai/flows/co2-estimation';
import Image from 'next/image';
import { suggestHiddenGem } from '@/ai/flows/suggest-hidden-gem';
import type { SuggestHiddenGemOutput } from '@/ai/schemas';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useAuth } from '@/hooks/use-auth';

interface TripCardProps {
  trip: Trip;
  isMostRecent?: boolean;
}

const purposeIcons = {
  work: Briefcase,
  leisure: FerrisWheel,
  errands: ShoppingCart,
  other: StickyNote
};

export function TripCard({ trip, isMostRecent = false }: TripCardProps) {
  const Icon = transportationIcons[trip.mode];
  const PurposeIcon = purposeIcons[trip.purpose || 'other'];
  const { user } = useAuth();
  const { deleteTrip } = useTripStore();
  const { toast } = useToast();
  const [formattedTime, setFormattedTime] = useState('');
  const [co2, setCo2] = useState<number | null>(null);
  const [isLoadingCo2, setIsLoadingCo2] = useState(false);
  const [hiddenGem, setHiddenGem] = useState<SuggestHiddenGemOutput | null>(null);
  const [isLoadingGem, setIsLoadingGem] = useState(false);


  useEffect(() => {
    // Format the time on the client to avoid hydration mismatch
    const startTimeFormatted = format(trip.startTime, 'h:mm a');
    const endTimeFormatted = format(trip.endTime, 'h:mm a');
    const startDateFormatted = format(trip.startTime, 'MMM d, yyyy');

    if (format(trip.startTime, 'yyyyMMdd') === format(trip.endTime, 'yyyyMMdd')) {
        setFormattedTime(`${startDateFormatted}, ${startTimeFormatted} - ${endTimeFormatted}`);
    } else {
        setFormattedTime(`${startDateFormatted}, ${startTimeFormatted} - ${format(trip.endTime, 'MMM d, yyyy, h:mm a')}`);
    }
  }, [trip.startTime, trip.endTime]);

  const handleDelete = () => {
    if (!user) return;
    deleteTrip(user.uid, trip.id);
    toast({
        title: "Trip Deleted",
        description: "The trip has been removed from your trip chain.",
    });
  };

  const getTripEstimates = async () => {
    if (!trip.originCoords || !trip.destinationCoords) return;
    
    // CO2 Estimation
    setIsLoadingCo2(true);
    try {
      const result = await estimateCO2({
        origin: { latitude: trip.originCoords.lat, longitude: trip.originCoords.lon },
        destination: { latitude: trip.destinationCoords.lat, longitude: trip.destinationCoords.lon },
        mode: trip.mode,
      });
      setCo2(result.co2Grams);
    } catch (error) {
      console.error("Failed to estimate CO2:", error);
    } finally {
      setIsLoadingCo2(false);
    }

    // Hidden Gem Suggestion for most recent trip
    if (isMostRecent) {
        setIsLoadingGem(true);
        try {
          const gem = await suggestHiddenGem({
            destinationName: trip.destination,
            destinationCoords: { latitude: trip.destinationCoords.lat, longitude: trip.destinationCoords.lon },
            tripPurpose: trip.purpose,
          });
          setHiddenGem(gem);
        } catch(error) {
            console.error("Failed to suggest hidden gem:", error);
        } finally {
          setIsLoadingGem(false);
        }
    }
  }

  useEffect(() => {
    getTripEstimates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trip.id, isMostRecent]);
  
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 relative group flex flex-col">
      <div className='flex flex-col md:flex-row'>
        {trip.destinationImageUrl && (
          <div className="md:w-1/3 relative h-48 md:h-auto">
            <Image 
              src={trip.destinationImageUrl}
              alt={`Image of ${trip.destination}`}
              fill
              className="object-cover rounded-t-lg md:rounded-l-lg md:rounded-t-none"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        )}
        <div className="flex-1">
          <CardHeader className="pb-3 pr-20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <CardTitle className="flex items-center gap-2 text-lg flex-wrap">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0" />
                    <span className="font-semibold truncate max-w-[150px] sm:max-w-xs" title={trip.origin}>{trip.origin}</span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                    <span className="font-semibold truncate max-w-[150px] sm:max-w-xs" title={trip.destination}>{trip.destination}</span>
                </CardTitle>
                <Badge variant="secondary" className="flex items-center gap-2 self-start sm:self-center">
                    <Icon className="h-4 w-4" />
                    <span className="font-normal capitalize">{trip.mode}</span>
                </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {formattedTime || 'Loading...'}
              </span>
            </div>
            <div className='flex items-center gap-4 flex-wrap'>
              {trip.companions > 0 && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{trip.companions} companion{trip.companions > 1 ? 's' : ''}</span>
                </div>
              )}
              {trip.purpose && (
                <div className="flex items-center gap-2">
                  <PurposeIcon className="h-4 w-4" />
                  <span className="capitalize">{trip.purpose}</span>
                </div>
              )}
               {trip.expenses && trip.expenses > 0 && (
                <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>${trip.expenses.toFixed(2)}</span>
                </div>
              )}
              {co2 !== null && (
                  <div className="flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-green-600" />
                      <span>~{co2.toFixed(0)}g CO₂e</span>
                  </div>
              )}
              {trip.isNicePlace && (
                <div className="flex items-center gap-2 text-yellow-500">
                  <Star className="h-4 w-4" />
                  <span>Nice place to visit</span>
                </div>
              )}
            </div>
            {trip.notes && (
              <div className="flex items-start gap-2 pt-2">
                <StickyNote className="h-4 w-4 mt-1 shrink-0" />
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{trip.notes}</p>
              </div>
            )}
          </CardContent>
        </div>

        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <Link href={`/app/trips/${trip.id}/edit`}>
              <Button variant="ghost" size="icon">
                  <Edit className="h-4 w-4" />
                  <span className="sr-only">Edit Trip</span>
              </Button>
          </Link>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete Trip</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete this trip from your trip chain.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      {isMostRecent && hiddenGem && (
        <div className="p-4 pt-0 sm:p-6 sm:pt-0">
          <Alert className="border-primary/50 bg-primary/5">
            <Gem className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary font-bold">Local Gem: {hiddenGem.name}</AlertTitle>
            <AlertDescription>
              <p>{hiddenGem.reason}</p>
            </AlertDescription>
          </Alert>
        </div>
      )}
    </Card>
  );
}
