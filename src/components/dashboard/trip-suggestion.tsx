

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Loader2, Lightbulb, ArrowRight } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { suggestNextTrip } from '@/ai/flows/suggest-next-trip';
import type { SuggestNextTripOutput } from '@/ai/schemas';
import Image from 'next/image';

interface TripSuggestionProps {
  trips: Trip[];
}

export function TripSuggestion({ trips }: TripSuggestionProps) {
  const [suggestion, setSuggestion] = useState<SuggestNextTripOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getSuggestion = async () => {
      if (trips.length < 2) {
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const recentTrips = trips.slice(0, 5).map(t => ({
          origin: t.origin,
          destination: t.destination,
          purpose: t.purpose || 'not specified',
          time: t.startTime.toISOString(),
        }));
        
        const result = await suggestNextTrip({ recentTrips });
        setSuggestion(result);
      } catch (err) {
        console.error('Error fetching trip suggestion:', err);
        setError('Could not load a suggestion at this time.');
      } finally {
        setIsLoading(false);
      }
    };

    getSuggestion();
  }, [trips]);

  return (
    <Card className="md:col-span-2 lg:col-span-1 flex flex-col bg-card text-card-foreground rounded-2xl shadow-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">AI Trip Suggestion</CardTitle>
        <CardDescription>Intelligent predictions based on your travel patterns.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {isLoading && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin" />
                <p>Analyzing your trips...</p>
            </div>
        )}

        {!isLoading && error && (
            <p className="text-destructive">{error}</p>
        )}
        
        {!isLoading && !error && !suggestion && (
            <div className='text-center text-muted-foreground'>
                <Lightbulb className="h-10 w-10 mx-auto mb-2" />
                <p>Not enough trip data. Add a few more trips for a suggestion!</p>
            </div>
        )}

        {!isLoading && suggestion && (
            <div className="space-y-4">
                <div className="w-full h-40 relative rounded-lg overflow-hidden mb-4">
                     <Image src="https://picsum.photos/seed/suggestion/400/200" data-ai-hint="whimsical landscape illustration" alt="Trip suggestion illustration" fill className="object-cover" />
                </div>
                <p className="font-semibold text-foreground/90">{suggestion.reason}</p>
                <div className="mt-2">
                    <p className="text-2xl font-bold text-foreground">{suggestion.suggestedDestination}</p>
                    <p className="text-primary capitalize font-medium">{suggestion.suggestedPurpose}</p>
                </div>
                <Link href={`/app/trips/new?destination=${encodeURIComponent(suggestion.suggestedDestination)}&purpose=${encodeURIComponent(suggestion.suggestedPurpose)}`}>
                    <Button variant="default" className="mt-4">
                        Start this trip <ArrowRight className="ml-2"/>
                    </Button>
                </Link>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
