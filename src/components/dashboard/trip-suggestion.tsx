'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2, Lightbulb, ArrowRight, Bot } from 'lucide-react';
import type { Trip } from '@/lib/types';
import { suggestNextTrip } from '@/ai/flows/suggest-next-trip';
import type { SuggestNextTripOutput } from '@/ai/schemas';

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
        // Not enough data for a meaningful suggestion
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
    <Card className="md:col-span-2 lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Bot />
            AI Trip Suggestion
        </CardTitle>
        <CardDescription>Based on your recent travel patterns.</CardDescription>
      </CardHeader>
      <CardContent className="h-64 flex flex-col items-center justify-center">
        {isLoading && (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Analyzing your trips...</p>
          </div>
        )}

        {!isLoading && error && (
          <p className="text-destructive text-center">{error}</p>
        )}
        
        {!isLoading && !error && !suggestion && (
             <p className="text-muted-foreground text-center">Not enough trip data to make a suggestion. Add a few more trips!</p>
        )}

        {!isLoading && suggestion && (
          <div className="w-full text-center space-y-4">
             <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Suggestion</AlertTitle>
                <AlertDescription>{suggestion.reason}</AlertDescription>
            </Alert>
            <div className="mt-4">
                <p className="text-lg font-semibold">{suggestion.suggestedDestination}</p>
                <p className="text-muted-foreground capitalize">{suggestion.suggestedPurpose}</p>
            </div>
            <Link href={`/trips/new?destination=${encodeURIComponent(suggestion.suggestedDestination)}&purpose=${encodeURIComponent(suggestion.suggestedPurpose)}`}>
                <Button>
                    Start this trip <ArrowRight className="ml-2"/>
                </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
