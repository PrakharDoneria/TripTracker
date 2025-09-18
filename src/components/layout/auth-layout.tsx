
'use client';
import Image from 'next/image';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4 overflow-hidden relative">
        <div className="w-full max-w-6xl mx-auto h-[90vh] min-h-[600px] md:grid md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden bg-card">
             {/* Background and animation for mobile */}
            <div className="absolute top-0 left-0 w-full h-full md:hidden">
              <Image
                  src="/background.jpg"
                  alt="Whimsical landscape illustration"
                  data-ai-hint="whimsical landscape illustration"
                  fill
                  className="object-cover"
              />
               <div className="absolute inset-0 overflow-hidden">
                    <div className="cloud w-64 h-32 top-[10%]" style={{ animationDuration: '50s' }}></div>
                    <div className="cloud w-48 h-24 top-[30%] left-[-10%]" style={{ animationDuration: '60s', animationDelay: '-10s' }}></div>
                    <div className="cloud w-80 h-40 top-[50%]" style={{ animationDuration: '70s', animationDelay: '-20s' }}></div>
                    <div className="cloud w-56 h-28 top-[70%]" style={{ animationDuration: '55s', animationDelay: '-5s' }}></div>
                </div>
            </div>
             
             {/* Left side with Image - Hidden on mobile */}
            <div className="hidden md:block relative h-full">
                <Image
                    src="/background.jpg"
                    alt="Whimsical landscape illustration"
                    data-ai-hint="whimsical landscape illustration"
                    fill
                    className="object-cover"
                />
            </div>
            {/* Right side with content */}
            <div className="relative h-full bg-card/80 md:bg-card">
                {children}
            </div>
        </div>
    </div>
  );
}
