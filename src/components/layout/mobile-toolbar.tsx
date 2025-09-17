
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Map, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/app', icon: Home, label: 'Home' },
  { href: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/app/camera', icon: Camera, label: 'Camera', isCentral: true },
  { href: '/app/map', icon: Map, label: 'Map' },
  { href: '/app/trips/new', label: 'Add Trip' },
];

export function MobileToolbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t shadow-lg md:hidden">
      <div className="h-16 flex items-center justify-around">
        {navItems.map((item) => {
          if (item.label === 'Add Trip') return null; // We handle this separately
          
          const isActive = pathname === item.href;

          if (item.isCentral) {
            return (
              <Link href={item.href} key={item.href} className="relative">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                  <item.icon className="w-7 h-7 text-primary-foreground" />
                </div>
              </Link>
            );
          }

          return (
            <Link href={item.href} key={item.href}>
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-16 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
