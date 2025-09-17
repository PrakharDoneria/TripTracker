

'use client';

import { Download, Map, Home, LayoutDashboard, Camera, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTripStore } from '@/hooks/use-trip-store';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from '@/hooks/use-toast';

export function Header() {
  const { trips } = useTripStore();
  const { user, logout } = useAuth();
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
      alert("An error occurred while exporting data. Please try again.");
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
    <header className="bg-card shadow-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/app" className="flex items-center gap-2 sm:gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 sm:h-8 sm:w-8 text-primary"
            >
              <path d="M10.6,3.4a1.5,1.5,0,0,1,2.8,0l3.9,6.9a1.5,1.5,0,0,1-1.3,2.2H8a1.5,1.5,0,0,1-1.3-2.2Z" />
              <path d="M17.2,12.5l-3.9,6.9a1.5,1.5,0,0,1-2.6,0l-3.9-6.9" />
            </svg>
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
              TripTracker
            </h1>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/app">
            <Button variant="ghost" size="icon">
              <Home className="h-5 w-5" />
              <span className="sr-only">Home</span>
            </Button>
          </Link>
          <Link href="/app/dashboard">
            <Button variant="ghost" size="icon">
              <LayoutDashboard className="h-5 w-5" />
              <span className="sr-only">Dashboard</span>
            </Button>
          </Link>
          <Link href="/app/map">
            <Button variant="ghost" size="icon">
              <Map className="h-5 w-5" />
              <span className="sr-only">Map View</span>
            </Button>
          </Link>
          <Link href="/app/camera">
            <Button variant="ghost" size="icon">
              <Camera className="h-5 w-5" />
              <span className="sr-only">Camera View</span>
            </Button>
          </Link>

          <Button onClick={handleExport} disabled={trips.length === 0} variant="outline" size="sm" className="hidden sm:inline-flex">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
           <Button onClick={handleExport} disabled={trips.length === 0} variant="ghost" size="icon" className="sm:hidden">
            <Download className="h-5 w-5" />
            <span className="sr-only">Export Data</span>
          </Button>

          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
