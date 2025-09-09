'use client';
import { Header } from "@/components/layout/header";
import { useTripStore } from "@/hooks/use-trip-store";
import dynamic from "next/dynamic";

const Map = dynamic(() => import('@/components/map/map'), {
  loading: () => <p>A map is loading...</p>,
  ssr: false
});

export default function MapPage() {
  const { trips } = useTripStore();

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Map trips={trips} />
      </main>
    </div>
  );
}
