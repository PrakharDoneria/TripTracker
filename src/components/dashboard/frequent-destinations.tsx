'use client';

import { useMemo } from "react";
import type { Trip } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { MapPin } from "lucide-react";

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

    if (destinations.length === 0) {
        return (
            <Card className="md:col-span-1 lg:col-span-1">
                <CardHeader>
                    <CardTitle>Frequent Destinations</CardTitle>
                    <CardDescription>Your most visited places.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-64">
                    <p className="text-muted-foreground">No destinations recorded yet.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="md:col-span-1 lg:col-span-1">
            <CardHeader>
                <CardTitle>Frequent Destinations</CardTitle>
                <CardDescription>Your top 5 most visited places.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {destinations.map(([name, count]) => (
                        <li key={name} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground" />
                                <span className="font-medium truncate max-w-xs">{name}</span>
                            </div>
                            <span className="text-muted-foreground font-semibold">{count} {count > 1 ? 'trips' : 'trip'}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}
