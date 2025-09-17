
'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import PlaceSearch, { type Place } from '@/components/trip/place-search';
import { useBusinessStore } from '@/hooks/use-business-store';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Destination } from '@/lib/location';

const MapView = dynamic(() => import('@/components/map/map'), {
  loading: () => <div className="h-[200px] bg-muted rounded-lg animate-pulse" />,
  ssr: false
});


const formSchema = z.object({
    name: z.string().min(2, "Business name is too short."),
    contactNumber: z.string().min(10, "Please enter a valid contact number."),
    website: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
});

type BusinessFormValues = z.infer<typeof formSchema>;

export default function NewBusinessPage() {
    const router = useRouter();
    const { user } = useAuth();
    const { addBusiness } = useBusinessStore();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [location, setLocation] = useState<Place | null>(null);

    const form = useForm<BusinessFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            contactNumber: '',
            website: '',
        }
    });

    const mapDestination = useMemo((): Destination[] => {
        if (location) {
            return [{ latitude: location.lat, longitude: location.lon, name: location.label }];
        }
        return [];
    }, [location]);

    async function onSubmit(values: BusinessFormValues) {
        if (!user) {
            toast({ variant: 'destructive', title: "Not authenticated" });
            return;
        }
        if (!location) {
            toast({ variant: 'destructive', title: "Location required", description: "Please select a location for your business." });
            return;
        }

        setIsLoading(true);
        try {
            await addBusiness({
                ...values,
                coords: { lat: location.lat, lon: location.lon },
                address: location.label,
                creatorId: user.uid,
            });
            toast({ title: "Business Listed!", description: "Your business is now visible on the map." });
            router.push('/app/map');
        } catch (error) {
            console.error("Failed to add business:", error);
            toast({ variant: 'destructive', title: "Submission Failed", description: "Could not list your business. Please try again." });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                <div className="max-w-2xl mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline text-2xl">List Your Business</CardTitle>
                            <CardDescription>
                                Add your business to the TripTracker map to be discovered by travelers.
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
                                                <FormLabel>Business Name</FormLabel>
                                                <FormControl><Input placeholder="e.g., The Corner Cafe" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                        <FormControl>
                                            <PlaceSearch
                                                instanceId="business-location-search"
                                                placeholder="Search for your business address"
                                                onPlaceSelect={setLocation}
                                            />
                                        </FormControl>
                                        {location && (
                                            <div className="text-xs text-muted-foreground mt-2 space-y-2">
                                                <p>Lat: {location.lat.toFixed(6)}, Lon: {location.lon.toFixed(6)}</p>
                                                <div className="h-[200px] rounded-md overflow-hidden border">
                                                    <MapView userLocation={null} destinations={mapDestination} />
                                                </div>
                                            </div>
                                        )}
                                        {!location && form.formState.isSubmitted && <FormMessage>Location is required.</FormMessage>}
                                    </FormItem>
                                    <FormField
                                        control={form.control}
                                        name="contactNumber"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Contact Number</FormLabel>
                                                <FormControl><Input type="tel" placeholder="e.g., +91 9876543210" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Website (Optional)</FormLabel>
                                                <FormControl><Input placeholder="https://example.com" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <Button type="submit" className="w-full" disabled={isLoading}>
                                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        List My Business
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
