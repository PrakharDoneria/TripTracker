
'use client';
import Image from 'next/image';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-6xl mx-auto h-[90vh] min-h-[600px] md:grid md:grid-cols-2 shadow-2xl rounded-3xl overflow-hidden bg-card">
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
            <div className="relative h-full">
                {children}
            </div>
        </div>
    </div>
  );
}
