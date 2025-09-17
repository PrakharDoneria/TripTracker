
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
    // Check if the Screen Wake Lock API is supported by the browser.
    if (!('wakeLock' in navigator)) {
      setStatus('unsupported');
      return;
    }

    // Function to request the wake lock.
    const requestWakeLock = async () => {
      try {
        wakeLockSentinel.current = await navigator.wakeLock.request('screen');
        setStatus('active');

        // Listen for the release event, which can happen if the tab is minimized
        // or the user switches to another tab.
        wakeLockSentinel.current.addEventListener('release', () => {
          setStatus('inactive');
        });
      } catch (err: any) {
        console.error(`Failed to acquire wake lock: ${err.name}, ${err.message}`);
        setStatus('error');
      }
    };

    requestWakeLock();

    // Re-acquire the wake lock when the page visibility changes (e.g., user tabs back).
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && !wakeLockSentinel.current) {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function to release the wake lock when the component unmounts.
    return () => {
      if (wakeLockSentinel.current) {
        wakeLockSentinel.current.release();
        wakeLockSentinel.current = null;
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  return status;
}
