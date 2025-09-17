
'use client';

import { useState, useEffect, useRef } from 'react';

/**
 * A custom hook to request and manage a screen wake lock.
 * This prevents the device screen from turning off, which is useful for
 * applications that need to remain visible, like navigation or tracking apps.
 *
 * @returns The status of the wake lock (e.g., 'active', 'inactive', 'unsupported').
 */
export function useWakeLock(): string {
  const [status, setStatus] = useState('inactive');
  const wakeLockSentinel = useRef<WakeLockSentinel | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      setStatus('unsupported');
      return;
    }

    let isMounted = true;

    const requestWakeLock = async () => {
      try {
        wakeLockSentinel.current = await navigator.wakeLock.request('screen');
        if (isMounted) setStatus('active');
        
        wakeLockSentinel.current.addEventListener('release', () => {
          if (isMounted) {
            setStatus('inactive');
            wakeLockSentinel.current = null;
          }
        });
      } catch (err: any) {
        if (isMounted) {
          console.error(`Failed to acquire wake lock: ${err.name}, ${err.message}`);
          setStatus('error');
        }
      }
    };

    requestWakeLock();

    const handleVisibilityChange = () => {
      if (wakeLockSentinel.current === null && document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      if (wakeLockSentinel.current) {
        wakeLockSentinel.current.release();
        wakeLockSentinel.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return status;
}
