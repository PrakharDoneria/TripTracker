
'use client';

import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTripStore } from "@/hooks/use-trip-store";
import { Download, Briefcase, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MobileToolbar } from "@/components/layout/mobile-toolbar";

export default function MorePage() {
    const { trips } = useTripStore();
    const { logout } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const handleExport = () => {
        try {
            const dataStr = JSON.stringify(trips, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `TripTracker_Export_${new Date().toISOString().split('T')[0]}.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            document.body.appendChild(linkElement);
            linkElement.click();
            document.body.removeChild(linkElement);
        } catch (error) {
            console.error("Failed to export data:", error);
            toast({ variant: 'destructive', title: "Export Failed", description: "An error occurred while exporting data." });
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            toast({
                title: "Logged Out",
                description: "You have been successfully logged out.",
            });
            router.push('/login');
        } catch (error) {
            console.error("Failed to log out:", error);
            toast({
                variant: "destructive",
                title: "Logout Failed",
                description: "An error occurred while logging out. Please try again.",
            });
        }
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <Header />
            <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 mb-20 md:mb-0">
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold font-headline text-foreground mb-6">More Options</h2>
                    <div className="space-y-4">
                        <Card>
                             <CardContent className="p-4 flex flex-col gap-2">
                                <Link href="/app/business/new" className="w-full">
                                    <Button variant="outline" className="w-full justify-start text-base py-6">
                                        <Briefcase className="mr-4" /> List Your Business
                                    </Button>
                                </Link>
                                <Button variant="outline" onClick={handleExport} disabled={trips.length === 0} className="w-full justify-start text-base py-6">
                                    <Download className="mr-4" /> Export My Data
                                </Button>
                                 <Button variant="destructive" onClick={handleLogout} className="w-full justify-start text-base py-6">
                                    <LogOut className="mr-4" /> Log Out
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <MobileToolbar />
        </div>
    )
}
