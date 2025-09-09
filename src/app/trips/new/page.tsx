'use client';

import { Header } from "@/components/layout/header";
import { TripForm } from "@/components/trip/trip-form";

export default function NewTripPage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 font-headline text-foreground">Record a New Trip</h2>
          <TripForm />
        </div>
      </main>
    </div>
  )
}
