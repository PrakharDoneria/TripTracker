
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const useWakeLock = () => {
  const [status, setStatus] = useState('inactive');
  const wakeLockSentinel = useRef<WakeLockSentinel | null>(null);

  const requestWakeLock = useCallback(async () => {
    if (typeof window === 'undefined' || !('wakeLock' in navigator)) {
      setStatus('unsupported');
      return;
    }
    
    if (wakeLockSentinel.current) {
        setStatus('active');
        return;
    }

    try {
      wakeLockSentinel.current = await navigator.wakeLock.request('screen');
      setStatus('active');

      wakeLockSentinel.current.addEventListener('release', () => {
        // The wake lock has been released
        setStatus('inactive');
        wakeLockSentinel.current = null;
      });

    } catch (err: any) {
      console.warn(`Failed to acquire wake lock: ${err.name}, ${err.message}`);
      setStatus('error');
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockSentinel.current) {
      await wakeLockSentinel.current.release();
      wakeLockSentinel.current = null;
      setStatus('inactive');
    }
  }, []);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Re-request the wake lock if the page becomes visible again
      if (document.visibilityState === 'visible') {
        requestWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      releaseWakeLock();
    };
  }, [requestWakeLock, releaseWakeLock]);

  return { status, requestWakeLock, releaseWakeLock };
};

export default useWakeLock;
