
'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera as CameraIcon, VideoOff, Check, X, SwitchCamera } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type FacingMode = 'user' | 'environment';

export default function CameraPage() {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<FacingMode>('environment');

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setIsCameraOn(false);
    }
  }, []);

  const startCamera = useCallback(async (mode: FacingMode) => {
    stopCamera();
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode } });
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
    startCamera(facingMode);
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
  
  const handleFlipCamera = () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    startCamera(newFacingMode);
  }


  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-black">
        <Header />
        <main className="flex-1 flex flex-col relative">
            <canvas ref={canvasRef} className="hidden"></canvas>
            
            {capturedImage ? (
                <div className="flex-1 w-full h-full flex items-center justify-center bg-black">
                    <img src={capturedImage} alt="Captured" className="w-full h-auto max-h-full object-contain" />
                </div>
            ) : (
                <div className="flex-1 relative bg-muted flex items-center justify-center">
                    <video ref={videoRef} className={`w-full h-full object-cover ${!isCameraOn ? 'hidden' : ''}`} autoPlay playsInline muted />
                    {!isCameraOn && (
                         <div className="flex flex-col items-center text-muted-foreground">
                            <VideoOff className="h-12 w-12 mb-2" />
                            <p>Camera is off</p>
                        </div>
                    )}
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/50 to-transparent">
              <div className="flex justify-center items-center gap-4">
                  {isCameraOn && !capturedImage && (
                      <>
                        <div className='w-16 h-16' />
                        <Button onClick={handleCapture} size="lg" className="rounded-full w-20 h-20 border-4 border-white bg-transparent hover:bg-white/20">
                            <CameraIcon className="w-8 h-8 text-white" />
                        </Button>
                        <Button onClick={handleFlipCamera} variant="outline" size="icon" className="rounded-full w-16 h-16 bg-black/30 border-white/50 text-white">
                            <SwitchCamera className="w-6 h-6" />
                        </Button>
                      </>
                  )}
                  {capturedImage && (
                       <>
                          <Button onClick={handleRetake} variant="outline" size="lg" className="bg-black/50 text-white border-white/50">
                              <X className="mr-2" /> Retake
                          </Button>
                          <Button onClick={handleSave} size="lg">
                              <Check className="mr-2" /> Save
                          </Button>
                       </>
                  )}
              </div>
            </div>

             {!isCameraOn && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Button onClick={() => startCamera(facingMode)} size="lg">
                        <CameraIcon className="mr-2" /> Start Camera
                    </Button>
                </div>
            )}

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
