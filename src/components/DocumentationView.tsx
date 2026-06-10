import React from 'react';
import { BookOpen, AlertTriangle, Lightbulb, Camera, CheckCircle2 } from 'lucide-react';

export default function Documentation() {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4 text-slate-300 pb-12">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:p-10 flex flex-col">
        <div className="mb-8">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            System Documentation
          </h2>
          <p className="text-[10px] text-slate-400 font-mono mt-1">Understanding Face Detection & Recognition</p>
        </div>

        <div className="space-y-12">
          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">1. Detection vs. Recognition</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-3 relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Camera className="w-32 h-32 text-indigo-400" />
                </div>
                <h4 className="text-sm font-bold text-indigo-400 uppercase">Face Detection</h4>
                <p className="text-xs leading-relaxed text-slate-400 relative z-10">
                  <strong className="text-slate-200 block mb-2">"Is there a face in this image?"</strong>
                  The system scans the image pixels to find patterns resembling a human face. It outputs a bounding box outlining where the face is located independently of whose face it is.
                </p>
              </div>
              <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 space-y-3 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CheckCircle2 className="w-32 h-32 text-emerald-400" />
                </div>
                <h4 className="text-sm font-bold text-emerald-400 uppercase">Face Recognition</h4>
                <p className="text-xs leading-relaxed text-slate-400 relative z-10">
                  <strong className="text-slate-200 block mb-2">"Whose face is this?"</strong>
                  Once extracted, features are mapped into a 128D mathematical descriptor. The Euclidean distance between this live descriptor and saved records is calculated to find a match.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">2. System Workflow</h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800 relative">
                 <div className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded inline-block mb-3 font-mono">STEP 01</div>
                 <h4 className="text-sm font-bold text-slate-200 mb-2">Initialization</h4>
                 <p className="text-xs text-slate-400">Loads TinyFaceDetector and RecognitionNet neural models into memory.</p>
              </div>
              <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800 relative">
                 <div className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded inline-block mb-3 font-mono">STEP 02</div>
                 <h4 className="text-sm font-bold text-slate-200 mb-2">Enrollment</h4>
                 <p className="text-xs text-slate-400">User registers face via webcam. Descriptor is computed and saved locally.</p>
              </div>
              <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800 relative">
                 <div className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded inline-block mb-3 font-mono">STEP 03</div>
                 <h4 className="text-sm font-bold text-slate-200 mb-2">Live Scanning</h4>
                 <p className="text-xs text-slate-400">Stream grabs video frames. Detector computes descriptors in real-time.</p>
              </div>
              <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-800 relative">
                 <div className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded inline-block mb-3 font-mono">STEP 04</div>
                 <h4 className="text-sm font-bold text-slate-200 mb-2">Attendance</h4>
                 <p className="text-xs text-slate-400">If distance falls below standard 0.55 threshold, attendance is fully automated.</p>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-widest text-amber-500/80 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Limitations & Improvements
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
               <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl">
                 <strong className="block text-sm text-amber-500/90 mb-1">Lighting Sensitivity</strong>
                 <p className="text-xs text-slate-400">Dark rooms reduce accuracy. <em className="text-slate-300">Fix: Add IR sensors.</em></p>
               </div>
               <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl">
                 <strong className="block text-sm text-amber-500/90 mb-1">Pose Variations</strong>
                 <p className="text-xs text-slate-400">Tilted faces alter mapping. <em className="text-slate-300">Fix: Multi-angle enrollment.</em></p>
               </div>
               <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl">
                 <strong className="block text-sm text-amber-500/90 mb-1">Liveness Spoofing</strong>
                 <p className="text-xs text-slate-400">Photographs can trick 2D logic. <em className="text-slate-300">Fix: Blink-detection.</em></p>
               </div>
               <div className="bg-amber-500/5 border border-amber-500/10 p-5 rounded-2xl">
                 <strong className="block text-sm text-amber-500/90 mb-1">Scalability</strong>
                 <p className="text-xs text-slate-400">Client-side limits FPS scaling. <em className="text-slate-300">Fix: GPU backend cluster.</em></p>
               </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
