'use client';
import { useEffect, useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from './ui/button';

const CONSENT_KEY = 'trip-tracker-consent';

export function ConsentModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // This effect runs only on the client
    const consentGiven = localStorage.getItem(CONSENT_KEY);
    if (consentGiven !== 'true') {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(CONSENT_KEY, 'true');
    setIsOpen(false);
  };

  const handleDecline = () => {
    // In a real app, you might want to show a message or disable functionality
    setIsOpen(false);
    alert("You have declined consent. The app's functionality will be limited.");
  };

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-headline">We value your privacy</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              To help improve transportation planning with NATPAC, this app collects trip data, including location and sensor information. This data will be shared anonymously with NATPAC scientists.
            </p>
            <p>
              By clicking "Accept", you consent to the collection and sharing of your trip data for research purposes.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleDecline}>Decline</Button>
          <AlertDialogAction onClick={handleAccept}>Accept</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
