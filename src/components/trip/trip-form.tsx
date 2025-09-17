
"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Wand2, Lightbulb, Bot, Camera as CameraIcon, VideoOff, IndianRupee, UserPlus, X, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Trip, TransportationMode, TripPurpose, TripParticipant } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { smartTripDetection } from "@/ai/flows/smart-trip-detection"
import { nudgeForMissingData } from "@/ai/flows/nudge-for-missing-data"
import { getAITripRecommendation } from "@/ai/flows/ai-trip-recommendation"
import type { NudgeForMissingDataInput, AITripRecommendationOutput } from "@/ai/schemas"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useTripStore } from "@/hooks/use-trip-store"
import { useAuth } from "@/hooks/use-auth"
import PlaceSearch, { type Place } from "./place-search"
import { Textarea } from "../ui/textarea"
import { transportationIcons } from "../icons"
import { Destination, GeoLocation } from "@/lib/location"
import { Checkbox } from "../ui/checkbox"
import Image from "next/image"
import { findUserByEmail } from "@/lib/firestore"
import { Badge } from "../ui/badge"

const formSchema = z.object({
  origin: z.string().min(2, "Origin is too short"),
  destination: z.string().min(2, "Destination is too short"),
  startTime: z.date({ required_error: "Start time is required." }),
  endTime: z.date({ required_error: "End time is required." }),
  mode: z.enum(['walk', 'bike', 'car', 'bus', 'train'], { required_error: "Mode is required." }),
  companions: z.coerce.number().int().min(0, "Cannot be negative").max(20, "Max 20 companions"),
  purpose: z.enum(['work', 'leisure', 'errands', 'other'], { required_error: "Purpose is required." }),
  notes: z.string().max(500, "Notes are too long").optional(),
  expenses: z.coerce.number().min(0, "Cannot be negative").optional(),
  destinationImageUrl: z.string().optional(),
  destinationImageCoords: z.object({ lat: z.number(), lon: z.number() }).optional(),
  isNicePlace: z.boolean().optional(),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time.",
  path: ["endTime"],
});

type TripFormValues = z.infer<typeof formSchema>;

const transportationModes: TransportationMode[] = ['walk', 'bike', 'car', 'bus', 'train'];
const tripPurposes: TripPurpose[] = ['work', 'leisure', 'errands', 'other'];

interface TripFormProps {
    trip?: Trip;
    onOriginChange?: (place: Destination | null) => void;
    onDestinationChange?: (place: Destination | null) => void;
    initialOrigin?: Place | null;
    prefilledDestination?: string | null;
    prefilledPurpose?: TripPurpose | null;
}

