
'use client';
import Image from 'next/image';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full bg-green-100 flex items-center justify-center p-4">
        <div className="relative w-full max-w-sm h-[80vh] min-h-[600px] max-h-[800px] bg-[#9AD284] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
            {/* Background Illustration */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://picsum.photos/seed/travel-illustration/400/800"
                    alt="Whimsical landscape illustration"
                    data-ai-hint="whimsical landscape illustration"
                    fill
                    className="object-cover"
                />
                 {/* This is a placeholder for the complex SVG clouds from the design */}
                 <div className="absolute top-10 -left-10 w-40 h-20 bg-white/80 rounded-full blur-md opacity-50"></div>
                 <div className="absolute top-20 -right-16 w-48 h-24 bg-white/80 rounded-full blur-md opacity-50"></div>
            </div>

            {/* Foreground Content Container */}
            <div className="relative z-10 flex-grow mt-[30%] bg-gradient-to-t from-[#9AD284] via-[#9AD284]/90 to-transparent">
                 <div className="relative z-20 h-full">
                    {children}
                </div>
            </div>
        </div>
    </div>
  );
}
