import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { ScanFace, UserCheck, AlertCircle } from 'lucide-react';
import { createFaceMatcher } from '../lib/face';
import { RegisteredFace } from '../types';

export default function RecognitionView({
  registeredFaces,
  onRecognize,
  autoMarkAttendance
}: {
  registeredFaces: RegisteredFace[];
  onRecognize: (faceId: string, name: string) => void;
  autoMarkAttendance: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorCode, setErrorCode] = useState('');

  const [pendingMatch, setPendingMatch] = useState<{id: string, name: string} | null>(null);
  const pendingMatchRef = useRef<{id: string, name: string} | null>(null);

  const faceMatcherRef = useRef<faceapi.FaceMatcher | null>(null);
  const animationFrameRef = useRef<number>(0);
  
  // Debounce rapid recognitions of the same person
  const lastRecognizedRef = useRef<Record<string, number>>({});

  useEffect(() => {
    // Rebuild face matcher whenever registered faces change
    faceMatcherRef.current = createFaceMatcher(registeredFaces);
  }, [registeredFaces]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const startCamera = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(ms);
      if (videoRef.current) {
        videoRef.current.srcObject = ms;
      }
    } catch (err) {
      setErrorCode('Error accessing webcam. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const scanFaces = async () => {
    if (!videoRef.current || !canvasRef.current || !isScanning || videoRef.current.paused) {
      animationFrameRef.current = requestAnimationFrame(scanFaces);
      return;
    }

    try {
      const detections = await faceapi
        .detectAllFaces(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      if (displaySize.width > 0) {
        faceapi.matchDimensions(canvasRef.current, displaySize);
        const resizedDetections = faceapi.resizeResults(detections, displaySize);

        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        // Standard bounding box drawing
        const matcher = faceMatcherRef.current;
        
        resizedDetections.forEach(detection => {
          const box = detection.detection.box;
          let labelText = 'Unknown';
          let isUnknown = true;

          if (matcher) {
            const bestMatch = matcher.findBestMatch(detection.descriptor);
            if (bestMatch.label !== 'unknown') {
              labelText = `${registeredFaces.find(f => f.id === bestMatch.label)?.name ?? bestMatch.label} (${Math.round(bestMatch.distance * 100)}%)`;
              isUnknown = false;
              
              // Only trigger onRecognize at most once every 5 seconds per person to avoid spam
              const now = Date.now();
              const lastRecog = lastRecognizedRef.current[bestMatch.label] || 0;
              if (now - lastRecog > 5000) {
                const personName = registeredFaces.find(f => f.id === bestMatch.label)?.name || bestMatch.label;
                
                if (autoMarkAttendance) {
                  lastRecognizedRef.current[bestMatch.label] = now;
                  onRecognize(bestMatch.label, personName);
                } else {
                  if (!pendingMatchRef.current || pendingMatchRef.current.id !== bestMatch.label) {
                    pendingMatchRef.current = { id: bestMatch.label, name: personName };
                    setPendingMatch(pendingMatchRef.current);
                  }
                }
              }
            }
          }

          // Draw custom box
          ctx!.strokeStyle = isUnknown ? '#ef4444' : '#818cf8'; // indigo-400
          ctx!.lineWidth = 3;
          ctx!.strokeRect(box.x, box.y, box.width, box.height);

          // Draw label
          ctx!.fillStyle = isUnknown ? '#ef4444' : '#4f46e5'; // indigo-600
          const textWidth = ctx!.measureText(labelText).width;
          ctx!.fillRect(box.x, box.y - 25, textWidth + 10, 25);
          
          ctx!.fillStyle = '#ffffff';
          ctx!.font = '16px Inter, sans-serif';
          ctx!.fillText(labelText, box.x + 5, box.y - 8);
        });
      }
    } catch (err) {
      console.error(err);
    }

    animationFrameRef.current = requestAnimationFrame(scanFaces);
  };

  useEffect(() => {
    if (isScanning && stream) {
      scanFaces();
    }
  }, [isScanning, stream]);

  const handleConfirm = () => {
    if (pendingMatch) {
       onRecognize(pendingMatch.id, pendingMatch.name);
       lastRecognizedRef.current[pendingMatch.id] = Date.now();
       setPendingMatch(null);
       pendingMatchRef.current = null;
    }
  };

  const handleDismiss = () => {
    if (pendingMatch) {
       lastRecognizedRef.current[pendingMatch.id] = Date.now();
       setPendingMatch(null);
       pendingMatchRef.current = null;
    }
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 lg:grid-rows-6 gap-4 w-full flex-grow items-stretch max-w-6xl mx-auto relative">
      
      {pendingMatch && !autoMarkAttendance && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex flex-col items-center justify-center p-4 rounded-3xl">
           <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col items-center text-center w-full max-w-sm shrink-0 shadow-2xl">
              <div className="w-20 h-20 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6">
                 <UserCheck className="w-10 h-10 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Confirm Attendance</h3>
              <p className="text-slate-400 text-sm mb-8">Subject recognized as <strong className="text-slate-200 block text-lg mt-1">{pendingMatch.name}</strong></p>
              
              <div className="flex gap-4 w-full">
                 <button onClick={handleDismiss} className="flex-1 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 px-4 py-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors">
                    Dismiss
                 </button>
                 <button onClick={handleConfirm} className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-4 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-lg shadow-indigo-500/20">
                    Confirm
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Main Camera Feed */}
      <div className="col-span-8 row-span-4 bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative aspect-video lg:aspect-auto flex flex-col">
        
        {registeredFaces.length === 0 && (
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center space-x-3 bg-amber-500/10 text-amber-300 border border-amber-500/20 px-4 py-3 rounded-xl backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">No faces enrolled yet. Please go to the Enroll tab to add some faces first.</p>
          </div>
        )}

        {errorCode && (
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center space-x-3 bg-red-500/10 text-red-400 border border-red-500/20 px-4 py-3 rounded-xl backdrop-blur-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{errorCode}</p>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onPlay={() => setIsScanning(true)}
          onPause={() => setIsScanning(false)}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 z-0"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none z-10"
        />
        
        {!stream && !errorCode && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-900 z-10">
             Logging in camera feed...
          </div>
        )}
        
        {isScanning && (
          <div className="absolute top-6 left-6 z-20 flex flex-col gap-2">
            <div className="bg-black/50 backdrop-blur-md px-3 py-1 rounded text-[10px] font-mono text-emerald-400 border border-white/10 uppercase flex items-center gap-2">
               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
               SCANNING ACTIVE
            </div>
          </div>
        )}
      </div>
      
      {/* Action Cards */}
      <div className="col-span-4 row-span-4 flex flex-col gap-4">
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Enrolled Subjects</p>
          <div className="flex items-end gap-2">
            <h3 className="text-6xl font-bold leading-none text-white">{registeredFaces.length}</h3>
          </div>
        </div>

        <div 
          className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-center items-center text-center hover:bg-slate-800 transition-colors cursor-pointer group"
          onClick={() => setIsScanning(!isScanning)}
        >
          {isScanning ? (
              <>
                <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <AlertCircle className="h-8 w-8 text-red-400" />
                </div>
                <p className="text-sm font-bold text-red-400">Stop Scanning</p>
                <p className="text-[10px] text-slate-500">Pause facial recognition</p>
              </>
           ) : (
             <>
               <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <ScanFace className="h-8 w-8 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-emerald-400">Start Scanning</p>
                <p className="text-[10px] text-slate-500">Resume facial recognition</p>
             </>
           )}
        </div>
      </div>
    </div>
  );
}
