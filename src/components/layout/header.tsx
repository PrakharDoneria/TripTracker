
'use client';

import { Map, LayoutDashboard, PlusCircle, MoreVertical, LogOut, Briefcase, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { usePWAInstall } from '@/hooks/use-pwa-install';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const pathname = usePathname();
  const { installPrompt, handleInstall } = usePWAInstall();

  const navItems = [
    { href: '/app/map', label: 'Map' },
    { href: '/app/dashboard', label: 'Dashboard' },
  ];

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
    <header className="bg-card/80 backdrop-blur-sm sticky top-0 z-40 border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/app" className="flex items-center gap-2 sm:gap-3">
            <Image src="/logo.png" alt="Raahi logo" width={32} height={32} className="h-7 w-7 sm:h-8 sm:w-8" />
            <h1 className="text-xl sm:text-2xl font-bold font-headline text-foreground">
              Raahi
            </h1>
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {/* PWA Install Button for mobile */}
          {installPrompt && (
            <div className="md:hidden">
              <Button onClick={handleInstall} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Install App
              </Button>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                    <Button 
                        variant="link"
                        className={cn("text-muted-foreground hover:text-primary hover:no-underline text-base", 
                            pathname === item.href && "text-primary font-semibold"
                        )}
                    >
                        {item.label}
                    </Button>
                </Link>
            ))}
             <div className="h-8 w-px bg-border mx-2" />
            <Link href="/app/trips/new">
              <Button>
                <PlusCircle className="mr-2 h-5 w-5" />
                Add Trip
              </Button>
            </Link>
          </nav>
          
          <div className="h-8 w-px bg-border hidden md:block mx-2" />

          {/* User Menu */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Avatar className="h-9 w-9 cursor-pointer">
                    <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                 </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                 {installPrompt && (
                  <DropdownMenuItem onClick={handleInstall} className="md:hidden">
                    <Download className="mr-2 h-4 w-4" />
                    <span>Install App</span>
                  </DropdownMenuItem>
                 )}
                 <DropdownMenuItem asChild>
                    <Link href="/app/business/new">
                        <Briefcase className="mr-2 h-4 w-4" />
                        <span>List Your Business</span>
                    </Link>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                    <Link href="/app/more">
                        <MoreVertical className="mr-2 h-4 w-4" />
                        <span>More Options</span>
                    </Link>
                </DropdownMenuItem>
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
