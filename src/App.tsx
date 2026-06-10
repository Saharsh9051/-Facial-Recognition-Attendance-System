/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { loadFaceAPIModels } from './lib/face';
import { useLocalStorage } from './lib/useLocalStorage';
import { RegisteredFace, AttendanceRecord, TabState, AppSettings } from './types';
import { Camera, ClipboardList, ScanFace, BookOpen, Loader2, Settings } from 'lucide-react';

import EnrollmentView from './components/EnrollmentView';
import RecognitionView from './components/RecognitionView';
import AttendanceLogs from './components/AttendanceLogs';
import DocumentationView from './components/DocumentationView';
import SettingsView from './components/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabState>('scan');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState('');

  const [settings, setSettings] = useLocalStorage<AppSettings>('fs-settings', { autoMarkAttendance: true });

  const [registeredFaces, setRegisteredFaces] = useLocalStorage<RegisteredFace[]>('fs-faces', []);
  const [attendanceLogs, setAttendanceLogs] = useLocalStorage<AttendanceRecord[]>('fs-logs', []);

  useEffect(() => {
    loadFaceAPIModels()
      .then((success) => {
        if (success) {
          setModelsLoaded(true);
        } else {
          setLoadingError('Failed to load Face API models. Check network connectivity.');
        }
      });
  }, []);

  const handleEnroll = (faceData: Omit<RegisteredFace, 'id' | 'registeredAt'>) => {
    const newFace: RegisteredFace = {
      ...faceData,
      id: crypto.randomUUID(),
      registeredAt: new Date().toISOString()
    };
    setRegisteredFaces([...registeredFaces, newFace]);
  };

  const handleRecognize = (userId: string, name: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    
    // Check if attendance already marked today
    const alreadyMarkedToday = attendanceLogs.find(
      (log) => log.userId === userId && log.dateStr === dateStr
    );

    if (!alreadyMarkedToday) {
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        userId,
        name,
        timestamp: now.toISOString(),
        dateStr
      };
      setAttendanceLogs([...attendanceLogs, newRecord]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-indigo-500/30 flex flex-col p-4 sm:p-6">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
            <ScanFace className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Faceshift <span className="text-indigo-400 text-sm font-medium ml-2 uppercase tracking-widest">Attendance</span></h1>
            <p className="text-xs text-slate-400">Automated Facial Recognition System</p>
          </div>
        </div>
        
        <nav className="flex items-center space-x-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto w-full sm:w-auto">
          <TabButton active={activeTab === 'scan'} onClick={() => setActiveTab('scan')} icon={<ScanFace className="w-4 h-4" />} label="Recognize" />
          <TabButton active={activeTab === 'enroll'} onClick={() => setActiveTab('enroll')} icon={<Camera className="w-4 h-4" />} label="Enroll" />
          <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<ClipboardList className="w-4 h-4" />} label="Logs" />
          <TabButton active={activeTab === 'docs'} onClick={() => setActiveTab('docs')} icon={<BookOpen className="w-4 h-4" />} label="Docs" />
          <TabButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={<Settings className="w-4 h-4" />} label="Settings" />
        </nav>
      </header>

      <main className="flex-grow">
        {!modelsLoaded ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
             {loadingError ? (
               <div className="text-red-400 bg-red-400/10 px-6 py-4 rounded-xl border border-red-500/20 text-center">
                 {loadingError}
               </div>
             ) : (
               <>
                 <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
                 <p className="text-slate-400 animate-pulse font-medium">Loading Neural Models...</p>
                 <p className="text-xs text-slate-500 text-center max-w-sm mt-2">Downloading TinyFaceDetector, RecognitionNet, and LandmarkNet (approx. 7MB)</p>
               </>
             )}
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'scan' && (
              <RecognitionView 
                registeredFaces={registeredFaces} 
                onRecognize={handleRecognize} 
                autoMarkAttendance={settings.autoMarkAttendance}
              />
            )}
            {activeTab === 'enroll' && (
              <EnrollmentView onEnroll={handleEnroll} />
            )}
            {activeTab === 'logs' && (
              <AttendanceLogs 
                records={attendanceLogs} 
                onClear={() => {
                  if (confirm('Are you sure you want to clear all attendance logs?')) {
                    setAttendanceLogs([]);
                  }
                }} 
              />
            )}
            {activeTab === 'docs' && (
              <DocumentationView />
            )}
            {activeTab === 'settings' && (
              <SettingsView settings={settings} onUpdateSettings={setSettings} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
        active 
          ? 'bg-indigo-600 text-white shadow-sm' 
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

