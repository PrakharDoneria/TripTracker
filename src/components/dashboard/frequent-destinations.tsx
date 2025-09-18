

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
        <Card className="lg:col-span-1 flex flex-col bg-card text-card-foreground rounded-2xl shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold">Frequent Destinations</CardTitle>
                <CardDescription>Your most visited places.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center p-6 min-h-[250px]">
                {destinations.length === 0 ? (
                     <p className="text-muted-foreground text-center">No destinations recorded yet.</p>
                ) : (
                    <ul className="space-y-3">
                        {destinations.map(([name, count]) => (
                            <li key={name} className="flex items-center justify-between bg-secondary p-3 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <span className="font-medium truncate max-w-xs">{name}</span>
                                </div>
                                <span className="text-foreground/80 font-semibold">{count} {count > 1 ? 'trips' : 'trip'}</span>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    )
}