export function TripForm({ trip, onOriginChange, onDestinationChange, initialOrigin, prefilledDestination, prefilledPurpose }: TripFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const { trips, addTrip, updateTrip } = useTripStore();
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [isNudging, setIsNudging] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendation, setRecommendation] = useState<AITripRecommendationOutput | null>(null);

  const [originCoords, setOriginCoords] = useState<{lat: number, lon: number} | null>(trip?.originCoords || null);
  const [destinationCoords, setDestinationCoords] = useState<{lat: number, lon: number} | null>(trip?.destinationCoords || null);

  const [originValue, setOriginValue] = useState<Place | null>(null)
  const [destinationValue, setDestinationValue] = useState<Place | null>(null);

  const [sharedWith, setSharedWith] = useState<TripParticipant[]>(trip?.sharedWith || []);
  const [friendEmail, setFriendEmail] = useState("");
  const [isSearchingFriend, setIsSearchingFriend] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  
  const form = useForm<TripFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: trip ? {
        ...trip,
    } : {
      origin: "",
      destination: prefilledDestination || "",
      companions: 0,
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
      mode: 'car',
      purpose: prefilledPurpose || 'other',
      notes: '',
      expenses: 0,
      destinationImageUrl: '',
      isNicePlace: false,
    },
  });

  const capturedImage = form.watch('destinationImageUrl');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraOpen(false);
    }
  }, []);

  const startCamera = async () => {
    stopCamera();
    try {
      // Get location for image
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        form.setValue('destinationImageCoords', { lat: latitude, lon: longitude });
      });

      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraOpen(true);
    } catch (err) {
      console.error(err);
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: 'Could not access the camera. Please check permissions.',
      });
    }
  };

  const handleCaptureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7); // compress image
      form.setValue('destinationImageUrl', dataUrl);
      stopCamera();
    }
  };


  useEffect(() => {
    if (trip) {
      form.reset(trip);
      if (trip.originCoords) {
          setOriginCoords(trip.originCoords)
          setOriginValue({label: trip.origin, value: trip.origin, ...trip.originCoords})
      };
      if (trip.destinationCoords) {
        setDestinationCoords(trip.destinationCoords)
        setDestinationValue({label: trip.destination, value: trip.destination, ...trip.destinationCoords})
      };
      if (trip.sharedWith) {
        setSharedWith(trip.sharedWith);
      }
    }
    // Cleanup camera on unmount
    return () => stopCamera();
  }, [trip, form, stopCamera]);

  useEffect(() => {
    if (initialOrigin) {
        setOriginValue(initialOrigin);
        handleOriginSelect(initialOrigin)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialOrigin]);

  useEffect(() => {
    if (prefilledDestination) {
        setDestinationValue({label: prefilledDestination, value: prefilledDestination, lat:0, lon: 0});
        form.setValue('destination', prefilledDestination);
    }
    if (prefilledPurpose) {
        form.setValue('purpose', prefilledPurpose);
    }
  }, [prefilledDestination, prefilledPurpose, form]);


  const handleOriginSelect = (place: Place | null) => {
    setOriginValue(place);
    if (place) {
      form.setValue('origin', place.label);
      const coords = { lat: place.lat, lon: place.lon };
      setOriginCoords(coords);
      onOriginChange?.({ latitude: place.lat, longitude: place.lon, name: place.label });
    } else {
      form.setValue('origin', '');
      setOriginCoords(null);
      onOriginChange?.(null);
    }
  }

  const handleDestinationSelect = (place: Place | null) => {
    setDestinationValue(place);
    if (place) {
      form.setValue('destination', place.label);
      const coords = { lat: place.lat, lon: place.lon };
      setDestinationCoords(coords);
      onDestinationChange?.({ latitude: place.lat, longitude: place.lon, name: place.label });
    } else {
      form.setValue('destination', '');
      setDestinationCoords(null);
      onDestinationChange?.(null);
    }
  }

  const handleAddFriend = async () => {
    if (!friendEmail) return;
    if (friendEmail === user?.email) {
      toast({ variant: "destructive", title: "You cannot add yourself." });
      return;
    }
    if (sharedWith.some(p => p.email === friendEmail)) {
        toast({ variant: "destructive", title: "User already added." });
        return;
    }

    setIsSearchingFriend(true);
    try {
        const foundUser = await findUserByEmail(friendEmail);
        if (foundUser) {
            setSharedWith(prev => [...prev, foundUser]);
            setFriendEmail("");
        } else {
            toast({ variant: "destructive", title: "User not found", description: "No user with that email exists." });
        }
    } catch(e) {
        toast({ variant: "destructive", title: "Error finding user" });
        console.error(e);
    } finally {
        setIsSearchingFriend(false);
    }
  }

  const handleRemoveFriend = (uid: string) => {
    setSharedWith(prev => prev.filter(p => p.uid !== uid));
  }

  async function onSubmit(data: TripFormValues) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Not authenticated",
            description: "You must be logged in to save a trip.",
        });
        return;
    }

    if (!originCoords || !destinationCoords) {
      toast({
        variant: 'destructive',
        title: "Missing Coordinates",
        description: "Please select a valid origin and destination from the search.",
      });
      return;
    }
    
    const participantUids = [user.uid, ...sharedWith.map(p => p.uid)];
    
    const tripData = {
        ...data,
        creatorId: trip?.creatorId || user.uid,
        participants: participantUids,
        sharedWith,
        originCoords,
        destinationCoords,
    };
    
    if (trip) {
        await updateTrip(trip.id, tripData);
        toast({
            title: "Trip Updated!",
            description: "Your trip has been successfully updated.",
        });
        router.push('/app');
    } else {
        await addTrip(tripData);
        toast({
          title: "Trip Saved!",
          description: "Your new trip has been added and shared.",
        });
        router.push('/app');
    }
  }

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      // Mocking sensor data for demonstration
      const result = await smartTripDetection({
        sensorData: "accelerometer: x=0.1, y=9.8, z=0.2; gyroscope: x=0, y=0, z=0",
        locationData: "lat: 8.5241, lon: 76.9366, accuracy: 10m",
        time: new Date().toISOString(),
      });
      setDetectionResult(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Detection Failed",
        description: "Could not automatically detect trip details.",
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const confirmDetection = () => {
    if (detectionResult) {
      const mode = transportationModes.includes(detectionResult.modeOfTransportation.toLowerCase()) 
        ? detectionResult.modeOfTransportation.toLowerCase() 
        : 'car';
      form.setValue('mode', mode as TransportationMode);
      toast({
        title: "Details pre-filled",
        description: `Mode of transport set to ${mode}. Please complete other details.`
      });
    }
    setDetectionResult(null);
  };

  const handleNudge = async () => {
    setIsNudging(true);
    setNudge(null);
    try {
        const recentTrips = trips.slice(0, 5);
        const input: NudgeForMissingDataInput = {
            currentLocation: 'Home',
            possibleDestinations: [...new Set(recentTrips.map(t => t.destination).slice(0,3))],
            missingInformation: 'destination',
            recentTripsForContext: recentTrips.map(t => ({
                origin: t.origin,
                destination: t.destination,
                purpose: t.purpose || 'not specified',
                time: t.startTime.toISOString(),
            }))
        };
      const result = await nudgeForMissingData(input);
      setNudge(result.nudgeMessage);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Nudge Failed",
        description: "Could not generate a suggestion at this time.",
      });
    } finally {
      setIsNudging(false);
    }
  };

  const handleRecommendation = async () => {
    const values = form.getValues();
    if (!values.origin || !values.destination) {
        toast({
            variant: "destructive",
            title: "Missing Information",
            description: "Please enter an origin and destination first.",
        });
        return;
    }
    setIsRecommending(true);
    setRecommendation(null);
    try {
        const result = await getAITripRecommendation({
            origin: values.origin,
            destination: values.destination,
            purpose: values.purpose,
            preferredMode: values.mode,
            // These would be dynamic in a real app
            trafficConditions: "moderate",
            weatherConditions: "clear and sunny",
        });
        setRecommendation(result);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Recommendation Failed",
        description: "Could not get an AI recommendation at this time.",
      });
    } finally {
      setIsRecommending(false);
    }
  };

  const confirmRecommendation = () => {
    if (recommendation) {
        form.setValue('mode', recommendation.recommendedMode);
        toast({
            title: "Mode Updated",
            description: `Switched to ${recommendation.recommendedMode} based on AI recommendation.`,
        });
    }
    setRecommendation(null);
  };

  const cardContent = (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="origin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Origin</FormLabel>
                  <FormControl>
                    <PlaceSearch
                      instanceId="origin-search"
                      placeholder="e.g., Home"
                      value={originValue}
                      onPlaceSelect={handleOriginSelect}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="destination"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination</FormLabel>
                  <FormControl>
                    <PlaceSearch
                       instanceId="destination-search"
                       placeholder="e.g., Office"
                       value={destinationValue}
                       onPlaceSelect={handleDestinationSelect}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField control={form.control} name="startTime" render={({ field }) => (
              <FormItem className="flex flex-col"><FormLabel>Start Time</FormLabel><DateTimePicker field={field} /><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="endTime" render={({ field }) => (
              <FormItem className="flex flex-col"><FormLabel>End Time</FormLabel><DateTimePicker field={field} /><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="mode" render={({ field }) => (
              <FormItem><FormLabel>Mode of Transport</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}><FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a mode" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {transportationModes.map(m => <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="purpose" render={({ field }) => (
              <FormItem><FormLabel>Purpose</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}><FormControl>
                  <SelectTrigger><SelectValue placeholder="Select a purpose" /></SelectTrigger></FormControl>
                  <SelectContent>
                    {tripPurposes.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="companions" render={({ field }) => (
              <FormItem><FormLabel>Companions</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Card className="bg-background/50">
              <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><UserPlus /> Share Trip & Expenses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex gap-2">
                      <Input 
                          type="email" 
                          placeholder="Enter friend's email" 
                          value={friendEmail}
                          onChange={(e) => setFriendEmail(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddFriend();
                            }
                          }}
                      />
                      <Button type="button" onClick={handleAddFriend} disabled={isSearchingFriend || !friendEmail}>
                          {isSearchingFriend ? <Loader2 className="animate-spin" /> : <Search />}
                      </Button>
                  </div>
                  <div className="space-y-2">
                      {sharedWith.map(person => (
                          <Badge key={person.uid} variant="secondary" className="flex justify-between items-center text-sm">
                              <span>{person.email}</span>
                              <button type="button" onClick={() => handleRemoveFriend(person.uid)} className="ml-2 rounded-full hover:bg-muted-foreground/20 p-0.5">
                                  <X className="h-3 w-3"/>
                              </button>
                          </Badge>
                      ))}
                  </div>
                  {sharedWith.length > 0 && <FormDescription>This trip and its expenses will be shared with these friends.</FormDescription>}
              </CardContent>
            </Card>

            <FormField control={form.control} name="expenses" render={({ field }) => (
                <FormItem>
                <FormLabel>Trip Expenses</FormLabel>
                <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <FormControl>
                        <Input type="number" min="0" placeholder="0.00" className="pl-8" {...field} />
                    </FormControl>
                </div>
                {sharedWith.length > 0 && <FormDescription>Total expense will be split among {sharedWith.length + 1} people.</FormDescription>}
                <FormMessage />
                </FormItem>
            )} />
            <FormField
              control={form.control}
              name="destinationImageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Image</FormLabel>
                  <Card>
                    <CardContent className="p-3">
                      <canvas ref={canvasRef} className="hidden" />
                      {isCameraOpen ? (
                        <div className="space-y-2">
                          <div className="bg-muted rounded-md overflow-hidden aspect-video flex items-center justify-center">
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"/>
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={handleCaptureImage} className="w-full">Capture</Button>
                            <Button onClick={stopCamera} variant="outline" className="w-full">Close Camera</Button>
                          </div>
                        </div>
                      ) : capturedImage ? (
                        <div className="space-y-2">
                          <Image src={capturedImage} alt="Captured destination" width={400} height={225} className="rounded-md w-full aspect-video object-cover" />
                          <Button onClick={() => form.setValue('destinationImageUrl', '')} variant="outline" className="w-full">Remove Image</Button>
                        </div>
                      ) : (
                        <Button onClick={startCamera} variant="outline" className="w-full flex items-center gap-2">
                          <CameraIcon />
                          Open Camera
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isNicePlace"
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
                      Nice place to visit
                    </FormLabel>
                    <FormDescription>
                      Get a vibration alert when you're about to arrive.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                        <Textarea
                        placeholder="Add any notes about your trip..."
                        className="resize-none"
                        {...field}
                        />
                    </FormControl>
                    <FormDescription>
                        You can add details like ticket numbers, reminders, or observations.
                    </FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
            />
          </div>
          <Button type="submit" className="w-full transition-transform active:scale-[0.98]">{trip ? 'Update Trip' : 'Save Trip'}</Button>
        </form>
      </Form>
  );

  const aiFeatures = !trip && (
    <div className="mt-6 space-y-4">
        <Button variant="outline" className="w-full" onClick={handleAutoDetect} disabled={isDetecting}>
        {isDetecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
        Assisted Data Capture
        </Button>

        <Button variant="secondary" className="w-full" onClick={handleRecommendation} disabled={isRecommending}>
            {isRecommending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
            Get AI Recommendation
        </Button>
        
        <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-accent/50" onClick={handleNudge} disabled={isNudging}>
        {isNudging ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
        Get a Travel Nudge
        </Button>

        {nudge && (
        <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertTitle>Suggestion</AlertTitle>
            <AlertDescription>{nudge}</AlertDescription>
        </Alert>
        )}
    </div>
  );

  return (
    <>
      {/* If on a dedicated form page, wrap in a Card */}
      { !onOriginChange && !onDestinationChange ? (
         <Card>
            <CardContent className="p-6">
                {cardContent}
                {aiFeatures}
            </CardContent>
         </Card>
      ) : (
        // If embedded, just render the form
        <div className="space-y-6">
            {cardContent}
            {aiFeatures}
        </div>
      )}
      
      <Dialog open={!!detectionResult} onOpenChange={() => setDetectionResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-headline">Trip Detected!</DialogTitle>
            <DialogDescription>
              We've analyzed the data and have a suggestion for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <p>Detected mode: <strong className="capitalize text-primary">{detectionResult?.modeOfTransportation}</strong></p>
            {detectionResult?.needUserConfirmation && detectionResult?.suggestedNudge && (
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Are you...</AlertTitle>
                <AlertDescription>{detectionResult.suggestedNudge}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetectionResult(null)}>Cancel</Button>
            <Button onClick={confirmDetection}>Confirm & Pre-fill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!recommendation} onOpenChange={() => setRecommendation(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle className="font-headline flex items-center gap-2">
                    <Bot /> AI Recommendation
                </DialogTitle>
                <DialogDescription>
                    Based on the trip details and current conditions, here's our suggestion.
                </DialogDescription>
            </DialogHeader>
            {recommendation && (
                <div className="space-y-4 py-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Recommended Mode</p>
                        <div className="flex items-center justify-center gap-3 mt-2">
                           {React.createElement(transportationIcons[recommendation.recommendedMode], { className: "h-8 w-8 text-primary" })}
                           <p className="text-2xl font-bold capitalize">{recommendation.recommendedMode}</p>
                        </div>
                    </div>
                    <Alert>
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle>Reasoning</AlertTitle>
                        <AlertDescription>{recommendation.reason}</AlertDescription>
                    </Alert>
                </div>
            )}
            <DialogFooter>
                <Button variant="outline" onClick={() => setRecommendation(null)}>Ignore</Button>
                <Button onClick={confirmRecommendation}>Use this Mode</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}


function DateTimePicker({ field }: { field: any }) {
  const [date, setDate] = useState<Date | undefined>(field.value ? new Date(field.value) : undefined);
  const [time, setTime] = useState(field.value ? format(new Date(field.value), "HH:mm") : "00:00");

  useEffect(() => {
    if(field.value) {
      const d = new Date(field.value);
      setDate(d);
      setTime(format(d, "HH:mm"));
    }
  }, [field.value])


  const handleDateChange = (newDate: Date | undefined) => {
    if (!newDate) return;
    setDate(newDate);
    const [hours, minutes] = time.split(':').map(Number);
    const combined = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate(), hours, minutes);
    field.onChange(combined);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTime(newTime);
    if (!date) return;
    const [hours, minutes] = newTime.split(':').map(Number);
    const combined = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
    field.onChange(combined);
  };

  return (
    <div className="flex gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "flex-1 justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        value={time}
        onChange={handleTimeChange}
        className="w-[120px]"
      />
    </div>
  );
}
