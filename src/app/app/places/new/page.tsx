
'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Destination, GeoLocation } from '@/lib/location';
import { usePlaceStore } from '@/hooks/use-place-store';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

const MapView = dynamic(() => import('@/components/map/map'), {
  loading: () => <div className="h-[200px] bg-muted rounded-lg animate-pulse" />,
  ssr: false
});

const formSchema = z.object({
    name: z.string().min(2, "Place name is too short."),
    description: z.string().max(200, "Description is too long").optional(),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    isPublic: z.boolean().default(false),
});

type PlaceFormValues = z.infer<typeof formSchema>;

export default function NewPlacePage() {
    const router = useRouter();
    const { user } = useAuth();
    const { addPlace } = usePlaceStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [mapCenter, setMapCenter] = useState<GeoLocation | null>(null);

    const form = useForm<PlaceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            description: '',
            latitude: 8.5241, // Default to Trivandrum
            longitude: 76.9366,
            isPublic: false,
        }
    });
    
    const lat = form.watch('latitude');
    const lon = form.watch('longitude');

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => {
                const { latitude, longitude } = pos.coords;
                form.setValue('latitude', latitude);
                form.setValue('longitude', longitude);
                setMapCenter({ latitude, longitude });
            });
        }
    }, [form]);

    const mapDestination = useMemo((): Destination[] => {
        if(lat !== undefined && lon !== undefined) {
             return [{ latitude: lat, longitude: lon, name: form.getValues('name') || 'New Place', isCustomPlace: true }];
        }
        return [];
    }, [lat, lon, form]);

    const handleMapClick = (location: GeoLocation) => {
        form.setValue('latitude', location.latitude);
        form.setValue('longitude', location.longitude);
    };

    async function onSubmit(values: PlaceFormValues) {
        if (!user) {
            toast({ variant: 'destructive', title: "Not authenticated" });
            return;
        }

        setIsLoading(true);
        try {
            await addPlace({
                creatorId: user.uid,
                name: values.name,
                description: values.description || '',
                coords: { lat: values.latitude, lon: values.longitude },
                isPublic: values.isPublic,
            });
            toast({ title: "Place Saved!", description: "Your custom place has been added to the map." });
            router.push('/app/map');
        } catch (error) {
            console.error("Failed to add place:", error);
            toast({ variant: 'destructive', title: "Submission Failed", description: "Could not save your place. Please try again." });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-transparent">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">Save a New Place</CardTitle>
                            <CardDescription>
                                Pin a custom location on your map. Click on the map to set the location.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Place Name</FormLabel>
                                                <FormControl><Input placeholder="e.g., Favorite Picnic Spot" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Description (Optional)</FormLabel>
                                                <FormControl><Textarea placeholder="A short note about this place..." {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <div className="h-[250px] rounded-md overflow-hidden border">
                                        <MapView userLocation={mapCenter} destinations={mapDestination} onMapClick={handleMapClick} disablePan={true} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="latitude"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Latitude</FormLabel>
                                                    <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="longitude"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Longitude</FormLabel>
                                                    <FormControl><Input type="number" step="any" {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="isPublic"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                            <FormControl>
                                                <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                />
                                            </FormControl>
                                            <div className="space-y-1 leading-none">
                                                <FormLabel>
                                                Share with community
                                                </FormLabel>
                                                <FormDescription>
                                                 Make this place visible to other users on the map.
                                                </FormDescription>
                                            </div>
                                            </FormItem>
                                        )}
                                        />
                                    
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save My Place
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
