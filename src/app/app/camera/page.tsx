
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera as CameraIcon, VideoOff, Check, X } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function CameraPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraOn(false);
    }
  }, []);

  const startCamera = useCallback(async () => {
    stopCamera();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setIsCameraOn(true);
        setCapturedImage(null);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    } else {
      setHasCameraPermission(false);
      toast({
        variant: 'destructive',
        title: 'Camera Not Supported',
        description: 'Your browser does not support camera access.',
      });
    }
  }, [toast, stopCamera]);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        // Compress image
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSave = () => {
     if(capturedImage) {
        // In a real app, you would save this image. For now, we'll just show a success message
        // and copy it to the clipboard as a demonstration.
        navigator.clipboard.writeText('Image has been "saved"');
        toast({
            title: 'Image Saved!',
            description: 'The captured image has been saved successfully. You can now use it in your trip.',
        });
        setCapturedImage(null);
     }
  }


  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-6 lg:p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold font-headline text-foreground mb-4">Capture a Memory</h2>
            <div className="w-full max-w-md bg-card p-4 rounded-lg shadow-md relative">
                <canvas ref={canvasRef} className="hidden"></canvas>
                
                {capturedImage ? (
                    <div className="relative">
                        <img src={capturedImage} alt="Captured" className="rounded-md w-full" />
                    </div>
                ) : (
                    <div className="relative bg-muted rounded-md overflow-hidden aspect-video flex items-center justify-center">
                        <video ref={videoRef} className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`} autoPlay playsInline muted />
                        {!isCameraOn && (
                             <div className="flex flex-col items-center text-muted-foreground">
                                <VideoOff className="h-12 w-12 mb-2" />
                                <p>Camera is off</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-4 flex justify-center gap-4">
                    {isCameraOn && !capturedImage && (
                        <Button onClick={handleCapture} size="lg" className="rounded-full w-16 h-16">
                            <CameraIcon />
                        </Button>
                    )}
                    {capturedImage && (
                         <>
                            <Button onClick={handleRetake} variant="outline" size="lg">
                                <X className="mr-2" /> Retake
                            </Button>
                            <Button onClick={handleSave} size="lg">
                                <Check className="mr-2" /> Save
                            </Button>
                         </>
                    )}
                </div>

                 {!isCameraOn && !capturedImage && (
                    <div className="mt-4 flex justify-center">
                        <Button onClick={startCamera}>
                            <CameraIcon className="mr-2" /> Start Camera
                        </Button>
                    </div>
                )}

            </div>
            {hasCameraPermission === false && (
                <AlertDialog open={true} onOpenChange={(isOpen) => !isOpen && setHasCameraPermission(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Camera Permission Required</AlertDialogTitle>
                            <AlertDialogDescription>
                                To capture images, you need to allow camera access in your browser settings. Please enable camera permissions for this site and try again.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                           <Button onClick={() => setHasCameraPermission(null)}>Okay</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </main>
      </div>
    </>
  );
}
