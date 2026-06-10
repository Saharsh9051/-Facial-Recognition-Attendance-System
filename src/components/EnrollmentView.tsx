import React, { useRef, useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { Camera, RefreshCw, UserPlus } from 'lucide-react';
import { RegisteredFace } from '../types';

export default function EnrollmentView({
  onEnroll
}: {
  onEnroll: (face: Omit<RegisteredFace, 'id' | 'registeredAt'>) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [name, setName] = useState('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'info'|'success'|'error' }>({
    text: 'Please position your face clearly in the camera.',
    type: 'info'
  });

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      setStream(ms);
      if (videoRef.current) {
        videoRef.current.srcObject = ms;
      }
    } catch (err) {
      setMessage({ text: 'Error accessing webcam. Please check permissions.', type: 'error' });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleCapture = async () => {
    if (!name.trim()) {
      setMessage({ text: 'Please enter a name first.', type: 'error' });
      return;
    }
    
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    setMessage({ text: 'Detecting face...', type: 'info' });

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setMessage({ text: 'No face detected. Please ensure you are clearly visible.', type: 'error' });
        setIsCapturing(false);
        return;
      }

      // Draw detection box
      const displaySize = { width: videoRef.current.videoWidth, height: videoRef.current.videoHeight };
      faceapi.matchDimensions(canvasRef.current, displaySize);
      const resizedDetection = faceapi.resizeResults(detection, displaySize);
      
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      faceapi.draw.drawDetections(canvasRef.current, resizedDetection);

      // Save Data
      onEnroll({
        name: name.trim(),
        descriptor: Array.from(detection.descriptor) as unknown as Float32Array
      });

      setMessage({ text: `Successfully registered ${name.trim()}!`, type: 'success' });
      setName('');
      
      // Clear canvas after 2 seconds
      setTimeout(() => {
        if (canvasRef.current) {
          const ctx2 = canvasRef.current.getContext('2d');
          ctx2?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
        setMessage({ text: 'Please position your face clearly in the camera.', type: 'info' });
      }, 3000);

    } catch (err) {
      console.error(err);
      setMessage({ text: 'Face detection failed. Ensure models are loaded.', type: 'error' });
    }
    
    setIsCapturing(false);
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 w-full flex-grow max-w-6xl mx-auto items-stretch">
      <div className="col-span-12 lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative aspect-video lg:aspect-auto flex flex-col">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
        />
        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center text-slate-500 bg-slate-900">
            <Camera className="w-8 h-8 animate-pulse" />
          </div>
        )}
      </div>

      <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col">
          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-wider text-white">Enroll Face</h2>
            <p className="text-xs text-slate-400 mt-1">Register new subjects into the database.</p>
          </div>

          <div className={`text-[10px] font-mono px-3 py-2 rounded-lg mb-6 border ${
            message.type === 'error' ? 'text-red-400 bg-red-400/10 border-red-500/20' :
            message.type === 'success' ? 'text-emerald-400 bg-emerald-400/10 border-emerald-500/20' :
            'text-indigo-400 bg-indigo-400/10 border-indigo-500/20'
          }`}>
            {message.type === 'info' && 'STATUS: '}
            {message.text}
          </div>

          <div className="flex flex-col gap-3 flex-grow justify-end">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Subject Name..."
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isCapturing}
            />
            <button
              onClick={handleCapture}
              disabled={isCapturing || !stream || !name.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider text-sm flex items-center justify-center space-x-2 transition-colors disabled:border disabled:border-slate-700"
            >
              {isCapturing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>{isCapturing ? 'Processing' : 'Enroll Now'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
