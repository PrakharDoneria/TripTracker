

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/app');
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-1 w-full h-full">
        <section className="relative w-full h-screen flex flex-col items-center justify-center text-center p-4">
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{backgroundImage: "url('https://picsum.photos/seed/welcome/1200/800')", filter: 'blur(2px) opacity(0.7)'}}
            data-ai-hint="whimsical travel illustration"
          />
          <div className="relative z-10 flex flex-col items-center justify-center space-y-6 bg-background/50 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none text-foreground">
                Your Next Adventure Awaits
              </h1>
              <p className="max-w-[600px] text-foreground/80 md:text-xl">
                Log your trips, get smart suggestions, and discover hidden gems. TripTracker makes every journey an adventure.
              </p>
            </div>
            <div className="flex flex-col gap-4 min-[400px]:flex-row">
              <Link href="/signup">
                <Button size="lg" className="w-full min-[400px]:w-auto">
                    Get Started
                </Button>
              </Link>
               <Link href="/login">
                <Button size="lg" variant="secondary" className="w-full min-[400px]:w-auto">
                    Login
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
