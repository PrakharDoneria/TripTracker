
'use client';
import Image from 'next/image';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm h-[80vh] min-h-[600px] max-h-[800px] bg-card rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Background Illustration */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/background.jpg"
                    alt="Whimsical landscape illustration"
                    data-ai-hint="whimsical landscape illustration"
                    fill
                    className="object-cover opacity-20"
                />
            </div>

            {/* Foreground Content Container */}
            <div className="relative z-10 flex-grow mt-[30%]">
                 <div className="relative z-20 h-full">
                    {children}
                </div>
            </div>
        </div>
    </div>
  );
}
