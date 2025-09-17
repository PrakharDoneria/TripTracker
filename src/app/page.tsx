
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card shadow-sm sticky top-0 z-40 border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
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
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Your Intelligent Travel Companion
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Log your trips, get smart suggestions, and discover hidden gems. TripTracker makes every journey an adventure.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link
                    href="/signup"
                  >
                    <Button size="lg">
                        Get Started
                    </Button>
                  </Link>
                </div>
              </div>
              <img
                src="https://picsum.photos/seed/landing/600/400"
                width="600"
                height="400"
                alt="Hero"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
                data-ai-hint="travel journey"
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
