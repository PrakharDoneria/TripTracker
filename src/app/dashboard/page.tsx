'use client';

import { Header } from "@/components/layout/header";
import { useTripStore } from "@/hooks/use-trip-store";
import { ModeChart } from "@/components/dashboard/mode-chart";
import { FrequentDestinations } from "@/components/dashboard/frequent-destinations";
import { TripSuggestion } from "@/components/dashboard/trip-suggestion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Globe, Zap, Cog } from "lucide-react";

export default function DashboardPage() {
    const { trips } = useTripStore();
    
    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8">
                <h2 className="text-3xl font-bold font-headline text-foreground mb-8 text-center">Your Travel Insights</h2>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Battle-tested Infrastructure */}
                    <Card className="col-span-1 row-span-2 flex flex-col bg-card/50 backdrop-blur-sm border-white/10 rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Battle-tested infrastructure</CardTitle>
                            <CardDescription>Our SDK is designed to blend into your current project, working harmoniously across desktop, mobile and web platforms.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center">
                            <Image src="https://picsum.photos/400/300" data-ai-hint="world map" alt="World map" width={400} height={300} className="rounded-lg object-cover" />
                        </CardContent>
                    </Card>

                    {/* Complete Customization */}
                     <Card className="col-span-1 flex flex-col bg-card/50 backdrop-blur-sm border-white/10 rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Complete customization</CardTitle>
                            <CardDescription>Our SDK offers the highest level of customization that makes your vision a reality.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center">
                             <Image src="https://picsum.photos/400/200" data-ai-hint="customization theme" alt="Customization theme" width={400} height={200} className="rounded-lg object-cover" />
                        </CardContent>
                    </Card>

                    {/* Reliability */}
                    <Card className="col-span-1 flex flex-col bg-card/50 backdrop-blur-sm border-white/10 rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Reliability</CardTitle>
                             <CardDescription>We offer 24*7 support as roadblocks don't stick to business hours.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center">
                             <Image src="https://picsum.photos/400/200" data-ai-hint="reliability chart" alt="Reliability chart" width={400} height={200} className="rounded-lg object-cover" />
                        </CardContent>
                    </Card>

                    {/* Easy Integration */}
                    <Card className="col-span-1 flex flex-col bg-card/50 backdrop-blur-sm border-white/10 rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">Easy integration</CardTitle>
                            <CardDescription>Dyte will get the job done.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center">
                            <Image src="https://picsum.photos/400/200" data-ai-hint="integration flowchart" alt="Integration flowchart" width={400} height={200} className="rounded-lg object-cover" />
                        </CardContent>
                    </Card>
                    
                    {/* 24/7 support */}
                    <Card className="col-span-1 flex flex-col bg-card/50 backdrop-blur-sm border-white/10 rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold">24/7 support</CardTitle>
                             <CardDescription>Our dedicated Slack channel and CSM are ready to assist always.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex items-center justify-center">
                           <Image src="https://picsum.photos/400/200" data-ai-hint="support chat" alt="Support chat interface" width={400} height={200} className="rounded-lg object-cover" />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
