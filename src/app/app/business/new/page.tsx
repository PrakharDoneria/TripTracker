
'use client';

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NewBusinessPage() {
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
                                This feature is coming soon!
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-muted-foreground mb-4">
                                Soon, you'll be able to add your cafe, shop, or hotel to our map.
                                Check back for updates!
                            </p>
                            <Button disabled>Coming Soon</Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}
