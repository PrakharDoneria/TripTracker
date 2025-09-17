
'use client';

import { useMemo } from "react";
import type { Trip } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { MapPin } from "lucide-react";
import Image from "next/image";

interface FrequentDestinationsProps {
    trips: Trip[];
}

export function FrequentDestinations({ trips }: FrequentDestinationsProps) {
    const destinations = useMemo(() => {
        const destCounts = trips.reduce((acc, trip) => {
            acc[trip.destination] = (acc[trip.destination] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(destCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
    }, [trips]);
    
    return (
        <Card className="col-span-1 lg:col-span-2 flex flex-col bg-card/50 backdrop-blur-sm border-white/10 rounded-2xl shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Frequent Destinations</CardTitle>
                <CardDescription>Your most visited places, providing insights into your travel patterns.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center p-6">
                {destinations.length === 0 ? (
                     <p className="text-muted-foreground">No destinations recorded yet.</p>
                ) : (
                    <div className="w-full h-full relative">
                         <Image src="https://picsum.photos/600/400" data-ai-hint="abstract map" alt="Frequent destinations map" layout="fill" className="object-cover rounded-lg" />
                         <div className="absolute inset-0 bg-black/50 rounded-lg p-6 flex flex-col justify-end">
                            <ul className="space-y-2">
                                {destinations.map(([name, count]) => (
                                    <li key={name} className="flex items-center justify-between bg-black/30 backdrop-blur-sm p-2 rounded-md">
                                        <div className="flex items-center gap-3">
                                            <MapPin className="h-5 w-5 text-primary" />
                                            <span className="font-medium truncate max-w-xs text-white">{name}</span>
                                        </div>
                                        <span className="text-white/80 font-semibold">{count} {count > 1 ? 'trips' : 'trip'}</span>
                                    </li>
                                ))}
                            </ul>
                         </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
