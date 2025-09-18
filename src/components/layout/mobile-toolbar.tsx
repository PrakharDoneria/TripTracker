
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LayoutDashboard, Map, Camera, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/app', icon: Home, label: 'Home' },
  { href: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/app/camera', icon: Camera, label: 'Camera', isCentral: true },
  { href: '/app/map', icon: Map, label: 'Map' },
  { href: '/app/more', icon: MoreHorizontal, label: 'More' },
];

export function MobileToolbar() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/50 backdrop-blur-sm border-t border-white/10 shadow-lg md:hidden">
      <div className="h-16 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          if (item.isCentral) {
            return (
              <Link href={item.href} key={item.href} className="relative">
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-lg transform transition-transform hover:scale-110">
                  <item.icon className="w-8 h-8 text-primary-foreground" />
                </div>
              </Link>
            );
          }

          return (
            <Link href={item.href} key={item.href}>
              <div
                className={cn(
                  'flex flex-col items-center justify-center gap-1 w-16 transition-colors',
                  isActive ? 'text-primary' : 'text-slate-400 hover:text-white'
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
