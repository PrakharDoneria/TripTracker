
'use client';

import { ProtectedRoute } from "@/hooks/use-auth";
import { useWakeLock } from "@/hooks/use-wake-lock";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    useWakeLock();
    
    return (
        <ProtectedRoute>
            {children}
        </ProtectedRoute>
    );
}
