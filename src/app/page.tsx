
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { AuthLayout } from '@/components/layout/auth-layout';

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
    <AuthLayout>
        <div className="flex flex-col justify-center text-center text-foreground h-full p-8">
            <div className="space-y-4 flex-grow flex flex-col justify-center items-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-headline">
                WELCOME TO <br /> <span className='text-primary'>Raahi</span>
              </h1>
              <p className="max-w-[600px] text-foreground/80 md:text-lg">
                Find places and explore your favorite destinations with us.
              </p>
            </div>
            <div className="w-full pb-8">
              <Link href="/signup" className="w-full">
                <Button size="lg" className="w-full">
                    Get Started
                </Button>
              </Link>
               <Link href="/login" className="w-full block mt-4">
                <Button size="lg" variant="secondary" className="w-full">
                    Login
                </Button>
              </Link>
            </div>
          </div>
    </AuthLayout>
  );
}
