

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Map, Camera, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';

const navItems = [
  { href: '/app', icon: Home, label: 'Home' },
  { href: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/app/map', icon: Map, label: 'Map' },
  { href: '/app/more', icon: Camera, label: 'More' },
];

export function MobileToolbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-sm border-t border-border shadow-lg md:hidden">
      <div className="h-16 flex items-center justify-around relative">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href;
          
           if (index === 2) {
            return (
              <React.Fragment key="add-button-fragment">
                <div className="w-16 h-16 flex justify-center items-center">
                    <Link href="/app/trips/new">
                        <Button size="icon" className="w-14 h-14 rounded-full shadow-lg">
                            <Plus className="w-8 h-8" />
                        </Button>
                    </Link>
                </div>
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
              </React.Fragment>
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

// Need to import React for the Fragment
import React from 'react';
