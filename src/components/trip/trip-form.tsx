"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { Calendar as CalendarIcon, Loader2, Wand2, Lightbulb } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import type { Trip, TransportationMode } from "@/lib/types"
import { useToast } from "@/hooks/use-toast"
import { smartTripDetection, NudgeForMissingDataInput, nudgeForMissingData } from "@/ai/flows"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  origin: z.string().min(2, "Origin is too short").max(50, "Origin is too long"),
  destination: z.string().min(2, "Destination is too short").max(50, "Destination is too long"),
  startTime: z.date({ required_error: "Start time is required." }),
  endTime: z.date({ required_error: "End time is required." }),
  mode: z.enum(['walk', 'bike', 'car', 'bus', 'train'], { required_error: "Mode is required." }),
  companions: z.coerce.number().int().min(0, "Cannot be negative").max(20, "Max 20 companions"),
}).refine((data) => data.endTime > data.startTime, {
  message: "End time must be after start time.",
  path: ["endTime"],
});

type TripFormValues = z.infer<typeof formSchema>;

const transportationModes: TransportationMode[] = ['walk', 'bike', 'car', 'bus', 'train'];

interface TripFormProps {
  onAddTrip: (trip: Omit<Trip, 'id'>) => void;
}

export function TripForm({ onAddTrip }: TripFormProps) {
  const { toast } = useToast();
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [isNudging, setIsNudging] = useState(false);
  const [nudge, setNudge] = useState<string | null>(null);

  const form = useForm<TripFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      origin: "",
      destination: "",
      companions: 0,
      startTime: new Date(),
      endTime: new Date(new Date().getTime() + 60 * 60 * 1000), // 1 hour later
    },
  });

  function onSubmit(data: TripFormValues) {
    onAddTrip(data);
    form.reset();
    toast({
      title: "Trip Saved!",
      description: "Your new trip has been added to your trip chain.",
    });
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
      const input: NudgeForMissingDataInput = {
        currentLocation: 'Home',
        possibleDestinations: ['Office', 'Gym', 'Mall'],
        missingInformation: 'destination',
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


  return (
    <>
      <Card>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField control={form.control} name="origin" render={({ field }) => (
                  <FormItem><FormLabel>Origin</FormLabel><FormControl><Input placeholder="e.g., Home" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="destination" render={({ field }) => (
                  <FormItem><FormLabel>Destination</FormLabel><FormControl><Input placeholder="e.g., Office" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="startTime" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Start Time</FormLabel><DateTimePicker field={field} /><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="endTime" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>End Time</FormLabel><DateTimePicker field={field} /><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="mode" render={({ field }) => (
                  <FormItem><FormLabel>Mode of Transport</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a mode" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {transportationModes.map(m => <SelectItem key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</SelectItem>)}
                      </SelectContent>
                    </Select><FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="companions" render={({ field }) => (
                  <FormItem><FormLabel>Companions</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full transition-transform active:scale-[0.98]">Save Trip</Button>
            </form>
          </Form>
          
          <div className="mt-6 space-y-4">
            <Button variant="outline" className="w-full" onClick={handleAutoDetect} disabled={isDetecting}>
              {isDetecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
              Assisted Data Capture
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

        </CardContent>
      </Card>
      
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
    </>
  );
}


function DateTimePicker({ field }: { field: any }) {
  const [date, setDate] = useState<Date | undefined>(field.value);
  const [time, setTime] = useState(field.value ? format(field.value, "HH:mm") : "00:00");

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
