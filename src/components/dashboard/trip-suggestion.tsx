
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
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
    <Card className="col-span-1 lg:col-span-1 flex flex-col bg-slate-900/50 backdrop-blur-sm border-white/10 rounded-2xl shadow-lg text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">AI Trip Suggestion</CardTitle>
        <CardDescription className="text-slate-400">Intelligent predictions based on your unique travel patterns.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full h-full relative">
            <Image src="https://picsum.photos/seed/ai/400/400" data-ai-hint="futuristic interface" alt="AI suggestion background" layout="fill" className="object-cover rounded-lg" />
            <div className="absolute inset-0 bg-black/60 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                {isLoading && (
                    <div className="flex flex-col items-center gap-2 text-white/80">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <p>Analyzing your trips...</p>
                    </div>
                )}

                {!isLoading && error && (
                    <p className="text-destructive">{error}</p>
                )}
                
                {!isLoading && !error && !suggestion && (
                    <p className="text-white/80">Not enough trip data. Add more trips for a suggestion!</p>
                )}

                {!isLoading && suggestion && (
                    <div className="space-y-4">
                        <Lightbulb className="h-10 w-10 text-primary mx-auto" />
                        <p className="font-semibold text-white/90">{suggestion.reason}</p>
                        <div className="mt-4">
                            <p className="text-2xl font-bold text-white">{suggestion.suggestedDestination}</p>
                            <p className="text-primary capitalize font-medium">{suggestion.suggestedPurpose}</p>
                        </div>
                        <Link href={`/app/trips/new?destination=${encodeURIComponent(suggestion.suggestedDestination)}&purpose=${encodeURIComponent(suggestion.suggestedPurpose)}`}>
                            <Button variant="secondary" className="mt-4">
                                Start this trip <ArrowRight className="ml-2"/>
                            </Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
